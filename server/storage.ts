import { users, User, InsertUser, quotes, Quote, InsertQuote, UpdateQuote } from "@shared/schema";
import session from 'express-session';
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Quote operations
  createQuote(userId: number, quote: InsertQuote): Promise<Quote>;
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByUserId(userId: number, limit?: number): Promise<Quote[]>;
  updateQuote(id: number, data: UpdateQuote): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Usage tracking
  incrementQuoteCount(userId: number): Promise<void>;
  getQuoteCount(userId: number, monthStart?: Date, monthEnd?: Date): Promise<number>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quotes: Map<number, Quote>;
  private userIdCounter: number;
  private quoteIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.quotes = new Map();
    this.userIdCounter = 1;
    this.quoteIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired sessions every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    // Set the trial period to 14 days from now
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    const user: User = {
      id,
      ...insertUser,
      phone: null,
      address: null,
      website: null,
      logoUrl: null,
      createdAt: now,
      quotesCreatedCount: 0,
      subscriptionTier: 'free',
      subscriptionEndDate: trialEndDate,
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Quote operations
  async createQuote(userId: number, quoteData: InsertQuote): Promise<Quote> {
    const id = this.quoteIdCounter++;
    const now = new Date();
    
    const quote: Quote = {
      id,
      userId,
      ...quoteData,
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      pdfUrl: null,
      status: quoteData.status || 'draft',
      additionalDetails: quoteData.additionalDetails || null,
    };
    
    this.quotes.set(id, quote);
    await this.incrementQuoteCount(userId);
    return quote;
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getQuotesByUserId(userId: number, limit?: number): Promise<Quote[]> {
    const userQuotes = Array.from(this.quotes.values())
      .filter(quote => quote.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    if (limit) {
      return userQuotes.slice(0, limit);
    }
    
    return userQuotes;
  }

  async updateQuote(id: number, data: UpdateQuote): Promise<Quote | undefined> {
    const quote = await this.getQuote(id);
    if (!quote) return undefined;
    
    const updatedQuote: Quote = {
      ...quote,
      ...data,
      updatedAt: new Date(),
    };
    
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    return this.quotes.delete(id);
  }

  // Usage tracking
  async incrementQuoteCount(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.quotesCreatedCount = (user.quotesCreatedCount || 0) + 1;
      this.users.set(userId, user);
    }
  }

  async getQuoteCount(userId: number, monthStart?: Date, monthEnd?: Date): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    if (!monthStart || !monthEnd) {
      return user.quotesCreatedCount || 0;
    }
    
    // Count quotes created within the specified month
    return Array.from(this.quotes.values())
      .filter(quote => 
        quote.userId === userId && 
        new Date(quote.createdAt) >= monthStart && 
        new Date(quote.createdAt) <= monthEnd
      ).length;
  }
}

export const storage = new MemStorage();
