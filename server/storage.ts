import { User, InsertUser, Photo, InsertPhoto } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPhoto(photo: InsertPhoto & { userId: number }): Promise<Photo>;
  getPhoto(id: number): Promise<Photo | undefined>;
  getPhotosByUserId(userId: number): Promise<Photo[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private photos: Map<number, Photo>;
  private currentUserId: number;
  private currentPhotoId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.photos = new Map();
    this.currentUserId = 1;
    this.currentPhotoId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPhoto(insertPhoto: InsertPhoto & { userId: number }): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo = { ...insertPhoto, id };
    this.photos.set(id, photo);
    return photo;
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async getPhotosByUserId(userId: number): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(
      (photo) => photo.userId === userId,
    );
  }
}

export const storage = new MemStorage();
