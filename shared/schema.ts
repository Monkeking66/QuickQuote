import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  businessName: text("business_name"),
  phone: text("phone"),
  address: text("address"),
  website: text("website"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  quotesCreatedCount: integer("quotes_created_count").default(0),
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionEndDate: timestamp("subscription_end_date"),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  projectDescription: text("project_description"),
  estimatedHours: integer("estimated_hours"),
  price: integer("price"),
  includeVat: boolean("include_vat").default(true),
  templateStyle: text("template_style").default("professional"),
  status: text("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
  pdfUrl: text("pdf_url"),
  additionalDetails: jsonb("additional_details"),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  businessName: true,
}).extend({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

export const loginUserSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(1, 'נא להזין סיסמה'),
});

// Quote schemas
export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  pdfUrl: true,
}).extend({
  clientName: z.string().min(1, 'נא להזין שם לקוח'),
  estimatedHours: z.number().optional(),
  price: z.number().optional(),
});

export const updateQuoteSchema = insertQuoteSchema.partial();

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type UpdateQuote = z.infer<typeof updateQuoteSchema>;
