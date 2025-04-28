import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertQuoteSchema, updateQuoteSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Rate limiting middleware for quotes
const quoteRateLimiter = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "חובה להתחבר כדי ליצור הצעת מחיר" });
  }
  
  const userId = req.user.id;
  
  // Get current month range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Check monthly quota (50 quotes per month)
  const monthlyQuoteCount = await storage.getQuoteCount(userId, firstDay, lastDay);
  
  if (monthlyQuoteCount >= 50) {
    return res.status(429).json({ 
      message: "הגעת למכסת ההצעות החודשית (50 הצעות). אנא שדרג את המנוי או נסה שוב בחודש הבא." 
    });
  }
  
  next();
};

// Auth check middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "לא מחובר" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Quote routes
  app.post("/api/quotes", quoteRateLimiter, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const quoteData = insertQuoteSchema.parse(req.body);
      
      const quote = await storage.createQuote(userId, quoteData);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  app.get("/api/quotes", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const quotes = await storage.getQuotesByUserId(userId);
    res.json(quotes);
  });
  
  app.get("/api/quotes/recent", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;
    const quotes = await storage.getQuotesByUserId(userId, limit);
    res.json(quotes);
  });
  
  app.get("/api/quotes/:id", isAuthenticated, async (req, res) => {
    const quoteId = parseInt(req.params.id);
    const quote = await storage.getQuote(quoteId);
    
    if (!quote) {
      return res.status(404).json({ message: "הצעת המחיר לא נמצאה" });
    }
    
    // Check if the quote belongs to the current user
    if (quote.userId !== req.user.id) {
      return res.status(403).json({ message: "אין לך גישה להצעת מחיר זו" });
    }
    
    res.json(quote);
  });
  
  app.patch("/api/quotes/:id", isAuthenticated, async (req, res, next) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ message: "הצעת המחיר לא נמצאה" });
      }
      
      // Check if the quote belongs to the current user
      if (quote.userId !== req.user.id) {
        return res.status(403).json({ message: "אין לך גישה להצעת מחיר זו" });
      }
      
      const updateData = updateQuoteSchema.parse(req.body);
      const updatedQuote = await storage.updateQuote(quoteId, updateData);
      
      res.json(updatedQuote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  app.delete("/api/quotes/:id", isAuthenticated, async (req, res) => {
    const quoteId = parseInt(req.params.id);
    const quote = await storage.getQuote(quoteId);
    
    if (!quote) {
      return res.status(404).json({ message: "הצעת המחיר לא נמצאה" });
    }
    
    // Check if the quote belongs to the current user
    if (quote.userId !== req.user.id) {
      return res.status(403).json({ message: "אין לך גישה להצעת מחיר זו" });
    }
    
    await storage.deleteQuote(quoteId);
    res.status(204).send();
  });
  
  // User profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    // Get the user profile (password excluded in auth.ts)
    res.json(req.user);
  });
  
  app.patch("/api/profile", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const { 
      firstName, lastName, businessName, phone, 
      address, website, logoUrl 
    } = req.body;
    
    // Only allow updating specific fields
    const updatedUser = await storage.updateUser(userId, {
      firstName, lastName, businessName, phone, 
      address, website, logoUrl
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "משתמש לא נמצא" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });
  
  // Statistics routes
  app.get("/api/statistics", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    
    // Get current month range
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get quotes for this month
    const quotes = await storage.getQuotesByUserId(userId);
    const monthlyQuotes = quotes.filter(
      q => new Date(q.createdAt) >= firstDay && new Date(q.createdAt) <= lastDay
    );
    
    // Calculate success rate (quotes with status 'approved' / all sent quotes)
    const sentQuotes = quotes.filter(q => q.status !== 'draft');
    const approvedQuotes = quotes.filter(q => q.status === 'approved');
    const successRate = sentQuotes.length > 0 
      ? Math.round((approvedQuotes.length / sentQuotes.length) * 100) 
      : 0;
    
    // Calculate total revenue from approved quotes
    const totalRevenue = approvedQuotes.reduce((sum, quote) => {
      return sum + (quote.price || 0);
    }, 0);
    
    res.json({
      totalQuotes: quotes.length,
      monthlyQuotes: monthlyQuotes.length,
      monthlyLimit: 50,
      successRate,
      totalRevenue
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
