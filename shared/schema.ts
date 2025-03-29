import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  dob: text("date_of_birth"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  incomeRange: text("income_range"),
  requestIncomeBased: boolean("request_income_based").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dob: true,
  address: true,
  city: true,
  province: true,
  postalCode: true,
  incomeRange: true,
  requestIncomeBased: true,
});

// Document templates
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  applicableProvinces: text("applicable_provinces").array().notNull(),
  basePrice: doublePrecision("base_price").notNull(),
  templateContent: text("template_content").notNull(),
  previewImageUrl: text("preview_image_url"),
  requiredFields: json("required_fields").notNull(),
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).pick({
  name: true,
  description: true,
  category: true,
  applicableProvinces: true,
  basePrice: true,
  templateContent: true,
  previewImageUrl: true,
  requiredFields: true,
});

// User documents
export const userDocuments = pgTable("user_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateId: integer("template_id").notNull().references(() => documentTemplates.id),
  documentData: json("document_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  finalPrice: doublePrecision("final_price").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  documentPath: text("document_path"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  supportingDocuments: text("supporting_documents"),
});

export const insertUserDocumentSchema = createInsertSchema(userDocuments).pick({
  userId: true,
  templateId: true,
  documentData: true,
  finalPrice: true,
});

// Income verification requests
export const incomeVerifications = pgTable("income_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"),
  verificationDocumentPath: text("verification_document_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIncomeVerificationSchema = createInsertSchema(incomeVerifications).pick({
  userId: true,
  verificationDocumentPath: true,
  notes: true,
});

// Export all types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

export type InsertUserDocument = z.infer<typeof insertUserDocumentSchema>;
export type UserDocument = typeof userDocuments.$inferSelect;

export type InsertIncomeVerification = z.infer<typeof insertIncomeVerificationSchema>;
export type IncomeVerification = typeof incomeVerifications.$inferSelect;

// Form schemas for validation
export const userInfoFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  incomeRange: z.string().optional(),
  requestIncomeBased: z.boolean().optional(),
});

export type UserInfoFormValues = z.infer<typeof userInfoFormSchema>;

// Document pricing tiers based on income
export const pricingTiers = [
  { incomeRange: "belowLIPThreshold", discountPercentage: 100 },
  { incomeRange: "0-30000", discountPercentage: 75 },
  { incomeRange: "30001-50000", discountPercentage: 50 },
  { incomeRange: "50001-75000", discountPercentage: 25 },
  { incomeRange: "75001-100000", discountPercentage: 10 },
  { incomeRange: "above100000", discountPercentage: 0 }
];

// Dispute categories
export const disputeCategories = [
  { id: "childrens-aid", name: "Children's Aid Societies", description: "Disputes related to children's protection services and custody matters" },
  { id: "landlord-tenant", name: "Landlord-Tenant Issues", description: "Disputes with landlords, tenancy agreements, evictions, and rental issues" },
  { id: "equifax", name: "Equifax Disputes", description: "Disputes related to credit reports, errors, and information corrections" },
  { id: "transition", name: "Transition Services", description: "Disputes related to social services during life transitions" }
];

// Canadian provinces
export const provinces = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" }
];
