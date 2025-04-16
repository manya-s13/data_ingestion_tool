import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { clickhouseClient } from "./clickhouse";
import { flatFileHandler } from "./flatfile";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  IngestRequestSchema,
  ClickHouseConfigSchema,
  FlatFileConfigSchema,
  InsertIngestJob
} from "@shared/schema";
import { storage } from "./storage";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "You must be logged in to access this resource" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // ClickHouse routes
  app.post("/api/clickhouse/tables", async (req, res) => {
    try {
      const schema = z.object({
        clickhouseConfig: ClickHouseConfigSchema
      });
      
      const { clickhouseConfig } = schema.parse(req.body);
      const tables = await clickhouseClient.getTables(clickhouseConfig);
      
      res.json({ tables });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to get tables" });
    }
  });

  app.post("/api/clickhouse/columns", async (req, res) => {
    try {
      const schema = z.object({
        clickhouseConfig: ClickHouseConfigSchema,
        table: z.string()
      });
      
      const { clickhouseConfig, table } = schema.parse(req.body);
      const columns = await clickhouseClient.getColumns(clickhouseConfig, table);
      
      res.json({ columns });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to get columns" });
    }
  });

  app.post("/api/clickhouse/preview", async (req, res) => {
    try {
      const schema = z.object({
        clickhouseConfig: ClickHouseConfigSchema,
        table: z.string(),
        selectedColumns: z.array(z.string())
      });
      
      const { clickhouseConfig, table, selectedColumns } = schema.parse(req.body);
      const preview = await clickhouseClient.previewData(clickhouseConfig, table, selectedColumns);
      
      res.json({ preview });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to preview data" });
    }
  });

  // Flat File routes
  app.post("/api/flatfile/tables", async (req, res) => {
    try {
      const schema = z.object({
        flatFileConfig: FlatFileConfigSchema
      });
      
      const { flatFileConfig } = schema.parse(req.body);
      const tables = await flatFileHandler.getTables(flatFileConfig);
      
      res.json({ tables });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to get tables" });
    }
  });

  app.post("/api/flatfile/columns", async (req, res) => {
    try {
      const schema = z.object({
        flatFileConfig: FlatFileConfigSchema,
        table: z.string()
      });
      
      const { flatFileConfig, table } = schema.parse(req.body);
      const columns = await flatFileHandler.getColumns(flatFileConfig, table);
      
      res.json({ columns });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to get columns" });
    }
  });

  app.post("/api/flatfile/preview", async (req, res) => {
    try {
      const schema = z.object({
        flatFileConfig: FlatFileConfigSchema,
        table: z.string(),
        selectedColumns: z.array(z.string())
      });
      
      const { flatFileConfig, table, selectedColumns } = schema.parse(req.body);
      const preview = await flatFileHandler.previewData(flatFileConfig, table, selectedColumns);
      
      res.json({ preview });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to preview data" });
    }
  });

  // Ingestion route
  app.post("/api/ingest", async (req: any, res) => {
    try {
      const requestData = IngestRequestSchema.parse(req.body);
      let ingestJob = null;
      
      // Create an ingest job record if user is authenticated
      if (req.isAuthenticated()) {
        ingestJob = await storage.createIngestJob({
          userId: req.user.id,
          direction: requestData.direction,
          sourceTable: requestData.table || "",
          targetFilename: requestData.flatFileConfig.filename,
          columnsSelected: requestData.selectedColumns,
          status: "in_progress",
          recordsProcessed: null,
          errorMessage: null,
        });
      }
      
      let result;
      
      if (requestData.direction === "clickhouse_to_flatfile") {
        result = await clickhouseClient.exportToFlatFile(
          requestData.clickhouseConfig,
          requestData.flatFileConfig,
          requestData.table || "",
          requestData.selectedColumns
        );
      } else {
        // flatfile_to_clickhouse
        result = await flatFileHandler.importToClickHouse(
          requestData.flatFileConfig,
          requestData.clickhouseConfig,
          requestData.table || "",
          requestData.selectedColumns
        );
      }
      
      // Update the ingest job if it was created
      if (ingestJob) {
        await storage.updateIngestJob(ingestJob.id, {
          status: result.success ? "completed" : "failed",
          recordsProcessed: result.recordsProcessed || 0,
          errorMessage: result.error || null,
          completedAt: new Date()
        });
      }
      
      res.json(result);
    } catch (error: any) {
      // If user is authenticated, record the failure
      if (req.isAuthenticated() && req.ingestJobId) {
        await storage.updateIngestJob(req.ingestJobId, {
          status: "failed",
          errorMessage: error.message || "Failed to process ingestion",
          completedAt: new Date()
        });
      }
      
      res.status(400).json({ 
        success: false, 
        error: error.message || "Failed to process ingestion" 
      });
    }
  });

  // Protected routes for logged-in users
  // Save configuration
  app.post("/api/configurations", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1, "Name is required"),
        direction: z.enum(["clickhouse_to_flatfile", "flatfile_to_clickhouse"]),
        clickhouseConfig: ClickHouseConfigSchema,
        flatFileConfig: FlatFileConfigSchema
      });
      
      const configData = schema.parse(req.body);
      
      const savedConfig = await storage.createSavedConfiguration({
        userId: req.user.id,
        name: configData.name,
        direction: configData.direction,
        clickhouseConfig: configData.clickhouseConfig,
        flatFileConfig: configData.flatFileConfig
      });
      
      res.status(201).json(savedConfig);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to save configuration" });
    }
  });
  
  // Get all saved configurations for current user
  app.get("/api/configurations", isAuthenticated, async (req: any, res) => {
    try {
      const configs = await storage.getSavedConfigurations(req.user.id);
      res.json(configs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get configurations" });
    }
  });
  
  // Get single configuration
  app.get("/api/configurations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const configId = parseInt(req.params.id);
      if (isNaN(configId)) {
        return res.status(400).json({ error: "Invalid configuration ID" });
      }
      
      const config = await storage.getSavedConfiguration(configId);
      
      if (!config) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      // Check ownership
      if (config.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to access this configuration" });
      }
      
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get configuration" });
    }
  });
  
  // Update configuration
  app.put("/api/configurations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const configId = parseInt(req.params.id);
      if (isNaN(configId)) {
        return res.status(400).json({ error: "Invalid configuration ID" });
      }
      
      // Check if configuration exists and belongs to user
      const existingConfig = await storage.getSavedConfiguration(configId);
      if (!existingConfig) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      if (existingConfig.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to modify this configuration" });
      }
      
      // Validate update data
      const schema = z.object({
        name: z.string().min(1, "Name is required").optional(),
        direction: z.enum(["clickhouse_to_flatfile", "flatfile_to_clickhouse"]).optional(),
        clickhouseConfig: ClickHouseConfigSchema.optional(),
        flatFileConfig: FlatFileConfigSchema.optional()
      });
      
      const updateData = schema.parse(req.body);
      
      // Update the configuration
      const updatedConfig = await storage.updateSavedConfiguration(configId, updateData);
      
      res.json(updatedConfig);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update configuration" });
    }
  });
  
  // Delete configuration
  app.delete("/api/configurations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const configId = parseInt(req.params.id);
      if (isNaN(configId)) {
        return res.status(400).json({ error: "Invalid configuration ID" });
      }
      
      // Check if configuration exists and belongs to user
      const existingConfig = await storage.getSavedConfiguration(configId);
      if (!existingConfig) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      if (existingConfig.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to delete this configuration" });
      }
      
      // Delete the configuration
      await storage.deleteSavedConfiguration(configId);
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete configuration" });
    }
  });
  
  // Record ingest job start
  app.post("/api/ingest-jobs", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        direction: z.enum(["clickhouse_to_flatfile", "flatfile_to_clickhouse"]),
        sourceTable: z.string().min(1, "Source table is required"),
        targetFilename: z.string().optional(),
        columnsSelected: z.array(z.string()).min(1, "At least one column must be selected"),
      });
      
      const jobData = schema.parse(req.body);
      
      const ingestJob = await storage.createIngestJob({
        userId: req.user.id,
        direction: jobData.direction,
        sourceTable: jobData.sourceTable,
        targetFilename: jobData.targetFilename || null,
        columnsSelected: jobData.columnsSelected,
        status: "in_progress",
        recordsProcessed: null,
        errorMessage: null,
      });
      
      res.status(201).json(ingestJob);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create ingest job" });
    }
  });
  
  // Update ingest job status
  app.put("/api/ingest-jobs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }
      
      // Check if job exists and belongs to user
      const existingJob = await storage.getIngestJob(jobId);
      if (!existingJob) {
        return res.status(404).json({ error: "Ingest job not found" });
      }
      
      if (existingJob.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to modify this job" });
      }
      
      // Validate update data
      const schema = z.object({
        status: z.enum(["completed", "failed", "in_progress"]).optional(),
        recordsProcessed: z.number().optional(),
        errorMessage: z.string().optional(),
        completedAt: z.date().optional()
      });
      
      const updateData = schema.parse(req.body);
      
      // Update the job
      const updatedJob = await storage.updateIngestJob(jobId, updateData);
      
      res.json(updatedJob);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update ingest job" });
    }
  });
  
  // Get ingest job history for current user
  app.get("/api/ingest-jobs", isAuthenticated, async (req: any, res) => {
    try {
      const jobs = await storage.getIngestJobs(req.user.id);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get ingest jobs" });
    }
  });
  
  // Get single ingest job
  app.get("/api/ingest-jobs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }
      
      const job = await storage.getIngestJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Ingest job not found" });
      }
      
      // Check ownership
      if (job.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to access this job" });
      }
      
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get ingest job" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
