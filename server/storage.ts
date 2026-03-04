import { db } from "./db";
import {
  scans,
  type CreateScanRequest,
  type ScanResponse
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getScans(userId: string): Promise<ScanResponse[]>;
  createScan(userId: string, scan: CreateScanRequest): Promise<ScanResponse>;
  deleteScan(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getScans(userId: string): Promise<ScanResponse[]> {
    return await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt));
  }

  async createScan(userId: string, scan: CreateScanRequest): Promise<ScanResponse> {
    const [created] = await db
      .insert(scans)
      .values({ ...scan, userId })
      .returning();
    return created;
  }

  async deleteScan(id: number): Promise<void> {
    await db.delete(scans).where(eq(scans.id, id));
  }
}

export const storage = new DatabaseStorage();
