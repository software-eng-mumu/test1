import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  metadata: json("metadata").$type<{
    tags: string[];
    uploadDate: string;
    description?: string;
    event?: string;
    location?: string;
    captionText?: string;
  }>().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  filename: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

// 视频生成选项的类型定义
export const videoOptionsSchema = z.object({
  photoIds: z.array(z.number()),
  music: z.string().optional(),
  transition: z.enum(['fade', 'slide', 'zoom']),
  duration: z.number().min(1).max(10),
  title: z.string().optional(),
  sortBy: z.enum(['uploadDate', 'event', 'custom']),
  captions: z.boolean(),
});

export type VideoOptions = z.infer<typeof videoOptionsSchema>;