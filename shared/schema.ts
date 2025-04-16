import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
