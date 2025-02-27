import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { spawn } from "child_process";
import fs from "fs/promises";
import { randomBytes } from "crypto";

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

  app.post("/api/generate-video", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { photoIds } = req.body;
    if (!Array.isArray(photoIds) || photoIds.length < 2) {
      return res.status(400).send("Need at least 2 photos");
    }

    try {
      // 验证所有图片属于当前用户
      const photos = await Promise.all(
        photoIds.map(id => storage.getPhoto(id))
      );

      if (photos.some(photo => !photo || photo.userId !== req.user.id)) {
        return res.status(403).send("Unauthorized access to photos");
      }

      // 创建临时文件列表
      const tempDir = path.join(process.cwd(), "temp");
      await fs.mkdir(tempDir, { recursive: true });

      const listPath = path.join(tempDir, `${randomBytes(8).toString("hex")}.txt`);
      const outputPath = path.join(tempDir, `${randomBytes(8).toString("hex")}.mp4`);

      // 创建图片列表文件
      const fileContent = photos.map(photo => 
        `file '${path.join(process.cwd(), "uploads", photo.filename)}'`
      ).join("\n");
      await fs.writeFile(listPath, fileContent);

      // 使用ffmpeg生成视频
      const ffmpeg = spawn("ffmpeg", [
        "-f", "concat",
        "-safe", "0",
        "-i", listPath,
        "-vf", "fade=t=in:st=0:d=1,fade=t=out:st=4:d=1",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        outputPath
      ]);

      // 等待ffmpeg完成
      await new Promise((resolve, reject) => {
        ffmpeg.on("error", reject);
        ffmpeg.on("close", (code) => {
          if (code === 0) resolve(code);
          else reject(new Error(`FFmpeg process exited with code ${code}`));
        });
      });

      // 发送视频文件
      res.sendFile(outputPath, async (err) => {
        // 清理临时文件
        await Promise.all([
          fs.unlink(listPath).catch(() => {}),
          fs.unlink(outputPath).catch(() => {})
        ]);
      });
    } catch (error) {
      console.error("Video generation error:", error);
      res.status(500).send("Failed to generate video");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}