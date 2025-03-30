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
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
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

// Document folders for organizing user documents
export const documentFolders = pgTable("document_folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentFolderSchema = createInsertSchema(documentFolders).pick({
  userId: true,
  name: true,
  description: true,
  isDefault: true
});

// Document folder assignments
export const documentFolderAssignments = pgTable("document_folder_assignments", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => userDocuments.id),
  folderId: integer("folder_id").notNull().references(() => documentFolders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentFolderAssignmentSchema = createInsertSchema(documentFolderAssignments).pick({
  documentId: true,
  folderId: true,
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

// Community categories
export const communityCategories = pgTable("community_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityCategorySchema = createInsertSchema(communityCategories).pick({
  name: true,
  description: true,
  icon: true,
  sortOrder: true,
  isActive: true,
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => communityCategories.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  isStory: boolean("is_story").default(false),
  isAdvice: boolean("is_advice").default(false),
  isPinnedByModerator: boolean("is_pinned_by_moderator").default(false),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  userId: true,
  categoryId: true,
  title: true,
  content: true,
  isAnonymous: true,
  isStory: true,
  isAdvice: true,
});

// Community comments
export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  parentCommentId: integer("parent_comment_id"), // Will be manually related to communityComments.id
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).pick({
  postId: true,
  userId: true,
  content: true,
  isAnonymous: true,
  parentCommentId: true,
});

// Community post likes
export const communityPostLikes = pgTable("community_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityPostLikeSchema = createInsertSchema(communityPostLikes).pick({
  postId: true,
  userId: true,
});

// Community comment likes
export const communityCommentLikes = pgTable("community_comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull().references(() => communityComments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityCommentLikeSchema = createInsertSchema(communityCommentLikes).pick({
  commentId: true,
  userId: true,
});

// Community bookmarks
export const communityBookmarks = pgTable("community_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityBookmarkSchema = createInsertSchema(communityBookmarks).pick({
  userId: true,
  postId: true,
});

// User roles for community moderation
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'user', 'moderator', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).pick({
  userId: true,
  role: true,
});

// Marketing funnel events
export const marketingFunnelEvents = pgTable("marketing_funnel_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  eventName: text("event_name").notNull(),
  funnelName: text("funnel_name").notNull(),
  stepName: text("step_name").notNull(),
  stepNumber: integer("step_number").notNull(),
  conversionValue: doublePrecision("conversion_value"),
  path: text("path"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketingFunnelEventSchema = createInsertSchema(marketingFunnelEvents).pick({
  userId: true,
  eventName: true,
  funnelName: true,
  stepName: true,
  stepNumber: true,
  conversionValue: true,
  path: true,
  referrer: true,
  userAgent: true,
  ipAddress: true,
  metadata: true,
});

// Marketing leads
export const marketingLeads = pgTable("marketing_leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  resourceRequested: text("resource_requested"),
  funnelSource: text("funnel_source"),
  message: text("message"),
  convertedToUser: boolean("converted_to_user").default(false),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingLeadSchema = createInsertSchema(marketingLeads).pick({
  email: true,
  name: true,
  resourceRequested: true,
  funnelSource: true,
  message: true,
});

// Evidence table for storing uploaded evidence
export const evidenceFiles = pgTable("evidence_files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  description: text("description"),
  tags: text("tags").array(),
  analyzedContent: text("analyzed_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEvidenceFileSchema = createInsertSchema(evidenceFiles).pick({
  userId: true,
  fileName: true,
  originalName: true,
  filePath: true,
  fileType: true,
  fileSize: true,
  description: true,
  tags: true,
});

// Case analysis table for storing form recommendations and merit assessments
export const caseAnalyses = pgTable("case_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  evidenceIds: integer("evidence_ids").array().notNull(),
  caseSummary: text("case_summary").notNull(),
  recommendedForms: json("recommended_forms").notNull(),
  isPremiumAssessment: boolean("is_premium_assessment").default(false),
  meritScore: integer("merit_score"),
  meritAssessment: text("merit_assessment"),
  meritFactors: json("merit_factors"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCaseAnalysisSchema = createInsertSchema(caseAnalyses).pick({
  userId: true,
  evidenceIds: true,
  caseSummary: true,
  recommendedForms: true,
  isPremiumAssessment: true,
  meritScore: true,
  meritAssessment: true,
  meritFactors: true,
});

// Export all types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

export type InsertUserDocument = z.infer<typeof insertUserDocumentSchema>;
export type UserDocument = typeof userDocuments.$inferSelect;

export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;
export type DocumentFolder = typeof documentFolders.$inferSelect;

export type InsertDocumentFolderAssignment = z.infer<typeof insertDocumentFolderAssignmentSchema>;
export type DocumentFolderAssignment = typeof documentFolderAssignments.$inferSelect;

export type InsertIncomeVerification = z.infer<typeof insertIncomeVerificationSchema>;
export type IncomeVerification = typeof incomeVerifications.$inferSelect;

export type InsertEvidenceFile = z.infer<typeof insertEvidenceFileSchema>;
export type EvidenceFile = typeof evidenceFiles.$inferSelect;

export type InsertCaseAnalysis = z.infer<typeof insertCaseAnalysisSchema>;
export type CaseAnalysis = typeof caseAnalyses.$inferSelect;

// Community types
export type InsertCommunityCategory = z.infer<typeof insertCommunityCategorySchema>;
export type CommunityCategory = typeof communityCategories.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;

export type InsertCommunityPostLike = z.infer<typeof insertCommunityPostLikeSchema>;
export type CommunityPostLike = typeof communityPostLikes.$inferSelect;

export type InsertCommunityCommentLike = z.infer<typeof insertCommunityCommentLikeSchema>;
export type CommunityCommentLike = typeof communityCommentLikes.$inferSelect;

export type InsertCommunityBookmark = z.infer<typeof insertCommunityBookmarkSchema>;
export type CommunityBookmark = typeof communityBookmarks.$inferSelect;

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// Marketing funnel types
export type InsertMarketingFunnelEvent = z.infer<typeof insertMarketingFunnelEventSchema>;
export type MarketingFunnelEvent = typeof marketingFunnelEvents.$inferSelect;

export type InsertMarketingLead = z.infer<typeof insertMarketingLeadSchema>;
export type MarketingLead = typeof marketingLeads.$inferSelect;

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
