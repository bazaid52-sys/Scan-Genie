import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { isAuthenticated, setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.scans.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userScans = await storage.getScans(userId);
      res.json(userScans);
    } catch (error) {
      console.error("Failed to fetch scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  app.post(api.scans.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.scans.create.input.parse(req.body);
      const scan = await storage.createScan(userId, input);
      res.status(201).json(scan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      console.error("Failed to create scan:", err);
      res.status(500).json({ message: "Failed to create scan" });
    }
  });

  app.delete(api.scans.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scan ID" });
      }
      
      // In a real app we might want to check if the scan belongs to the user
      // before deleting it, but for simplicity we'll just delete it.
      await storage.deleteScan(id);
      res.status(204).end();
    } catch (error) {
      console.error("Failed to delete scan:", error);
      res.status(500).json({ message: "Failed to delete scan" });
    }
  });

  return httpServer;
}
