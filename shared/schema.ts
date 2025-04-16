import { pgTable, text, serial, integer, boolean, json, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Original user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  ingestJobs: many(ingestJobs),
  savedConfigurations: many(savedConfigurations),
}));

// Direction enum for database
export const directionEnum = pgEnum('direction', ['clickhouse_to_flatfile', 'flatfile_to_clickhouse']);

// Ingestion job history table
export const ingestJobs = pgTable("ingest_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  direction: directionEnum("direction").notNull(),
  sourceTable: text("source_table").notNull(),
  targetFilename: text("target_filename"),
  columnsSelected: json("columns_selected").notNull(),
  recordsProcessed: integer("records_processed"),
  status: text("status").notNull(), // "completed", "failed", "in_progress"
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type IngestJob = typeof ingestJobs.$inferSelect;
export const insertIngestJobSchema = createInsertSchema(ingestJobs).omit({ 
  id: true,
  startedAt: true,
  completedAt: true,
});
export type InsertIngestJob = z.infer<typeof insertIngestJobSchema>;

export const ingestJobRelations = relations(ingestJobs, ({ one }) => ({
  user: one(users, {
    fields: [ingestJobs.userId],
    references: [users.id],
  }),
}));

// Saved configurations table
export const savedConfigurations = pgTable("saved_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  direction: directionEnum("direction").notNull(),
  clickhouseConfig: json("clickhouse_config").notNull(),
  flatFileConfig: json("flat_file_config").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SavedConfiguration = typeof savedConfigurations.$inferSelect;
export const insertSavedConfigurationSchema = createInsertSchema(savedConfigurations).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSavedConfiguration = z.infer<typeof insertSavedConfigurationSchema>;

export const savedConfigurationRelations = relations(savedConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [savedConfigurations.userId],
    references: [users.id],
  }),
}));

// Data ingestion schemas
export const DataSourceEnum = z.enum(['clickhouse', 'flatfile']);
export type DataSource = z.infer<typeof DataSourceEnum>;

export const DirectionEnum = z.enum(['clickhouse_to_flatfile', 'flatfile_to_clickhouse']);
export type Direction = z.infer<typeof DirectionEnum>;

export const ClickHouseConfigSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  database: z.string().min(1, "Database is required"),
  user: z.string().min(1, "User is required"),
  password: z.string().min(1, "Password is required")
});
export type ClickHouseConfig = z.infer<typeof ClickHouseConfigSchema>;

export const FlatFileConfigSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  delimiter: z.string().min(1, "Delimiter is required")
});
export type FlatFileConfig = z.infer<typeof FlatFileConfigSchema>;

export const ColumnInfoSchema = z.object({
  name: z.string(),
  type: z.string()
});
export type ColumnInfo = z.infer<typeof ColumnInfoSchema>;

export const TableDataSchema = z.record(z.string(), z.any());
export type TableData = z.infer<typeof TableDataSchema>;

export const IngestRequestSchema = z.object({
  sourceType: DataSourceEnum,
  direction: DirectionEnum,
  clickhouseConfig: ClickHouseConfigSchema,
  flatFileConfig: FlatFileConfigSchema,
  table: z.string().optional(),
  selectedColumns: z.array(z.string())
});
export type IngestRequest = z.infer<typeof IngestRequestSchema>;

export const IngestResultSchema = z.object({
  success: z.boolean(),
  recordsProcessed: z.number().optional(),
  message: z.string().optional(),
  error: z.string().optional()
});
export type IngestResult = z.infer<typeof IngestResultSchema>;
