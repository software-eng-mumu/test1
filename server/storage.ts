import { photos, users, type User, type InsertUser, type Photo, type InsertPhoto } from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createPgSessionStore from "connect-pg-simple";

const PostgresStore = createPgSessionStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPhoto(photo: InsertPhoto & { userId: number }): Promise<Photo>;
  getPhoto(id: number): Promise<Photo | undefined>;
  getPhotosByUserId(userId: number): Promise<Photo[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // 创建会话存储，使用pool直接连接数据库
    this.sessionStore = new PostgresStore({
      pool: pool,
      createTableIfMissing: true,
    });
  }

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

  async createPhoto(insertPhoto: InsertPhoto & { userId: number }): Promise<Photo> {
    const [photo] = await db.insert(photos).values({
      userId: insertPhoto.userId,
      filename: insertPhoto.filename,
      metadata: insertPhoto.metadata
    }).returning();
    return photo;
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }

  async getPhotosByUserId(userId: number): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.userId, userId));
  }
}

// 导出数据库存储实例
export const storage = new DatabaseStorage();