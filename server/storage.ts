import { 
  users, type User, type InsertUser,
  ingestJobs, type IngestJob, type InsertIngestJob,
  savedConfigurations, type SavedConfiguration, type InsertSavedConfiguration
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Extend the interface with any CRUD methods we need
export interface IStorage {
  // User-related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ingestion job methods
  createIngestJob(job: InsertIngestJob): Promise<IngestJob>;
  getIngestJobs(userId: number): Promise<IngestJob[]>;
  getIngestJob(id: number): Promise<IngestJob | undefined>;
  updateIngestJob(id: number, updates: Partial<IngestJob>): Promise<IngestJob | undefined>;
  
  // Saved configuration methods
  createSavedConfiguration(config: InsertSavedConfiguration): Promise<SavedConfiguration>;
  getSavedConfigurations(userId: number): Promise<SavedConfiguration[]>;
  getSavedConfiguration(id: number): Promise<SavedConfiguration | undefined>;
  updateSavedConfiguration(id: number, updates: Partial<SavedConfiguration>): Promise<SavedConfiguration | undefined>;
  deleteSavedConfiguration(id: number): Promise<boolean>;
  
  // Session store for express-session
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Ingestion job methods
  async createIngestJob(job: InsertIngestJob): Promise<IngestJob> {
    const [newJob] = await db.insert(ingestJobs).values(job).returning();
    return newJob;
  }
  
  async getIngestJobs(userId: number): Promise<IngestJob[]> {
    return db
      .select()
      .from(ingestJobs)
      .where(eq(ingestJobs.userId, userId))
      .orderBy(ingestJobs.startedAt);
  }
  
  async getIngestJob(id: number): Promise<IngestJob | undefined> {
    const [job] = await db.select().from(ingestJobs).where(eq(ingestJobs.id, id));
    return job;
  }
  
  async updateIngestJob(id: number, updates: Partial<IngestJob>): Promise<IngestJob | undefined> {
    const [updatedJob] = await db
      .update(ingestJobs)
      .set(updates)
      .where(eq(ingestJobs.id, id))
      .returning();
    
    return updatedJob;
  }
  
  // Saved configuration methods
  async createSavedConfiguration(config: InsertSavedConfiguration): Promise<SavedConfiguration> {
    const [newConfig] = await db.insert(savedConfigurations).values(config).returning();
    return newConfig;
  }
  
  async getSavedConfigurations(userId: number): Promise<SavedConfiguration[]> {
    return db
      .select()
      .from(savedConfigurations)
      .where(eq(savedConfigurations.userId, userId))
      .orderBy(savedConfigurations.name);
  }
  
  async getSavedConfiguration(id: number): Promise<SavedConfiguration | undefined> {
    const [config] = await db.select().from(savedConfigurations).where(eq(savedConfigurations.id, id));
    return config;
  }
  
  async updateSavedConfiguration(id: number, updates: Partial<SavedConfiguration>): Promise<SavedConfiguration | undefined> {
    // Update the updatedAt timestamp
    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };
    
    const [updatedConfig] = await db
      .update(savedConfigurations)
      .set(updatedData)
      .where(eq(savedConfigurations.id, id))
      .returning();
    
    return updatedConfig;
  }
  
  async deleteSavedConfiguration(id: number): Promise<boolean> {
    const result = await db
      .delete(savedConfigurations)
      .where(eq(savedConfigurations.id, id))
      .returning({ id: savedConfigurations.id });
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
