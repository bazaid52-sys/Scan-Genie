import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // Optional for anonymous scans
  content: text("content").notNull(),
  format: text("format").notNull(), // 'qr', 'barcode', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScanSchema = createInsertSchema(scans).omit({ 
  id: true,
  userId: true, 
  createdAt: true 
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;
export type CreateScanRequest = InsertScan;
export type ScanResponse = Scan;
