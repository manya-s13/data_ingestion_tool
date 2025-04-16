import type { Express } from "express";
import { createServer, type Server } from "http";
import { clickhouseClient } from "./clickhouse";
import { flatFileHandler } from "./flatfile";
import { z } from "zod";
import {
  IngestRequestSchema,
  ClickHouseConfigSchema,
  FlatFileConfigSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.post("/api/ingest", async (req, res) => {
    try {
      const requestData = IngestRequestSchema.parse(req.body);
      
      if (requestData.direction === "clickhouse_to_flatfile") {
        const result = await clickhouseClient.exportToFlatFile(
          requestData.clickhouseConfig,
          requestData.flatFileConfig,
          requestData.table || "",
          requestData.selectedColumns
        );
        
        res.json(result);
      } else {
        // flatfile_to_clickhouse
        const result = await flatFileHandler.importToClickHouse(
          requestData.flatFileConfig,
          requestData.clickhouseConfig,
          requestData.table || "",
          requestData.selectedColumns
        );
        
        res.json(result);
      }
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: error.message || "Failed to process ingestion" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
