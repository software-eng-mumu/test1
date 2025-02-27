import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { storage } from "./storage";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/photos", upload.single("photo"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file || !req.body.metadata) {
      return res.status(400).send("Missing file or metadata");
    }

    const metadata = JSON.parse(req.body.metadata);
    const photo = await storage.createPhoto({
      userId: req.user.id,
      filename: req.file.filename,
      metadata: {
        tags: metadata.tags || [],
        uploadDate: new Date().toISOString(),
      },
    });

    res.status(201).json(photo);
  });

  app.get("/api/photos", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const photos = await storage.getPhotosByUserId(req.user.id);
    res.json(photos);
  });

  app.get("/api/photos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const photo = await storage.getPhoto(parseInt(req.params.id));
    
    if (!photo || photo.userId !== req.user.id) {
      return res.sendStatus(404);
    }

    res.sendFile(path.join(process.cwd(), "uploads", photo.filename));
  });

  const httpServer = createServer(app);
  return httpServer;
}
