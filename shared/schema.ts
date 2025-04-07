import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision, jsonb } from "drizzle-orm/pg-core";
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
  isTemporary: boolean("is_temporary").default(false),
  credits: integer("credits").default(0),
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  paymentId: text("payment_id"),
  paymentMethod: text("payment_method").notNull(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("CAD"),
  status: text("status").notNull(),
  transactionDate: text("transaction_date").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).pick({
  userId: true,
  paymentId: true,
  paymentMethod: true,
  amount: true,
  currency: true,
  status: true,
  transactionDate: true,
  metadata: true,
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
  isTemporary: true,
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
// Payment records
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("CAD"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(), // stripe, paypal, etc
  paymentMethodId: text("payment_method_id"), // External payment system ID
  paymentType: text("payment_type").notNull(), // one_time, subscription, etc
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull(),
  status: text("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  paymentMethodId: text("payment_method_id"),
  priceId: text("price_id").notNull(),
  quantity: integer("quantity").default(1),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("CAD"),
  status: text("status").notNull().default("draft"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  invoiceNumber: text("invoice_number").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userDocuments = pgTable("user_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateId: integer("template_id").notNull().references(() => documentTemplates.id),
  documentData: json("document_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  finalPrice: doublePrecision("final_price").notNull(),
  paymentId: integer("payment_id").references(() => payments.id),
  paymentStatus: text("payment_status").notNull().default("pending"),
  documentPath: text("document_path"),
  supportingDocuments: text("supporting_documents"),
  provinceId: integer("province_id").references(() => provinces.id),
  issueId: integer("issue_id").references(() => legalIssues.id),
  subIssueId: integer("sub_issue_id").references(() => subIssues.id),
  documentType: text("document_type"), // e.g., "evidence", "form", "legal_notice", etc.
  status: text("status").default("draft"), // e.g., "draft", "submitted", "approved", "rejected"
  tags: text("tags").array(),
});

export const insertUserDocumentSchema = createInsertSchema(userDocuments).pick({
  userId: true,
  templateId: true,
  documentData: true,
  finalPrice: true,
  provinceId: true,
  issueId: true,
  subIssueId: true,
  documentType: true,
  status: true,
  tags: true,
});

// Provinces for document organization
export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertProvinceSchema = createInsertSchema(provinces).pick({
  name: true,
  code: true,
  isActive: true,
});

// Legal issues (e.g., Housing, CAS, etc.)
export const legalIssues = pgTable("legal_issues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertLegalIssueSchema = createInsertSchema(legalIssues).pick({
  name: true,
  description: true,
  isActive: true,
});

// Sub-issues (e.g., Eviction, File Disclosure, etc.)
export const subIssues = pgTable("sub_issues", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => legalIssues.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertSubIssueSchema = createInsertSchema(subIssues).pick({
  issueId: true,
  name: true,
  description: true,
  isActive: true,
});

// Document folders for organizing user documents - enhanced with province, issue, and sub-issue
export const documentFolders = pgTable("document_folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  provinceId: integer("province_id").references(() => provinces.id),
  issueId: integer("issue_id").references(() => legalIssues.id),
  subIssueId: integer("sub_issue_id").references(() => subIssues.id),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentFolderSchema = createInsertSchema(documentFolders).pick({
  userId: true,
  name: true,
  description: true,
  provinceId: true,
  issueId: true,
  subIssueId: true,
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
  meritWeight: integer("merit_weight"),  // Added merit weight
  meritAssessment: text("merit_assessment"),
  predictedOutcome: text("predicted_outcome"), // Added predicted outcome
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
  meritWeight: true,
  meritAssessment: true,
  predictedOutcome: true,
  meritFactors: true,
});

// Export all types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

// Payment schemas
export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  amount: true,
  currency: true,
  paymentMethod: true,
  paymentMethodId: true,
  paymentType: true,
  description: true,
  metadata: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  paymentMethodId: true,
  priceId: true,
  quantity: true,
  metadata: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  userId: true,
  subscriptionId: true,
  amount: true,
  currency: true,
  status: true,
  dueDate: true,
  paidAt: true,
  invoiceNumber: true,
  metadata: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

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

// Chat types
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Form data storage
export const formData = pgTable("form_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  formType: text("form_type").notNull(), // e.g., "tenancy", "landlord", "children-aid", etc.
  formData: jsonb("form_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFormDataSchema = createInsertSchema(formData).pick({
  userId: true,
  formType: true,
  formData: true,
});

export type InsertFormData = z.infer<typeof insertFormDataSchema>;
export type FormData = typeof formData.$inferSelect;

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

// Resource types
export type InsertResourceCategory = z.infer<typeof insertResourceCategorySchema>;
export type ResourceCategory = typeof resourceCategories.$inferSelect;

export type InsertResourceSubcategory = z.infer<typeof insertResourceSubcategorySchema>;
export type ResourceSubcategory = typeof resourceSubcategories.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

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

// Chat tables for support system
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  isPremiumSupport: boolean("is_premium_support").default(false),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  isUserMessage: boolean("is_user_message").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).pick({
  userId: true,
  title: true,
  isPremiumSupport: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  conversationId: true,
  senderId: true,
  isUserMessage: true,
  content: true,
});

// Resource category table
export const resourceCategories = pgTable("resource_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceCategorySchema = createInsertSchema(resourceCategories).pick({
  name: true,
  description: true,
  icon: true,
  sortOrder: true,
});

// Resource subcategory table
export const resourceSubcategories = pgTable("resource_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => resourceCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceSubcategorySchema = createInsertSchema(resourceSubcategories).pick({
  categoryId: true,
  name: true,
  description: true,
  icon: true,
  sortOrder: true,
});

// Resource table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  resourceType: text("resource_type").notNull(), // document, link, template, guide, contact
  province: text("province").notNull(),
  categoryId: integer("category_id").references(() => resourceCategories.id),
  subcategoryId: integer("subcategory_id").references(() => resourceSubcategories.id),
  resourceUrl: text("resource_url"),
  fileUrl: text("file_url"),
  contactInfo: text("contact_info"),
  tags: text("tags").array(),
  isPremium: boolean("is_premium").default(false),
  isVerified: boolean("is_verified").default(false),
  likeCount: integer("like_count").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  userId: true,
  title: true,
  description: true,
  content: true,
  resourceType: true,
  province: true,
  categoryId: true,
  subcategoryId: true,
  resourceUrl: true,
  fileUrl: true,
  contactInfo: true,
  tags: true,
  isPremium: true,
  isVerified: true,
});

// Resource likes table
export const resourceLikes = pgTable("resource_likes", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull().references(() => resources.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceLikeSchema = createInsertSchema(resourceLikes).pick({
  resourceId: true,
  userId: true,
});

export type InsertResourceLike = z.infer<typeof insertResourceLikeSchema>;
export type ResourceLike = typeof resourceLikes.$inferSelect;

// Resource saves/bookmarks table
export const resourceBookmarks = pgTable("resource_bookmarks", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull().references(() => resources.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceBookmarkSchema = createInsertSchema(resourceBookmarks).pick({
  resourceId: true,
  userId: true,
});

export type InsertResourceBookmark = z.infer<typeof insertResourceBookmarkSchema>;
export type ResourceBookmark = typeof resourceBookmarks.$inferSelect;

// Contributor reputation system
export const contributorReputations = pgTable("contributor_reputations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  reputationScore: integer("reputation_score").notNull().default(0),
  contributionCount: integer("contribution_count").notNull().default(0),
  level: text("level").notNull().default("Newcomer"),
  badges: text("badges").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContributorReputationSchema = createInsertSchema(contributorReputations).pick({
  userId: true,
  reputationScore: true,
  contributionCount: true,
  level: true,
  badges: true,
});

export type InsertContributorReputation = z.infer<typeof insertContributorReputationSchema>;
export type ContributorReputation = typeof contributorReputations.$inferSelect;

// Resource votes for more granular contributor reputation
export const resourceVotes = pgTable("resource_votes", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull().references(() => resources.id),
  userId: integer("user_id").notNull().references(() => users.id),
  vote: integer("vote").notNull(), // 1 for upvote, -1 for downvote, can be expanded
  reason: text("reason"), // Optional reason for the vote
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResourceVoteSchema = createInsertSchema(resourceVotes).pick({
  resourceId: true,
  userId: true,
  vote: true,
  reason: true,
});

export type InsertResourceVote = z.infer<typeof insertResourceVoteSchema>;
export type ResourceVote = typeof resourceVotes.$inferSelect;

// Reputation history to track changes
export const reputationHistory = pgTable("reputation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // "resource_created", "upvote_received", "badge_earned", etc.
  points: integer("points").notNull(), // Points earned or lost
  resourceId: integer("resource_id").references(() => resources.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReputationHistorySchema = createInsertSchema(reputationHistory).pick({
  userId: true,
  action: true,
  points: true,
  resourceId: true,
  description: true,
});

export type InsertReputationHistory = z.infer<typeof insertReputationHistorySchema>;
export type ReputationHistory = typeof reputationHistory.$inferSelect;

// Canadian provinces lookup list
export const provincesLookup = [
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
