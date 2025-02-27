import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { spawn } from "child_process";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { videoOptionsSchema } from "@shared/schema";

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
        description: metadata.description,
        event: metadata.event,
        location: metadata.location,
        captionText: metadata.captionText,
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

    try {
      const options = videoOptionsSchema.parse(req.body);

      // 获取并验证所有图片
      let photos = await Promise.all(
        options.photoIds.map(id => storage.getPhoto(id))
      );

      // 验证所有权
      if (photos.some(photo => !photo || photo.userId !== req.user.id)) {
        return res.status(403).send("Unauthorized access to photos");
      }

      photos = photos.filter((photo): photo is NonNullable<typeof photo> => photo !== undefined);

      // 根据选择的排序方式排序照片
      switch (options.sortBy) {
        case 'uploadDate':
          photos.sort((a, b) => 
            new Date(a.metadata.uploadDate).getTime() - new Date(b.metadata.uploadDate).getTime()
          );
          break;
        case 'event':
          photos.sort((a, b) => 
            (a.metadata.event || '').localeCompare(b.metadata.event || '')
          );
          break;
        // custom顺序使用传入的photoIds的顺序
      }

      // 创建临时目录
      const tempDir = path.join(process.cwd(), "temp");
      await fs.mkdir(tempDir, { recursive: true });

      const listPath = path.join(tempDir, `${randomBytes(8).toString("hex")}.txt`);
      const outputPath = path.join(tempDir, `${randomBytes(8).toString("hex")}.mp4`);

      // 创建图片列表文件
      const fileContent = photos.map(photo => 
        `file '${path.join(process.cwd(), "uploads", photo.filename)}'`
      ).join("\n");
      await fs.writeFile(listPath, fileContent);

      // 构建ffmpeg命令
      const ffmpegArgs = [
        "-f", "concat",
        "-safe", "0",
        "-i", listPath,
      ];

      // 添加转场效果
      let filterComplex = "";
      switch (options.transition) {
        case 'fade':
          filterComplex = `fade=t=in:st=0:d=1,fade=t=out:st=${options.duration-1}:d=1`;
          break;
        case 'slide':
          filterComplex = `xfade=transition=slideleft:duration=1`;
          break;
        case 'zoom':
          filterComplex = `zoompan=z='min(zoom+0.0015,1.5)':d=${options.duration}`;
          break;
      }

      if (filterComplex) {
        ffmpegArgs.push("-vf", filterComplex);
      }

      // 设置编码选项
      ffmpegArgs.push(
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        outputPath
      );

      // 使用ffmpeg生成视频
      const ffmpeg = spawn("ffmpeg", ffmpegArgs);

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