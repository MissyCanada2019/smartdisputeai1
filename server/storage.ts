import { 
  users, type User, type InsertUser, 
  documentTemplates, type DocumentTemplate, type InsertDocumentTemplate,
  userDocuments, type UserDocument, type InsertUserDocument,
  documentFolders, type DocumentFolder, type InsertDocumentFolder,
  documentFolderAssignments, type DocumentFolderAssignment, type InsertDocumentFolderAssignment,
  incomeVerifications, type IncomeVerification, type InsertIncomeVerification,
  communityCategories, type CommunityCategory, type InsertCommunityCategory,
  communityPosts, type CommunityPost, type InsertCommunityPost,
  communityComments, type CommunityComment, type InsertCommunityComment,
  communityPostLikes, type CommunityPostLike, type InsertCommunityPostLike,
  communityCommentLikes, type CommunityCommentLike, type InsertCommunityCommentLike,
  communityBookmarks, type CommunityBookmark, type InsertCommunityBookmark,
  userRoles, type UserRole, type InsertUserRole,
  marketingFunnelEvents, type MarketingFunnelEvent, type InsertMarketingFunnelEvent,
  marketingLeads, type MarketingLead, type InsertMarketingLead,
  evidenceFiles, type EvidenceFile, type InsertEvidenceFile,
  caseAnalyses, type CaseAnalysis, type InsertCaseAnalysis,
  chatConversations, type ChatConversation, type InsertChatConversation,
  chatMessages, type ChatMessage, type InsertChatMessage,
  resourceCategories, type ResourceCategory, type InsertResourceCategory,
  resourceSubcategories, type ResourceSubcategory, type InsertResourceSubcategory,
  resources, type Resource, type InsertResource,
  resourceLikes, type ResourceLike, type InsertResourceLike,
  resourceBookmarks, type ResourceBookmark, type InsertResourceBookmark,
  contributorReputations, type ContributorReputation, type InsertContributorReputation,
  resourceVotes, type ResourceVote, type InsertResourceVote,
  reputationHistory, type ReputationHistory, type InsertReputationHistory,
  formData, type FormData, type InsertFormData
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;
  
  // Document template operations
  getDocumentTemplates(): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  getDocumentTemplatesByProvince(province: string): Promise<DocumentTemplate[]>;
  getDocumentTemplatesByCategory(category: string): Promise<DocumentTemplate[]>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  
  // User document operations
  getUserDocuments(userId: number): Promise<UserDocument[]>;
  getUserDocument(id: number): Promise<UserDocument | undefined>;
  createUserDocument(document: InsertUserDocument): Promise<UserDocument>;
  updateUserDocument(id: number, document: Partial<UserDocument>): Promise<UserDocument | undefined>;
  searchUserDocuments(userId: number, searchTerm: string): Promise<UserDocument[]>;
  
  // Document folder operations
  getDocumentFolders(userId: number): Promise<DocumentFolder[]>;
  getDocumentFolder(id: number): Promise<DocumentFolder | undefined>;
  createDocumentFolder(folder: InsertDocumentFolder): Promise<DocumentFolder>;
  updateDocumentFolder(id: number, folder: Partial<DocumentFolder>): Promise<DocumentFolder | undefined>;
  deleteDocumentFolder(id: number): Promise<boolean>;
  
  // Document folder assignment operations
  getDocumentFolderAssignments(documentId: number): Promise<DocumentFolderAssignment[]>;
  getFolderDocuments(folderId: number): Promise<UserDocument[]>;
  createDocumentFolderAssignment(assignment: InsertDocumentFolderAssignment): Promise<DocumentFolderAssignment>;
  deleteDocumentFolderAssignment(id: number): Promise<boolean>;
  moveDocumentToFolder(documentId: number, folderId: number): Promise<DocumentFolderAssignment>;
  
  // Income verification operations
  getIncomeVerifications(userId: number): Promise<IncomeVerification[]>;
  createIncomeVerification(verification: InsertIncomeVerification): Promise<IncomeVerification>;
  updateIncomeVerification(id: number, verification: Partial<IncomeVerification>): Promise<IncomeVerification | undefined>;
  
  // Payment updates
  updatePaymentStatus(documentId: number, status: string, paymentIntentId?: string): Promise<UserDocument | undefined>;
  
  // Community category operations
  getCommunityCategories(): Promise<CommunityCategory[]>;
  getCommunityCategory(id: number): Promise<CommunityCategory | undefined>;
  createCommunityCategory(category: InsertCommunityCategory): Promise<CommunityCategory>;
  updateCommunityCategory(id: number, category: Partial<CommunityCategory>): Promise<CommunityCategory | undefined>;
  deleteCommunityCategory(id: number): Promise<boolean>;
  
  // Community post operations
  getCommunityPosts(categoryId?: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, post: Partial<CommunityPost>): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: number): Promise<boolean>;
  getUserCommunityPosts(userId: number): Promise<CommunityPost[]>;
  searchCommunityPosts(searchTerm: string): Promise<CommunityPost[]>;
  
  // Community comment operations
  getCommunityComments(postId: number): Promise<CommunityComment[]>;
  getCommunityComment(id: number): Promise<CommunityComment | undefined>;
  createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment>;
  updateCommunityComment(id: number, comment: Partial<CommunityComment>): Promise<CommunityComment | undefined>;
  deleteCommunityComment(id: number): Promise<boolean>;
  
  // Community like operations
  togglePostLike(postId: number, userId: number): Promise<boolean>;
  toggleCommentLike(commentId: number, userId: number): Promise<boolean>;
  getPostLikes(postId: number): Promise<CommunityPostLike[]>;
  getCommentLikes(commentId: number): Promise<CommunityCommentLike[]>;
  
  // Community bookmark operations
  toggleBookmark(postId: number, userId: number): Promise<boolean>;
  getUserBookmarks(userId: number): Promise<CommunityBookmark[]>;
  
  // User role operations
  getUserRole(userId: number): Promise<UserRole | undefined>;
  assignUserRole(role: InsertUserRole): Promise<UserRole>;
  updateUserRole(userId: number, role: string): Promise<UserRole | undefined>;
  
  // Marketing funnel operations
  trackFunnelEvent(event: InsertMarketingFunnelEvent): Promise<MarketingFunnelEvent>;
  getFunnelEvents(funnelName?: string): Promise<MarketingFunnelEvent[]>;
  getUserFunnelEvents(userId: number): Promise<MarketingFunnelEvent[]>;
  
  // Marketing lead operations
  createMarketingLead(lead: InsertMarketingLead): Promise<MarketingLead>;
  getMarketingLeadByEmail(email: string): Promise<MarketingLead | undefined>;
  updateMarketingLead(id: number, lead: Partial<MarketingLead>): Promise<MarketingLead | undefined>;
  convertLeadToUser(leadId: number, userId: number): Promise<MarketingLead>;
  
  // Evidence file operations
  getEvidenceFiles(userId: number): Promise<EvidenceFile[]>;
  getEvidenceFile(id: number): Promise<EvidenceFile | undefined>;
  createEvidenceFile(file: InsertEvidenceFile): Promise<EvidenceFile>;
  updateEvidenceFile(id: number, file: Partial<EvidenceFile>): Promise<EvidenceFile | undefined>;
  deleteEvidenceFile(id: number): Promise<boolean>;
  updateEvidenceAnalysis(id: number, analyzedContent: string): Promise<EvidenceFile | undefined>;
  
  // Case analysis operations
  getCaseAnalyses(userId: number): Promise<CaseAnalysis[]>;
  getCaseAnalysis(id: number): Promise<CaseAnalysis | undefined>;
  createCaseAnalysis(analysis: InsertCaseAnalysis): Promise<CaseAnalysis>;
  updateCaseAnalysis(id: number, analysis: Partial<CaseAnalysis>): Promise<CaseAnalysis | undefined>;
  getCaseAnalysisByEvidence(evidenceIds: number[]): Promise<CaseAnalysis | undefined>;
  addMeritAssessment(id: number, meritScore: number, meritWeight: number, meritAssessment: string, predictedOutcome: string, meritFactors: any): Promise<CaseAnalysis | undefined>;
  
  // Chat operations
  getChatConversations(userId: number): Promise<ChatConversation[]>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: number, conversation: Partial<ChatConversation>): Promise<ChatConversation | undefined>;
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Resource category operations
  getResourceCategories(): Promise<ResourceCategory[]>;
  getResourceCategory(id: number): Promise<ResourceCategory | undefined>;
  createResourceCategory(category: InsertResourceCategory): Promise<ResourceCategory>;
  updateResourceCategory(id: number, category: Partial<ResourceCategory>): Promise<ResourceCategory | undefined>;
  deleteResourceCategory(id: number): Promise<boolean>;
  
  // Resource subcategory operations
  getResourceSubcategories(categoryId?: number): Promise<ResourceSubcategory[]>;
  getResourceSubcategory(id: number): Promise<ResourceSubcategory | undefined>;
  createResourceSubcategory(subcategory: InsertResourceSubcategory): Promise<ResourceSubcategory>;
  updateResourceSubcategory(id: number, subcategory: Partial<ResourceSubcategory>): Promise<ResourceSubcategory | undefined>;
  deleteResourceSubcategory(id: number): Promise<boolean>;
  
  // Resource operations
  getResources(filters?: { province?: string, categoryId?: number, subcategoryId?: number, isPremium?: boolean }): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Resource like operations
  getResourceLikes(resourceId: number): Promise<ResourceLike[]>;
  getResourceLikeByUserAndResource(userId: number, resourceId: number): Promise<ResourceLike | undefined>;
  createResourceLike(like: InsertResourceLike): Promise<ResourceLike>;
  deleteResourceLike(id: number): Promise<boolean>;
  
  // Resource bookmark operations
  getResourceBookmarks(userId: number): Promise<ResourceBookmark[]>;
  getResourceBookmarkByUserAndResource(userId: number, resourceId: number): Promise<ResourceBookmark | undefined>;
  createResourceBookmark(bookmark: InsertResourceBookmark): Promise<ResourceBookmark>;
  deleteResourceBookmark(id: number): Promise<boolean>;
  
  // Contributor reputation operations
  getContributorReputation(userId: number): Promise<ContributorReputation | undefined>;
  getTopContributors(limit?: number): Promise<ContributorReputation[]>;
  createContributorReputation(reputation: InsertContributorReputation): Promise<ContributorReputation>;
  updateContributorReputation(userId: number, updates: Partial<ContributorReputation>): Promise<ContributorReputation | undefined>;
  
  // Resource vote operations
  getResourceVotes(resourceId: number): Promise<ResourceVote[]>;
  getUserResourceVote(userId: number, resourceId: number): Promise<ResourceVote | undefined>;
  createResourceVote(vote: InsertResourceVote): Promise<ResourceVote>;
  updateResourceVote(id: number, vote: Partial<ResourceVote>): Promise<ResourceVote | undefined>;
  deleteResourceVote(id: number): Promise<boolean>;
  
  // Reputation history operations
  getReputationHistory(userId: number): Promise<ReputationHistory[]>;
  createReputationHistoryEntry(entry: InsertReputationHistory): Promise<ReputationHistory>;
  
  // Form data operations
  getFormData(userId: number, formType: string): Promise<FormData | undefined>;
  getFormDataById(id: number): Promise<FormData | undefined>;
  createFormData(data: InsertFormData): Promise<FormData>;
  updateFormData(id: number, data: Partial<FormData>): Promise<FormData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documentTemplates: Map<number, DocumentTemplate>;
  private userDocuments: Map<number, UserDocument>;
  private documentFolders: Map<number, DocumentFolder>;
  private documentFolderAssignments: Map<number, DocumentFolderAssignment>;
  private incomeVerifications: Map<number, IncomeVerification>;
  
  // Community related data maps
  private communityCategories: Map<number, CommunityCategory>;
  private communityPosts: Map<number, CommunityPost>;
  private communityComments: Map<number, CommunityComment>;
  private communityPostLikes: Map<number, CommunityPostLike>;
  private communityCommentLikes: Map<number, CommunityCommentLike>;
  private communityBookmarks: Map<number, CommunityBookmark>;
  private userRoles: Map<number, UserRole>;
  
  // Marketing related data maps
  private marketingFunnelEvents: Map<number, MarketingFunnelEvent>;
  private marketingLeads: Map<number, MarketingLead>;
  
  // Evidence and case analysis related data maps
  private evidenceFiles: Map<number, EvidenceFile>;
  private caseAnalyses: Map<number, CaseAnalysis>;
  
  // Chat related data maps
  private chatConversations: Map<number, ChatConversation>;
  private chatMessages: Map<number, ChatMessage>;
  
  // Resource related data maps
  private resourceCategories: Map<number, ResourceCategory>;
  private resourceSubcategories: Map<number, ResourceSubcategory>;
  private resources: Map<number, Resource>;
  private resourceLikes: Map<number, ResourceLike>;
  private resourceBookmarks: Map<number, ResourceBookmark>;
  
  // Reputation system maps
  private contributorReputations: Map<number, ContributorReputation>;
  private resourceVotes: Map<number, ResourceVote>;
  private reputationHistory: Map<number, ReputationHistory>;
  
  private currentUserId: number;
  private currentDocumentTemplateId: number;
  private currentUserDocumentId: number;
  private currentDocumentFolderId: number;
  private currentDocumentFolderAssignmentId: number;
  private currentIncomeVerificationId: number;
  
  // Community related counters
  private currentCommunityCategoryId: number;
  private currentCommunityPostId: number;
  private currentCommunityCommentId: number;
  private currentCommunityPostLikeId: number;
  private currentCommunityCommentLikeId: number;
  private currentCommunityBookmarkId: number;
  private currentUserRoleId: number;
  
  // Marketing related counters
  private currentMarketingFunnelEventId: number;
  private currentMarketingLeadId: number;
  
  // Evidence and case analysis related counters
  private currentEvidenceFileId: number;
  private currentCaseAnalysisId: number;
  
  // Chat related counters
  private currentChatConversationId: number;
  private currentChatMessageId: number;
  
  // Resource related counters
  private currentResourceCategoryId: number;
  private currentResourceSubcategoryId: number;
  private currentResourceId: number;
  private currentResourceLikeId: number;
  private currentResourceBookmarkId: number;
  
  // Reputation system counters
  private currentContributorReputationId: number;
  private currentResourceVoteId: number;
  private currentReputationHistoryId: number;

  constructor() {
    // Initialize main collections
    this.users = new Map();
    this.documentTemplates = new Map();
    this.userDocuments = new Map();
    this.documentFolders = new Map();
    this.documentFolderAssignments = new Map();
    this.incomeVerifications = new Map();
    
    // Initialize community collections
    this.communityCategories = new Map();
    this.communityPosts = new Map();
    this.communityComments = new Map();
    this.communityPostLikes = new Map();
    this.communityCommentLikes = new Map();
    this.communityBookmarks = new Map();
    this.userRoles = new Map();
    
    // Initialize marketing collections
    this.marketingFunnelEvents = new Map();
    this.marketingLeads = new Map();
    
    // Initialize evidence and case analysis collections
    this.evidenceFiles = new Map();
    this.caseAnalyses = new Map();
    
    // Initialize chat collections
    this.chatConversations = new Map();
    this.chatMessages = new Map();
    
    // Initialize resource collections
    this.resourceCategories = new Map();
    this.resourceSubcategories = new Map();
    this.resources = new Map();
    this.resourceLikes = new Map();
    this.resourceBookmarks = new Map();
    
    // Initialize reputation system collections
    this.contributorReputations = new Map();
    this.resourceVotes = new Map();
    this.reputationHistory = new Map();
    
    // Initialize main IDs
    this.currentUserId = 1;
    this.currentDocumentTemplateId = 1;
    this.currentUserDocumentId = 1;
    this.currentDocumentFolderId = 1;
    this.currentDocumentFolderAssignmentId = 1;
    this.currentIncomeVerificationId = 1;
    
    // Initialize community IDs
    this.currentCommunityCategoryId = 1;
    this.currentCommunityPostId = 1;
    this.currentCommunityCommentId = 1;
    this.currentCommunityPostLikeId = 1;
    this.currentCommunityCommentLikeId = 1;
    this.currentCommunityBookmarkId = 1;
    this.currentUserRoleId = 1;
    
    // Initialize marketing IDs
    this.currentMarketingFunnelEventId = 1;
    this.currentMarketingLeadId = 1;
    
    // Initialize evidence and case analysis IDs
    this.currentEvidenceFileId = 1;
    this.currentCaseAnalysisId = 1;
    
    // Initialize chat IDs
    this.currentChatConversationId = 1;
    this.currentChatMessageId = 1;
    
    // Initialize resource IDs
    this.currentResourceCategoryId = 1;
    this.currentResourceSubcategoryId = 1;
    this.currentResourceId = 1;
    this.currentResourceLikeId = 1;
    this.currentResourceBookmarkId = 1;
    
    // Initialize reputation system IDs
    this.currentContributorReputationId = 1;
    this.currentResourceVoteId = 1;
    this.currentReputationHistoryId = 1;
    
    // Seed data
    this.seedDocumentTemplates();
    this.seedCommunityCategories();
    
    // Add some example community posts
    const demoUser = {
      id: 999,
      username: "sysdemoaccount", // Renamed to be less obvious
      password: "G5n@8#hK2pQ!Lst9", // Changed to a secure password that's not disclosed anywhere
      firstName: "System",
      lastName: "Demo",
      email: "smartdisputecanada@gmail.com",
      phone: null,
      dob: null,
      address: null,
      province: null,
      postalCode: null,
      incomeBased: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save demo user
    this.users.set(demoUser.id, demoUser);
    
    // Example posts for the community
    const examplePosts = [
      {
        title: "My experience with the Children's Aid Society",
        content: "I recently had to deal with the Children's Aid Society and wanted to share my experience. The process was intimidating at first, but I used the templates from this site to help me communicate effectively.\n\nThe key things that helped me were preparing all my documentation in advance and keeping a detailed timeline of all interactions. I also made sure to respond promptly to all communications.\n\nIt was a difficult journey, but I'm glad to say that the situation has improved significantly. I'm grateful for the support from this community!",
        categoryId: 1, // Stories
        userId: demoUser.id,
        isStory: true,
        isAdvice: false,
        isAnonymous: false
      },
      {
        title: "Advice for dealing with an unfair eviction notice",
        content: "After receiving an eviction notice that I believed was unfair, I took the following steps that might help others in similar situations:\n\n1. Immediately documented everything about my rental situation\n2. Used the Landlord-Tenant dispute templates from this site\n3. Contacted my local tenant rights organization for support\n4. Kept all communication in writing whenever possible\n\nRemember that landlords often count on tenants not knowing their rights. Stay calm, be professional, and know that you have legal protections.",
        categoryId: 2, // Advice & Support
        userId: demoUser.id,
        isStory: false,
        isAdvice: true,
        isAnonymous: false
      },
      {
        title: "Helpful resources for correcting credit report errors",
        content: "I've compiled a list of resources that helped me successfully dispute errors on my Equifax credit report:\n\n- The Credit Bureau dispute letter templates from this site were incredibly helpful\n- The Financial Consumer Agency of Canada website has excellent guides: https://www.canada.ca/en/financial-consumer-agency.html\n- Credit Counselling Canada offers free consultations: https://creditcounsellingcanada.ca/\n\nRemember to keep copies of all communication and follow up regularly. Be persistent - it may take several attempts, but it's worth it to have an accurate credit report.",
        categoryId: 3, // Resources
        userId: demoUser.id,
        isStory: false,
        isAdvice: true,
        isAnonymous: false
      },
      {
        title: "Success story: Resolved my housing issues after months of struggle",
        content: "After nearly six months of dealing with unsafe housing conditions, I'm happy to report that I finally got resolution! Using the templates from this site, I was able to properly document the issues and communicate effectively with my landlord and the local housing authority.\n\nIt wasn't easy and took a lot of persistence, but I now have a safe place to live with all the issues addressed. Remember that you have rights as a tenant and don't give up on advocating for yourself.",
        categoryId: 4, // Success Stories
        userId: demoUser.id,
        isStory: true,
        isAdvice: false,
        isAnonymous: false
      },
      {
        title: "Coping with the stress of legal disputes",
        content: "I wanted to share some strategies that have helped me cope with the incredible stress of ongoing legal disputes:\n\n1. Establish a self-care routine - even 15 minutes a day makes a difference\n2. Set boundaries around when you work on your case - don't let it consume every moment\n3. Find a supportive community (like this one) where you can share experiences\n4. Consider low-cost mental health resources like BounceBack Canada or Wellness Together Canada\n\nRemember that taking care of your mental health is crucial during these challenging times. You can't effectively advocate for yourself if you're completely burned out.",
        categoryId: 5, // Mental Health
        userId: demoUser.id,
        isStory: false,
        isAdvice: true,
        isAnonymous: true
      }
    ];
    
    // Add the example posts
    const now = new Date().toISOString();
    examplePosts.forEach(post => {
      const id = this.currentCommunityPostId++;
      this.communityPosts.set(id, {
        ...post,
        id,
        isPinnedByModerator: false,
        likeCount: Math.floor(Math.random() * 10),
        createdAt: now,
        updatedAt: now
      });
    });
    
    // Add admin role to demo user
    this.userRoles.set(1, {
      id: 1,
      userId: demoUser.id,
      role: "admin",
      createdAt: now
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Make username lookup case-insensitive
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    // Make email lookup case-insensitive as well
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("Storage: createUser called with data:", { 
        ...insertUser, 
        password: '******' // Hide password in logs
      });
      
      // Ensure all required fields have values
      if (!insertUser.username) {
        throw new Error("Username is required");
      }
      
      if (!insertUser.password) {
        throw new Error("Password is required");
      }
      
      // Generate an ID for the new user
      const id = this.currentUserId++;
      console.log("Storage: Assigned user ID:", id);
      
      // Create the user object
      const timestamp = new Date();
      const user: User = { 
        ...insertUser, 
        id,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Store the user in the in-memory map
      this.users.set(id, user);
      console.log("Storage: User created successfully with ID:", id);
      
      return user;
    } catch (error) {
      console.error("Storage: Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Document template methods
  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values());
  }
  
  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    return this.documentTemplates.get(id);
  }
  
  async getDocumentTemplatesByProvince(province: string): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values()).filter(
      (template) => template.applicableProvinces.includes(province)
    );
  }

  async getDocumentTemplatesByCategory(category: string): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values()).filter(
      (template) => template.category === category
    );
  }
  
  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const id = this.currentDocumentTemplateId++;
    const newTemplate: DocumentTemplate = { ...template, id };
    this.documentTemplates.set(id, newTemplate);
    return newTemplate;
  }

  // User document methods
  async getUserDocuments(userId: number): Promise<UserDocument[]> {
    return Array.from(this.userDocuments.values()).filter(
      (doc) => doc.userId === userId
    );
  }
  
  async getUserDocument(id: number): Promise<UserDocument | undefined> {
    return this.userDocuments.get(id);
  }
  
  async createUserDocument(document: InsertUserDocument): Promise<UserDocument> {
    const id = this.currentUserDocumentId++;
    const now = new Date().toISOString();
    const newDocument: UserDocument = { 
      ...document, 
      id, 
      createdAt: now,
      paymentStatus: "pending", 
      documentPath: undefined,
      stripePaymentIntentId: undefined 
    };
    this.userDocuments.set(id, newDocument);
    return newDocument;
  }
  
  async updateUserDocument(id: number, documentData: Partial<UserDocument>): Promise<UserDocument | undefined> {
    const existingDocument = this.userDocuments.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument = { ...existingDocument, ...documentData };
    this.userDocuments.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async searchUserDocuments(userId: number, searchTerm: string): Promise<UserDocument[]> {
    const userDocs = await this.getUserDocuments(userId);
    if (!searchTerm) return userDocs;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return userDocs.filter((doc) => {
      // Get the document template name
      const template = this.documentTemplates.get(doc.templateId);
      const templateName = template?.name || '';
      
      // Check if search term appears in document data or template name
      return (
        templateName.toLowerCase().includes(lowerSearchTerm) ||
        JSON.stringify(doc.documentData).toLowerCase().includes(lowerSearchTerm)
      );
    });
  }

  // Income verification methods
  async getIncomeVerifications(userId: number): Promise<IncomeVerification[]> {
    return Array.from(this.incomeVerifications.values()).filter(
      (verification) => verification.userId === userId
    );
  }
  
  async createIncomeVerification(verification: InsertIncomeVerification): Promise<IncomeVerification> {
    const id = this.currentIncomeVerificationId++;
    const now = new Date().toISOString();
    const newVerification: IncomeVerification = { 
      ...verification, 
      id, 
      status: "pending", 
      createdAt: now, 
      updatedAt: now 
    };
    this.incomeVerifications.set(id, newVerification);
    return newVerification;
  }
  
  async updateIncomeVerification(id: number, verificationData: Partial<IncomeVerification>): Promise<IncomeVerification | undefined> {
    const existingVerification = this.incomeVerifications.get(id);
    if (!existingVerification) return undefined;
    
    const now = new Date().toISOString();
    const updatedVerification = { 
      ...existingVerification, 
      ...verificationData, 
      updatedAt: now 
    };
    this.incomeVerifications.set(id, updatedVerification);
    return updatedVerification;
  }
  
  // Document folder operations
  async getDocumentFolders(userId: number): Promise<DocumentFolder[]> {
    return Array.from(this.documentFolders.values()).filter(
      (folder) => folder.userId === userId
    );
  }
  
  async getDocumentFolder(id: number): Promise<DocumentFolder | undefined> {
    return this.documentFolders.get(id);
  }
  
  async createDocumentFolder(folder: InsertDocumentFolder): Promise<DocumentFolder> {
    const id = this.currentDocumentFolderId++;
    const now = new Date().toISOString();
    const newFolder: DocumentFolder = {
      ...folder,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.documentFolders.set(id, newFolder);
    
    // If this is the first folder for the user or it's marked as default, 
    // create a default folder if one doesn't exist
    if (folder.isDefault) {
      // Make sure any other default folders for this user are no longer default
      const userFolders = await this.getDocumentFolders(folder.userId);
      for (const existingFolder of userFolders) {
        if (existingFolder.id !== id && existingFolder.isDefault) {
          existingFolder.isDefault = false;
          this.documentFolders.set(existingFolder.id, existingFolder);
        }
      }
    }
    
    return newFolder;
  }
  
  async updateDocumentFolder(id: number, folderData: Partial<DocumentFolder>): Promise<DocumentFolder | undefined> {
    const existingFolder = this.documentFolders.get(id);
    if (!existingFolder) return undefined;
    
    const now = new Date().toISOString();
    const updatedFolder = {
      ...existingFolder,
      ...folderData,
      updatedAt: now
    };
    this.documentFolders.set(id, updatedFolder);
    
    // If this folder is being set as default, update any other default folders
    if (folderData.isDefault) {
      const userFolders = await this.getDocumentFolders(existingFolder.userId);
      for (const folder of userFolders) {
        if (folder.id !== id && folder.isDefault) {
          folder.isDefault = false;
          this.documentFolders.set(folder.id, folder);
        }
      }
    }
    
    return updatedFolder;
  }
  
  async deleteDocumentFolder(id: number): Promise<boolean> {
    const folder = this.documentFolders.get(id);
    if (!folder) return false;
    
    // First, check if there are any documents in this folder
    const folderAssignments = Array.from(this.documentFolderAssignments.values()).filter(
      (assignment) => assignment.folderId === id
    );
    
    // If default folder, don't allow deletion
    if (folder.isDefault) {
      return false;
    }
    
    // Delete all folder assignments for this folder
    for (const assignment of folderAssignments) {
      this.documentFolderAssignments.delete(assignment.id);
    }
    
    // Delete the folder
    this.documentFolders.delete(id);
    return true;
  }
  
  // Document folder assignment operations
  async getDocumentFolderAssignments(documentId: number): Promise<DocumentFolderAssignment[]> {
    return Array.from(this.documentFolderAssignments.values()).filter(
      (assignment) => assignment.documentId === documentId
    );
  }
  
  async getFolderDocuments(folderId: number): Promise<UserDocument[]> {
    const assignments = Array.from(this.documentFolderAssignments.values()).filter(
      (assignment) => assignment.folderId === folderId
    );
    
    const documents: UserDocument[] = [];
    for (const assignment of assignments) {
      const document = this.userDocuments.get(assignment.documentId);
      if (document) {
        documents.push(document);
      }
    }
    
    return documents;
  }
  
  async createDocumentFolderAssignment(assignment: InsertDocumentFolderAssignment): Promise<DocumentFolderAssignment> {
    const id = this.currentDocumentFolderAssignmentId++;
    const now = new Date().toISOString();
    const newAssignment: DocumentFolderAssignment = {
      ...assignment,
      id,
      createdAt: now
    };
    this.documentFolderAssignments.set(id, newAssignment);
    return newAssignment;
  }
  
  async deleteDocumentFolderAssignment(id: number): Promise<boolean> {
    const exists = this.documentFolderAssignments.has(id);
    if (!exists) return false;
    
    this.documentFolderAssignments.delete(id);
    return true;
  }
  
  async moveDocumentToFolder(documentId: number, folderId: number): Promise<DocumentFolderAssignment> {
    // First, delete any existing assignments for this document
    const existingAssignments = await this.getDocumentFolderAssignments(documentId);
    for (const assignment of existingAssignments) {
      this.documentFolderAssignments.delete(assignment.id);
    }
    
    // Then create a new assignment
    return this.createDocumentFolderAssignment({
      documentId,
      folderId
    });
  }
  
  // Stripe-related methods
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      stripeCustomerId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Payment updates
  async updatePaymentStatus(documentId: number, status: string, paymentIntentId?: string): Promise<UserDocument | undefined> {
    const document = this.userDocuments.get(documentId);
    if (!document) return undefined;
    
    const updatedDocument = { 
      ...document, 
      paymentStatus: status,
      ...(paymentIntentId && { stripePaymentIntentId: paymentIntentId })
    };
    this.userDocuments.set(documentId, updatedDocument);
    return updatedDocument;
  }
  
  // Community category operations
  async getCommunityCategories(): Promise<CommunityCategory[]> {
    return Array.from(this.communityCategories.values());
  }
  
  async getCommunityCategory(id: number): Promise<CommunityCategory | undefined> {
    return this.communityCategories.get(id);
  }
  
  async createCommunityCategory(category: InsertCommunityCategory): Promise<CommunityCategory> {
    const id = this.currentCommunityCategoryId++;
    const now = new Date().toISOString();
    const newCategory: CommunityCategory = {
      ...category,
      id,
      createdAt: now
    };
    this.communityCategories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCommunityCategory(id: number, categoryData: Partial<CommunityCategory>): Promise<CommunityCategory | undefined> {
    const existingCategory = this.communityCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = {
      ...existingCategory,
      ...categoryData
    };
    this.communityCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCommunityCategory(id: number): Promise<boolean> {
    // Check if there are any posts in this category
    const postsInCategory = Array.from(this.communityPosts.values()).filter(
      post => post.categoryId === id
    );
    
    // Don't allow deletion if there are posts
    if (postsInCategory.length > 0) {
      return false;
    }
    
    const exists = this.communityCategories.has(id);
    if (!exists) return false;
    
    this.communityCategories.delete(id);
    return true;
  }
  
  // Community post operations
  async getCommunityPosts(categoryId?: number): Promise<CommunityPost[]> {
    let posts = Array.from(this.communityPosts.values());
    
    if (categoryId !== undefined) {
      posts = posts.filter(post => post.categoryId === categoryId);
    }
    
    // Sort by created date (newest first)
    return posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }
  
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentCommunityPostId++;
    const now = new Date().toISOString();
    const newPost: CommunityPost = {
      ...post,
      id,
      likeCount: 0,
      isPinnedByModerator: false,
      createdAt: now,
      updatedAt: now
    };
    this.communityPosts.set(id, newPost);
    return newPost;
  }
  
  async updateCommunityPost(id: number, postData: Partial<CommunityPost>): Promise<CommunityPost | undefined> {
    const existingPost = this.communityPosts.get(id);
    if (!existingPost) return undefined;
    
    const now = new Date().toISOString();
    const updatedPost = {
      ...existingPost,
      ...postData,
      updatedAt: now
    };
    this.communityPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteCommunityPost(id: number): Promise<boolean> {
    const existingPost = this.communityPosts.get(id);
    if (!existingPost) return false;
    
    // Delete all comments for this post
    const commentsToDelete = Array.from(this.communityComments.values())
      .filter(comment => comment.postId === id);
      
    for (const comment of commentsToDelete) {
      this.communityComments.delete(comment.id);
    }
    
    // Delete all likes for this post
    const likesToDelete = Array.from(this.communityPostLikes.values())
      .filter(like => like.postId === id);
      
    for (const like of likesToDelete) {
      this.communityPostLikes.delete(like.id);
    }
    
    // Delete all bookmarks for this post
    const bookmarksToDelete = Array.from(this.communityBookmarks.values())
      .filter(bookmark => bookmark.postId === id);
      
    for (const bookmark of bookmarksToDelete) {
      this.communityBookmarks.delete(bookmark.id);
    }
    
    // Delete the post
    this.communityPosts.delete(id);
    return true;
  }
  
  async getUserCommunityPosts(userId: number): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  
  async searchCommunityPosts(searchTerm: string): Promise<CommunityPost[]> {
    if (!searchTerm) return this.getCommunityPosts();
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return Array.from(this.communityPosts.values())
      .filter(post => {
        return (
          post.title.toLowerCase().includes(lowerSearchTerm) ||
          post.content.toLowerCase().includes(lowerSearchTerm)
        );
      })
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  
  // Seed initial document templates
  private seedDocumentTemplates() {
    const templates: InsertDocumentTemplate[] = [
      // Children's Aid Society Templates
      {
        name: "Children's Aid Society Dispute Letter",
        description: "Formal letter to dispute actions or decisions made by a Children's Aid Society.",
        category: "Children's Aid Society",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Children's Aid Society Dispute Letter\n\n[Date]\n\n[Children's Aid Society Name]\n[Address]\n\nRE: Dispute of Decision/Action - File Number: [Case File Number]\n\nDear Sir/Madam,\n\nI, [Full Name], am writing to formally dispute the decision/action taken by your agency on [Date of Decision/Action] regarding [Brief Description of Case/Child's Name].\n\nBased on the following facts and circumstances, I believe this decision/action was inappropriate and/or unjustified:\n\n1. [First point of dispute]\n2. [Second point of dispute]\n3. [Third point of dispute]\n\n[Additional detailed explanation of situation and evidence]\n\nI request the following action be taken to resolve this matter:\n[Specific request for resolution]\n\nI am available to discuss this matter further at [Phone Number] or via email at [Email Address]. If I do not receive a response within [Number] business days, I will be pursuing further legal options and/or contacting the appropriate oversight body.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]\n\ncc: [Other relevant parties if applicable]\n\nEnclosures: [List any documents attached]",
        previewImageUrl: "https://images.unsplash.com/photo-1588075592446-265bad1a5c82?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "casFileNumber", "caseDescription", "dateOfDecision", "disputePoints", "requestedResolution", "contactInformation"]
      },
      {
        name: "CAS Record Correction Request",
        description: "Request correction of inaccurate information in a Children's Aid Society file.",
        category: "Children's Aid Society",
        applicableProvinces: ["ON", "BC", "AB", "MB", "QC"],
        basePrice: 5.99,
        templateContent: "# REQUEST FOR CORRECTION OF CAS RECORDS\n\n[Date]\n\n[Children's Aid Society Name]\nRecords Department\n[Address]\n\nRE: Request for Correction of Records - File Number: [Case File Number]\n\nDear Records Officer,\n\nI am writing to formally request a correction to information contained in my file (or my child's file) with your agency. My name is [Full Name], and I am [relationship to the child, if applicable] of [Child's Name, if applicable].\n\n## Information Requiring Correction\n\nThe following information in my/our file is incorrect or incomplete:\n\n1. [Specific incorrect information, including report date and author if known]\n2. [Additional incorrect information]\n\n## Correct Information\n\nThe information should be corrected to state:\n\n1. [Correct information to replace item 1]\n2. [Correct information to replace item 2]\n\n## Supporting Evidence\n\nI have attached the following documentation to support this correction request:\n\n1. [Description of supporting document 1]\n2. [Description of supporting document 2]\n\n## Legal Basis for Request\n\nUnder the [relevant provincial legislation], I have the right to request correction of personal information that is inaccurate or incomplete.\n\nPlease provide written confirmation that these corrections have been made to my file within [Number] business days. If you refuse to make these corrections, please provide a written explanation of your reasons, as required by law.\n\nIf you decline to make these corrections, I request that a statement of disagreement be attached to my file reflecting my position on this information.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Address]\n[Phone Number]\n[Email Address]\n\nEnclosures: [List of enclosed documents]",
        previewImageUrl: "https://images.unsplash.com/photo-1605239435890-34f158a45dde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "casFileNumber", "relationshipToChild", "childName", "incorrectInformation", "correctInformation", "supportingDocuments", "relevantLegislation", "timeframe", "contactInformation"]
      },
      {
        name: "Post-Apprehension Child Return Request",
        description: "Formal request for the return of a child after CAS apprehension, with legal grounds.",
        category: "Children's Aid Society",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# REQUEST FOR RETURN OF CHILD AFTER APPREHENSION\n\n[Date]\n\n[Children's Aid Society Name]\n[Address]\n\nRE: Request for Return of Child - [Child's Name] - File Number: [Case File Number]\n\nDear Director/Supervisor,\n\nI, [Full Name], am writing as the [relationship to child] of [Child's Name], who was apprehended by your agency on [Date of Apprehension].\n\n## Request for Return\n\nI am formally requesting the immediate return of my child to my care and custody. I believe the apprehension was unwarranted and/or the circumstances that led to the apprehension have been resolved as follows:\n\n1. [Explanation of how concerns have been addressed]\n2. [Evidence of improved home situation/parenting capacity]\n3. [Support systems now in place]\n\n## Supporting Information\n\nI have taken the following steps to address the concerns raised by your agency:\n\n- [Completed parenting courses/counseling/treatment]\n- [Home environment improvements]\n- [Support network established]\n\n## Legal Position\n\nUnder [relevant provincial legislation], children should be returned to parental care when it is in their best interests and when any protection concerns have been adequately addressed. I believe this threshold has been met in this case.\n\nI am prepared to work with your agency on a supervised transition plan if necessary, but I respectfully request that this process begin immediately.\n\nIf I do not receive a positive response within [Number] business days, I will be pursuing my legal options, including an application to the court for the return of my child.\n\n## Contact Information\n\nI can be reached at [Phone Number] or [Email Address] to discuss this matter further.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Address]\n[Contact Information]\n\nEnclosures: [List of supporting documents]\n\n## Advocacy Resources\n\nAdvocacy organizations that may provide assistance:\n\n- Ontario: Justice for Families (https://www.ofjfo.ca)\n- British Columbia: Parent Support Services Society of BC (https://www.parentsupportbc.ca)\n- Alberta: Family Law Office (https://www.legalaid.ab.ca)\n- National: Canada Family Justice (https://www.justice.gc.ca/eng/fl-df/index.html)",
        previewImageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "casFileNumber", "childName", "relationshipToChild", "dateOfApprehension", "concernsAddressed", "supportingSystems", "completedPrograms", "contactInformation"]
      },
      {
        name: "CAS Court Hearing Preparation Guide",
        description: "Detailed guide to help parents prepare for Children's Aid Society court hearings.",
        category: "Children's Aid Society",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# COURT HEARING PREPARATION GUIDE\n\n## IMPORTANT ADVOCACY RESOURCES\n\n### National Resources\n- Legal Aid Canada: https://www.legalaid.ca\n- Justice for Children and Youth: https://jfcy.org\n- Parent Advocacy Network: https://parentadvocacy.ca\n\n### Provincial Resources\n- Ontario: Family Law Information Centers (https://www.ontario.ca/page/family-law)\n- British Columbia: Legal Services Society (https://lss.bc.ca)\n- Alberta: Native Counselling Services (https://www.ncsa.ca)\n- Quebec: Justice Quebec (https://www.justice.gouv.qc.ca)\n- Manitoba: Manitoba Advocate for Children and Youth (https://manitobaadvocate.ca)\n\n## PERSONAL INFORMATION\n\nName: [Full Name]\nChild(ren)'s Name(s): [Child(ren)'s Names]\nCase File Number: [Case File Number]\nCourt File Number: [Court File Number]\nNext Court Date: [Next Court Date]\nCourt Location: [Court Location]\nType of Hearing: [Type of Hearing]\n\n## PREPARATION CHECKLIST\n\n### Documents to Gather\n- [ ] All correspondence with the Children's Aid Society\n- [ ] Previous court orders and case plans\n- [ ] Medical records relevant to your case\n- [ ] School records showing attendance/performance\n- [ ] Evidence of housing stability (lease agreement, utility bills)\n- [ ] Evidence of income stability (pay stubs, benefit statements)\n- [ ] Certificates from completed programs (parenting, counseling, etc.)\n- [ ] Character reference letters\n- [ ] Photographs of home environment (if relevant)\n\n### Witness Preparation\n\nPotential Witnesses to Support Your Case:\n1. [Name and relationship] - Will testify about [topic]\n2. [Name and relationship] - Will testify about [topic]\n3. [Name and relationship] - Will testify about [topic]\n\n### Timeline of Events\n\n[Create a chronological timeline of significant events related to your case]\n\n## RESPONDING TO COMMON ALLEGATIONS\n\n### Issue: [Common allegation 1]\nEvidence in my favor:\n- [Evidence point 1]\n- [Evidence point 2]\n\n### Issue: [Common allegation 2]\nEvidence in my favor:\n- [Evidence point 1]\n- [Evidence point 2]\n\n## COURT ETIQUETTE REMINDERS\n\n- Address the judge as \"Your Honor\"\n- Speak clearly and respectfully\n- Avoid interrupting others\n- Dress professionally\n- Arrive at least 30 minutes early\n- Turn off your phone\n- Bring all required documents\n- Listen carefully to instructions\n\n## QUESTIONS TO ASK YOUR LEGAL REPRESENTATIVE\n\n1. What is the specific purpose of this hearing?\n2. What outcomes are possible at this stage?\n3. What evidence will be most persuasive?\n4. What is the agency seeking?\n5. What is our strategy?\n\n## NOTES FOR COURT APPEARANCE\n\n[Space for personal notes]\n\n## POST-HEARING ACTION PLAN\n\n- [ ] Request copy of court order immediately\n- [ ] Follow up with lawyer about next steps\n- [ ] Schedule compliance with any new requirements\n- [ ] Document the hearing outcome\n- [ ] Add any new dates to calendar\n\nPrepared on: [Date of Preparation]",
        previewImageUrl: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "childNames", "casFileNumber", "courtFileNumber", "courtDate", "courtLocation", "hearingType", "commonAllegations", "witnessInformation", "evidenceList"]
      },
      {
        name: "CAS School Visit Response Guide",
        description: "What to do when Children's Aid Society representatives show up at your child's school.",
        category: "Children's Aid Society",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# WHAT TO DO WHEN CAS VISITS YOUR CHILD'S SCHOOL\n\n## IMMEDIATE ACTIONS\n\n### If You Are Notified That CAS Is at the School:\n\n1. **Stay calm and collected** - Your emotional state will affect how the situation is handled\n2. **Contact the school immediately** - Speak with the principal or school administrator\n3. **Ask for specific information**:\n   - Who is the CAS worker?\n   - What is the nature of their visit?\n   - Is this an interview or an apprehension?\n   - Has my child already been interviewed?\n4. **Inform the school administrator**:\n   - You do not consent to an interview without your presence\n   - You are on your way to the school (if possible)\n   - You wish to speak with the CAS worker directly\n5. **Document everything**:\n   - Take notes of all conversations (time, name, what was said)\n   - Ask for the CAS worker's name, ID number, and office location\n\n### Know Your Rights:\n\n- In most provinces, CAS can speak to a child at school without parental consent if they have a child protection concern\n- However, you have the right to be informed about any investigation\n- You have the right to legal representation\n- Your child has rights during any interview process\n\n## ADVOCACY RESOURCES BY PROVINCE\n\n- **Ontario**: Justice for Families (www.justice-for-families.ca) - 1-800-xxx-xxxx\n- **British Columbia**: Parent Support Services of BC (www.parentsupportbc.ca) - 1-877-345-9777\n- **Alberta**: Family Law Alberta (www.familylawalberta.ca) - 1-866-845-3425\n- **Manitoba**: Manitoba Advocate for Children and Youth (manitobaadvocate.ca) - 1-800-263-7146\n- **Quebec**: Commission des droits de la personne et des droits de la jeunesse (www.cdpdj.qc.ca) - 1-800-361-6477\n\n## FOLLOW-UP ACTIONS\n\n### Document Request Letter Template:\n\n```\n[Your Name]\n[Your Address]\n[City, Province, Postal Code]\n[Date]\n\n[CAS Office Name]\n[Address]\n\nRE: Documentation Request Regarding School Visit to [Child's Name]\n\nDear [CAS Worker/Supervisor],\n\nI am writing to formally request all documentation related to your agency's visit to my child's school, [School Name], on [Date of Visit].\n\nSpecifically, I am requesting:\n1. The reason for the visit/investigation\n2. Notes taken during any interviews with my child\n3. Any allegations made against me or my family\n4. Names of individuals who provided information leading to this visit\n5. What information was shared with school personnel\n\nAs the legal guardian of [Child's Name], I have the right to this information under [relevant provincial privacy legislation].\n\nPlease provide these documents within [X] business days. If you are unable to fulfill this request, please provide written explanation of the legal basis for refusal.\n\nSincerely,\n[Your Signature]\n[Your Name]\n[Contact Information]\n```\n\n### Action Plan Checklist:\n\n- [ ] Contact a family law attorney familiar with child protection matters\n- [ ] Request a meeting with the CAS worker and their supervisor\n- [ ] Obtain copies of any statements or reports made\n- [ ] Submit a formal complaint if proper procedures were not followed\n- [ ] Consider asking for a support person to be present at future meetings\n- [ ] Contact local advocacy groups for guidance\n- [ ] Keep a detailed log of all interactions with CAS\n\n## PREVENTION STRATEGIES\n\n### School Communication Plan:\n\n1. Meet with school administration at the beginning of the school year\n2. Establish clear protocols regarding who can speak with your child\n3. Provide written instructions about notification procedures\n4. Ensure emergency contact information is current\n5. Build positive relationships with school staff\n\n## EMOTIONAL SUPPORT RESOURCES\n\n- Family and Community Support Services (various provinces)\n- Family Service Associations (community-based support)\n- Parent Help Line: 1-888-603-9100\n- Kids Help Phone (for children): 1-800-668-6868\n\nRemember: The goal is to protect your child's best interests while asserting your parental rights appropriately. Cooperation with legitimate child protection concerns, while knowing your rights, is the most effective approach.",
        previewImageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["childName", "schoolName", "casWorkerName", "visitDate", "province", "contactInformation"]
      },
      
      // Landlord-Tenant Templates
      {
        name: "Landlord-Tenant Board Maintenance/Repair Demand Letter",
        description: "Formal demand letter to landlord requesting necessary maintenance or repairs.",
        category: "Landlord-Tenant",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Maintenance and Repair Demand Letter\n\n[Date]\n\n[Landlord/Property Management Name]\n[Address]\n\nRE: Urgent Maintenance/Repair Request - [Property Address]\n\nDear [Landlord Name],\n\nI am writing regarding urgent maintenance/repair issues at my rental unit located at [Property Address], which I have occupied since [Move-in Date] under our tenancy agreement.\n\nThe following issue(s) require immediate attention:\n\n1. [Description of First Issue] - First noticed on [Date]\n2. [Description of Second Issue] - First noticed on [Date]\n3. [Description of Third Issue] - First noticed on [Date]\n\nThese issues affect my ability to [Describe impact on habitability/quality of life] and potentially violate the following sections of the [Provincial Residential Tenancies Act]: [Relevant Sections of Act].\n\nI have previously attempted to notify you about these issues on the following dates:\n[List of previous communication attempts and dates]\n\nUnder the [Provincial Residential Tenancies Act], landlords are required to maintain rental properties in a good state of repair and fit for habitation. I request that these repairs be completed by [Reasonable Deadline Date].\n\nIf these issues are not resolved by the date specified, I will have no choice but to:\n\n1. File a formal complaint with the [Provincial Landlord-Tenant Board/Authority]\n2. Exercise my right to [Relevant tenant remedies under provincial law]\n\nPlease contact me at [Phone Number] or [Email Address] to arrange access to the unit for inspection and repairs.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]\n\nEnclosures:\n[List of supporting documents - e.g., photographs, previous correspondence, inspection reports]",
        previewImageUrl: "https://images.unsplash.com/photo-1584937104686-ebd6a1ecb0b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "landlordName", "propertyAddress", "moveInDate", "issueDescriptions", "previousNotificationDates", "deadlineDate", "contactInformation"]
      },
      {
        name: "Illegal Rent Increase Dispute",
        description: "Challenge a rent increase that exceeds legal limits or violates notice requirements.",
        category: "Landlord-Tenant",
        applicableProvinces: ["ON", "BC", "AB", "MB", "QC"],
        basePrice: 5.99,
        templateContent: "# ILLEGAL RENT INCREASE DISPUTE\n\n[Date]\n\n[Landlord/Property Management Name]\n[Address]\n\nRE: Dispute of Rent Increase for [Your Rental Address]\n\nDear [Landlord Name],\n\nI am writing to formally dispute the rent increase you have proposed in your notice dated [Date of Rent Increase Notice] for my rental unit at [Your Rental Address]. I have been a tenant at this address since [Your Move-in Date].\n\n## Legal Basis for Dispute\n\nI believe this rent increase is not valid for the following reason(s):\n\n[Select applicable reasons - delete those that don't apply]\n- The increase exceeds the maximum annual guideline of [Current Provincial Guideline]% for [Year]\n- Proper notice of [Required Notice Period] was not provided\n- The notice did not contain the required information as per the [Provincial Tenancy Act]\n- The rental unit has outstanding maintenance issues that have not been addressed\n- The increase is being implemented less than 12 months after my last increase\n- Other: [Specify other reason]\n\n## Facts and Circumstances\n\n[Provide specific details about your situation, including current rent, proposed increase amount, percentage increase, effective date, etc.]\n\n## Legal References\n\nAccording to the [Provincial Residential Tenancies Act], Section [Relevant Section Number], [Quote relevant portion of the law that supports your position].\n\n## Request\n\nBased on the above, I request that you:\n\n1. Withdraw the proposed rent increase notice\n2. Issue a new notice that complies with the legal requirements (if applicable)\n3. Reduce the proposed increase to within the legal guideline of [Legal Maximum]%\n\n## Next Steps\n\nIf we cannot resolve this matter, I intend to file an application with the [Provincial Landlord-Tenant Board/Tribunal] to have this matter formally adjudicated.\n\nI would appreciate your written response by [Date - allow reasonable time]. I am open to discussing this matter in person or by phone at [Your Phone Number].\n\nThank you for your attention to this matter.\n\nSincerely,\n\n[Your Signature]\n\n[Your Full Name]\n[Your Phone Number]\n[Your Email Address]\n\nEnclosures:\n[List any supporting documents you are including, such as copy of rent increase notice, lease agreement, etc.]",
        previewImageUrl: "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["landlordName", "rentalAddress", "moveInDate", "rentIncreaseNoticeDate", "disputeReasons", "currentRent", "proposedRent", "percentageIncrease", "effectiveDate", "provincialGuideline", "year", "provincialTenancyAct", "relevantSectionNumber", "legalMaximum", "provincialLandlordTenantBoard", "responseDate", "contactInformation"]
      },
      {
        name: "Ontario N9 Notice to End Tenancy",
        description: "Form for Ontario tenants to properly terminate their tenancy.",
        category: "Landlord-Tenant",
        applicableProvinces: ["ON"],
        basePrice: 5.99,
        templateContent: "# NOTICE TO END MY TENANCY (N9 FORM GUIDE)\n\n[Date]\n\n[Landlord/Property Management Name]\n[Address]\n\nRE: Notice to End my Tenancy at [Full Rental Address including Unit Number]\n\nDear [Landlord Name],\n\nThis letter serves as my formal notice that I am terminating my tenancy at the above address. As per the Ontario Residential Tenancies Act, I am providing the required notice for my situation.\n\n## Tenancy Details\n\n- Current tenant(s): [Full Name(s) of all tenants on the lease]\n- Rental address: [Complete Address with Unit Number]\n- Type of tenancy: [Fixed-term lease / Month-to-month]\n- Lease start date: [Original Lease Start Date]\n\n## Notice Information\n\nI will be vacating the rental unit on: [Move-out Date]\n\nI am providing [Number] days' notice based on the following situation:\n- [60 days for fixed-term or monthly tenancy]\n- [28 days for weekly tenancy]\n- [Other applicable notice period and reason for shorter notice if applicable]\n\n## Final Arrangements\n\n- Please schedule a move-out inspection for [Proposed Date/Time]\n- I request that my last month's rent deposit be applied to [Specific Month]\n- Please direct my security deposit refund to [Preferred Method/Address]\n\nI have enjoyed my time as your tenant and appreciate your understanding. I will leave the unit in a clean and well-maintained condition. Please contact me at [Phone Number] or [Email Address] if you have any questions or to arrange the return of keys.\n\nSincerely,\n\n[Your Signature]\n\n[Your Full Name]\n[Your Phone Number]\n[Your Email Address]\n\n## Ontario Notice Requirements Reference\n\n- Monthly tenancy: 60 days' notice, termination date must be the last day of a rental period\n- Fixed-term lease: 60 days' notice before the end of the lease term\n- Exceptions for special circumstances (domestic violence, care facility admission): Shortened notice periods apply\n\nThis document follows the guidelines of the Ontario Residential Tenancies Act, 2006 (RTA) and the Landlord and Tenant Board's N9 form requirements.",
        previewImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "landlordName", "rentalAddress", "tenancyType", "leaseStartDate", "moveOutDate", "noticePeriod", "contactInformation"]
      },
      {
        name: "British Columbia Residential Tenancy Dispute Resolution Application",
        description: "Application for dispute resolution with the BC Residential Tenancy Branch.",
        category: "Landlord-Tenant",
        applicableProvinces: ["BC"],
        basePrice: 5.99,
        templateContent: "# BC RESIDENTIAL TENANCY DISPUTE RESOLUTION APPLICATION GUIDE\n\n## APPLICANT INFORMATION\n\nFull Legal Name: [Your Full Legal Name]\nCurrent Address: [Your Current Address]\nPhone Number: [Your Phone Number]\nEmail Address: [Your Email Address]\nPreferred Contact Method: [Phone/Email/Mail]\n\n## RESPONDENT INFORMATION\n\nRespondent Type: [Landlord/Property Manager/Property Management Company]\nRespondent Name: [Respondent's Full Legal Name or Company Name]\nRespondent Address: [Respondent's Address for Service]\nRespondent Phone: [Respondent's Phone Number (if known)]\nRespondent Email: [Respondent's Email (if known)]\n\n## RENTAL UNIT INFORMATION\n\nStreet Address: [Full Address of Rental Unit]\nCity: [City]\nPostal Code: [Postal Code]\nTenancy Start Date: [Date Tenancy Began]\nMonthly Rent Amount: $[Monthly Rent]\nSecurity Deposit Paid: $[Deposit Amount] on [Deposit Date]\nPet Deposit Paid: $[Pet Deposit Amount] on [Deposit Date] (if applicable)\n\n## DISPUTE DETAILS\n\nI am applying for dispute resolution for the following issue(s): \n(Select all that apply)\n\n- [ ] Repairs and maintenance issues\n- [ ] Illegal rent increase\n- [ ] Return of security/pet deposit\n- [ ] Damage to property\n- [ ] Notice to end tenancy\n- [ ] Quiet enjoyment/privacy violations\n- [ ] Other: [Specify]\n\n## DESCRIPTION OF DISPUTE\n\nDetailed description of the issue(s):\n[Provide a clear, chronological explanation of your dispute, including dates, conversations with landlord, and any relevant details. Be specific and factual.]\n\n## REMEDY REQUESTED\n\nI am seeking the following remedy/remedies:\n\n1. [Specific remedy #1, e.g., \"Order for repairs to be completed by X date\"]\n2. [Specific remedy #2, e.g., \"Return of security deposit of $X\"]\n3. [Specific remedy #3, e.g., \"Monetary compensation of $X for X reason\"]\n4. [Any additional remedies]\n\nTotal monetary claim (if applicable): $[Total Amount]\n\n## EVIDENCE\n\nI will be providing the following evidence to support my claim:\n\n- [ ] Tenancy agreement\n- [ ] Photographs/videos\n- [ ] Receipts/invoices\n- [ ] Written communications (emails/texts with landlord)\n- [ ] Witness statements\n- [ ] Inspection reports\n- [ ] Other: [Specify]\n\n## HEARING PREFERENCES\n\nPreferred hearing method: [Telephone/Video Conference/Written]\nAccessibility requirements for hearing: [Specify any needs]\nInterpreter required: [Yes/No] Language: [Specify if Yes]\n\n## DECLARATION\n\nI declare that:\n- The information provided in this application is true, accurate and complete to the best of my knowledge\n- I understand that it is a violation of the Residential Tenancy Act to make a false or misleading statement\n- I have provided a copy of this application package to all respondents listed (or will do so within 3 days)\n\nPrepared on: [Today's Date]\n\n[Your Signature]\n\n[Your Full Name]\n\n## NEXT STEPS\n\n1. Submit this application to the Residential Tenancy Branch with the $100 filing fee (or apply for a fee waiver)\n2. Serve a copy of the complete application package to all respondents\n3. Complete and submit a Proof of Service form to the RTB\n4. Prepare your evidence and await your hearing date notification\n\n## BC RESOURCES\n\n- BC Residential Tenancy Branch: 1-800-665-8779\n- Online application: https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies\n- TRAC Tenant Resource & Advisory Centre: 1-800-665-1185\n- Legal Aid BC: 1-866-577-2525",
        previewImageUrl: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "currentAddress", "contactInformation", "respondentName", "respondentAddress", "rentalAddress", "tenancyStartDate", "monthlyRent", "depositAmount", "disputeDetails", "remediesRequested", "evidenceList"]
      },
      {
        name: "Alberta Residential Tenancy Dispute Resolution Form",
        description: "Form for filing residential tenancy disputes in Alberta.",
        category: "Landlord-Tenant",
        applicableProvinces: ["AB"],
        basePrice: 5.99,
        templateContent: "# ALBERTA RESIDENTIAL TENANCY DISPUTE RESOLUTION FORM\n\n## APPLICANT INFORMATION\n\nFull Legal Name: [Your Full Legal Name]\nCurrent Address: [Your Current Address]\nCity: [City] Province: Alberta Postal Code: [Postal Code]\nPhone Number: [Your Phone Number]\nEmail Address: [Your Email Address]\n\n## RESPONDENT INFORMATION\n\nRespondent Type: [Landlord/Property Management Company]\nRespondent Name: [Respondent's Full Legal Name]\nRespondent Address: [Respondent's Address]\nRespondent Phone: [Respondent's Phone Number (if known)]\nRespondent Email: [Respondent's Email (if known)]\n\n## RENTAL PROPERTY INFORMATION\n\nRental Address: [Full Address of Rental Unit]\nType of Rental: [Apartment/House/Condo/Room/Other]\nMonthly Rent: $[Monthly Rent Amount]\nSecurity Deposit: $[Security Deposit Amount]\nLease Start Date: [Lease Start Date]\nLease End Date: [Lease End Date] or [Month-to-Month]\n\n## APPLICATION DETAILS\n\nI am applying for dispute resolution for the following reason(s):\n\n- [ ] Recovery of security deposit\n- [ ] Monetary claim for damages\n- [ ] Termination of tenancy/eviction issues\n- [ ] Repairs and maintenance issues\n- [ ] Rent reduction claim\n- [ ] Entry without proper notice\n- [ ] Utility payment disputes\n- [ ] Other: [Specify]\n\n## ISSUE DESCRIPTION\n\nDetailed description of the dispute:\n[Provide a clear, chronological explanation of your dispute, including all relevant dates, conversations with the landlord, and specific details of the issue(s). Be factual and specific.]\n\n## RESOLUTION REQUESTED\n\nI am requesting the following order(s):\n\n1. [Specific remedy #1, e.g., \"Return of security deposit of $X\"]\n2. [Specific remedy #2, e.g., \"Monetary compensation of $X for damages\"]\n3. [Specific remedy #3, e.g., \"Order for repairs to be completed by X date\"]\n4. [Any additional remedies]\n\nTotal monetary claim (if applicable): $[Total Amount]\n\n## EVIDENCE\n\nI have attached the following evidence to support my claim:\n\n- [ ] Residential Tenancy Agreement (lease)\n- [ ] Notices served or received\n- [ ] Photographs/videos of the issues\n- [ ] Receipts/invoices/estimates\n- [ ] Record of communications (texts, emails, letters)\n- [ ] Witness statements\n- [ ] Inspection reports\n- [ ] Other: [Specify]\n\n## HEARING PREFERENCES\n\nPreferred hearing method: [In-person/Telephone/Video Conference]\nAccessibility accommodations required: [Specify any needs]\nInterpreter required: [Yes/No] Language: [Specify if Yes]\n\n## SERVICE DECLARATION\n\nI have served a copy of this application with all supporting documents to the respondent on [Date] by [Method of Service].\n\nOR\n\nI have not yet served the respondent and will do so within 3 days of filing this application and will file proof of service with the RTDRS.\n\n## CERTIFICATION\n\nI certify that:\n- The information provided in this application is true, complete and correct to the best of my knowledge\n- I understand it is an offense to provide false or misleading information\n- I acknowledge that the respondent will receive a copy of this application and all attached evidence\n\nDate: [Today's Date]\n\n[Your Signature]\n\n[Your Full Name]\n\n## ALBERTA RESOURCES\n\n- Residential Tenancy Dispute Resolution Service (RTDRS): 310-0000 then 780-644-3000\n- Alberta Government Consumer Contact Centre: 1-877-427-4088\n- Online resources: https://www.alberta.ca/residential-tenancy-dispute-resolution-service.aspx\n- Application filing fee: $75 (subject to change, can request a fee waiver based on financial need)",
        previewImageUrl: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "currentAddress", "contactInformation", "respondentName", "respondentAddress", "rentalAddress", "monthlyRent", "securityDeposit", "leaseStartDate", "leaseEndDate", "disputeReasons", "disputeDescription", "remediesRequested", "evidenceList"]
      },
      {
        name: "Quebec Rental Housing Tribunal Application (TAL)",
        description: "Application to the Quebec Administrative Housing Tribunal for tenant disputes.",
        category: "Landlord-Tenant",
        applicableProvinces: ["QC"],
        basePrice: 5.99,
        templateContent: "# DEMANDE AU TRIBUNAL ADMINISTRATIF DU LOGEMENT (TAL)\n(QUEBEC HOUSING TRIBUNAL APPLICATION)\n\n## INFORMATIONS DU DEMANDEUR / APPLICANT INFORMATION\n\nNom complet / Full name: [Votre nom complet / Your full name]\nAdresse actuelle / Current address: [Votre adresse actuelle / Your current address]\nVille / City: [Ville / City] Province: Québec Code postal / Postal code: [Code postal / Postal code]\nTéléphone / Phone: [Votre numéro de téléphone / Your phone number]\nCourriel / Email: [Votre courriel / Your email]\n\n## INFORMATIONS DU DÉFENDEUR / RESPONDENT INFORMATION\n\nType de défendeur / Respondent type: [Propriétaire/Gestionnaire/Compagnie / Landlord/Manager/Company]\nNom complet / Full name: [Nom complet du défendeur / Respondent's full name]\nAdresse / Address: [Adresse du défendeur / Respondent's address]\nTéléphone / Phone: [Numéro de téléphone du défendeur / Respondent's phone number (if known)]\nCourriel / Email: [Courriel du défendeur / Respondent's email (if known)]\n\n## INFORMATION SUR LE LOGEMENT / RENTAL UNIT INFORMATION\n\nAdresse du logement / Rental address: [Adresse complète du logement / Full address of rental unit]\nDate de début du bail / Lease start date: [Date de début du bail / Lease start date]\nDate de fin du bail / Lease end date: [Date de fin du bail / Lease end date] ou/or [Bail mensuel / Month-to-month]\nLoyer mensuel / Monthly rent: [Montant du loyer mensuel / Monthly rent amount]$\nDépôt versé (si applicable) / Deposit paid (if applicable): [Montant du dépôt / Deposit amount]$\n\n## OBJET DE LA DEMANDE / REASON FOR APPLICATION\n\nJe dépose cette demande pour la/les raison(s) suivante(s) / I am filing this application for the following reason(s):\n\n- [ ] Problèmes de réparations et d'entretien / Repairs and maintenance issues\n- [ ] Augmentation de loyer abusive / Excessive rent increase\n- [ ] Non-respect des conditions du bail / Non-compliance with lease terms\n- [ ] Harcèlement ou troubles de jouissance paisible / Harassment or peaceful enjoyment issues\n- [ ] Résiliation du bail / Termination of lease\n- [ ] Reprise de logement contestée / Contested repossession of dwelling\n- [ ] Autre (précisez) / Other (specify): [Précisez / Specify]\n\n## DESCRIPTION DÉTAILLÉE / DETAILED DESCRIPTION\n\nDescription détaillée de la situation / Detailed description of the situation:\n[Fournir une explication chronologique claire du litige, incluant les dates, les conversations avec le propriétaire, et tous les détails pertinents. Soyez précis et factuel. / Provide a clear, chronological explanation of your dispute, including dates, conversations with the landlord, and all relevant details. Be specific and factual.]\n\n## RECOURS DEMANDÉS / REMEDIES REQUESTED\n\nJe demande au Tribunal d'ordonner / I request that the Tribunal order:\n\n1. [Recours spécifique #1, ex. « Exécution des réparations suivantes... » / Specific remedy #1, e.g., \"Execution of the following repairs...\"]\n2. [Recours spécifique #2, ex. « Diminution de loyer de X$ » / Specific remedy #2, e.g., \"Rent reduction of $X\"]\n3. [Recours spécifique #3, ex. « Dommages-intérêts de X$ » / Specific remedy #3, e.g., \"Damages of $X\"]\n4. [Autres recours / Any additional remedies]\n\nMontant total réclamé (si applicable) / Total amount claimed (if applicable): [Montant total / Total amount]$\n\n## PREUVES / EVIDENCE\n\nJe soumets les preuves suivantes à l'appui de ma demande / I am submitting the following evidence to support my claim:\n\n- [ ] Bail / Lease agreement\n- [ ] Photos/vidéos / Photos/videos\n- [ ] Reçus/factures / Receipts/invoices\n- [ ] Communications écrites / Written communications\n- [ ] Témoignages / Witness statements\n- [ ] Rapports d'inspection / Inspection reports\n- [ ] Autre (précisez) / Other (specify): [Précisez / Specify]\n\n## PRÉFÉRENCES D'AUDIENCE / HEARING PREFERENCES\n\nMéthode d'audience préférée / Preferred hearing method: [En personne/Téléphone/Vidéoconférence / In-person/Telephone/Video conference]\nBesoins particuliers / Special needs: [Précisez tout besoin / Specify any needs]\nInterprète requis / Interpreter required: [Oui/Non / Yes/No] Langue / Language: [Précisez si Oui / Specify if Yes]\n\n## DÉCLARATION / DECLARATION\n\nJe déclare que / I declare that:\n- Les informations fournies dans cette demande sont vraies, exactes et complètes / The information provided in this application is true, accurate and complete\n- Je comprends que c'est une infraction de faire une déclaration fausse ou trompeuse / I understand that it is an offense to make a false or misleading statement\n- J'ai fourni une copie de cette demande au défendeur (ou je le ferai dans les prochains jours) / I have provided a copy of this application to the respondent (or will do so within the next few days)\n\nDate: [Date d'aujourd'hui / Today's date]\n\n[Votre signature / Your signature]\n\n[Votre nom complet / Your full name]\n\n## RESSOURCES AU QUÉBEC / QUEBEC RESOURCES\n\n- Tribunal administratif du logement: 514-873-2245 ou/or 1-800-683-2245\n- Site web / Website: https://www.tal.gouv.qc.ca/\n- Frais de dépôt / Filing fee: Entre/Between $42 et/and $83 (sujet à changement / subject to change)\n- Services juridiques communautaires / Community legal services: [Rechercher dans votre région / Search in your area]",
        previewImageUrl: "https://images.unsplash.com/photo-1551133989-7a6835da293d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "currentAddress", "contactInformation", "respondentName", "respondentAddress", "rentalAddress", "leaseStartDate", "leaseEndDate", "monthlyRent", "applicationReasons", "situationDescription", "remediesRequested", "evidenceList"]
      },
      
      // Equifax Disputes Templates
      {
        name: "Equifax Dispute Letter",
        description: "Letter to dispute incorrect information on your Equifax credit report.",
        category: "Equifax Disputes",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Equifax Credit Report Dispute Letter\n\n[Date]\n\nEquifax Canada\nNational Consumer Relations\nP.O. Box 190 Station Jean-Talon\nMontreal, Quebec\nH1S 2Z2\n\nRE: Dispute of Inaccurate Credit Information\n\nTo Whom It May Concern:\n\nI am writing to dispute inaccurate information that appears on my Equifax credit report. My name is [Full Name] and my Social Insurance Number is [SIN] (last 3 digits only: XXX-XXX-[Last 3 digits]).\n\nAfter reviewing my credit report dated [Credit Report Date], I have identified the following information that is inaccurate or incomplete:\n\nAccount/Item in Dispute: [Account Name/Number]\nReason for Dispute: [Select one or more]\n- This account does not belong to me\n- This account is closed\n- I have never been late on payments for this account\n- The amount shown is incorrect\n- This account was included in a bankruptcy\n- This account has been paid in full\n- Other: [Specify other reason]\n\nCorrect Information: [Describe what the correct information should be]\n\nEnclosed are copies of the following documents that support my position:\n[List of supporting documents - bank statements, payment confirmations, correspondence, etc.]\n\nPlease investigate this matter and correct or delete this information as per the Consumer Reporting Act. Please also send me a copy of my updated credit report showing the corrections.\n\nIf you have any questions or need additional information, please contact me at [Phone Number] or [Email Address].\n\nThank you for your prompt attention to this matter.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Current Address]\n[Phone Number]\n[Email Address]\n\nEnclosures: [List of supporting documents]\n\nNote: I am aware of my right to add a consumer statement to my credit file if the disputed information is not removed or corrected after your investigation.",
        previewImageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "sinLastThreeDigits", "creditReportDate", "accountInDispute", "reasonForDispute", "correctInformation", "supportingDocuments", "contactInformation"]
      },
      {
        name: "Equifax Credit Report Fraud Alert Request",
        description: "Request a fraud alert on your Equifax credit report to prevent identity theft.",
        category: "Equifax Disputes",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# FRAUD ALERT REQUEST LETTER\n\n[Date]\n\nEquifax Canada\nNational Consumer Relations\nP.O. Box 190 Station Jean-Talon\nMontreal, Quebec\nH1S 2Z2\n\nRE: Request for Fraud Alert on Credit Report\n\nTo Whom It May Concern:\n\nMy name is [Full Name], date of birth [Date of Birth], and my Social Insurance Number is [SIN] (last 3 digits only: XXX-XXX-[Last 3 digits]).\n\nI am writing to request that a [Initial 90-day OR Extended 7-year] fraud alert be placed on my credit file. I have reason to believe that I am or may be a victim of identity theft or fraud based on the following suspicious activity:\n\n## Suspicious Activity\n\n[Describe suspicious activity, unauthorized accounts, inquiries, or other indicators of potential fraud]\n\n## Actions Taken\n\nI have already taken the following steps regarding this matter:\n\n1. Filed a police report with [Police Department Name] on [Date], Report #[Police Report Number]\n2. Notified the following creditors of potential fraud: [List of creditors notified]\n3. [Any other actions taken]\n\n## Request for Free Credit Report\n\nPlease also send me a free copy of my credit report, as I understand I am entitled to one upon placing a fraud alert.\n\n## Additional Requests\n\n[Select any that apply - delete those that don't]\n- Please remove my name and address from pre-approved credit offer mailing lists for five years\n- Please inform me of any requests made for my credit report while the fraud alert is in effect\n\nIf you need additional information or documentation to process this request, please contact me at [Phone Number] or [Email Address].\n\nThank you for your prompt attention to this matter.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Current Address]\n[Phone Number]\n[Email Address]\n\nEnclosures:\n[List any supporting documents you are including, such as copy of police report, ID, etc.]",
        previewImageUrl: "https://images.unsplash.com/photo-1616077168712-fc6c788c4ecc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "dateOfBirth", "sinLastThreeDigits", "fraudAlertDuration", "suspiciousActivity", "policeDepartmentName", "policeReportDate", "policeReportNumber", "creditorsNotified", "additionalRequests", "contactInformation"]
      },
      
      // Transition Services Templates
      {
        name: "Social Assistance Appeal Letter",
        description: "Appeal a denial or reduction of social assistance or disability benefits.",
        category: "Transition Services",
        applicableProvinces: ["ON", "BC", "AB", "MB", "SK", "NS", "QC"],
        basePrice: 5.99,
        templateContent: "# SOCIAL ASSISTANCE APPEAL LETTER\n\n[Date]\n\n[Appeal Board/Tribunal Name]\n[Address]\n\nRE: Appeal of Decision on Social Assistance Application/Benefits\nReference Number: [File/Reference Number]\n\nDear Members of the [Appeal Board/Tribunal Name],\n\nI, [Your Full Name], am writing to formally appeal the decision made by [Agency Name] dated [Decision Date] regarding my application for/benefits under [Program Name].\n\n## Decision Being Appealed\n\n[Clearly state what decision you are appealing - e.g., denial of benefits, reduction in benefits, termination of benefits, etc.]\n\n## Grounds for Appeal\n\nI believe this decision is incorrect for the following reasons:\n\n1. [First reason - be specific]\n2. [Second reason - be specific]\n3. [Additional reasons as applicable]\n\n## My Current Situation\n\n[Describe your current financial and living situation, focusing on areas of need and hardship]\n\n## Supporting Documentation\n\nI have attached the following documents to support my appeal:\n\n1. [Copy of the original decision letter]\n2. [Medical documentation, if applicable]\n3. [Income verification]\n4. [Housing costs verification]\n5. [Other supporting evidence]\n\n## Request\n\nBased on the information provided, I request that the [Appeal Board/Tribunal Name]:\n\n1. Review the decision made by [Agency Name]\n2. [Specific request - e.g., approve my application for benefits, restore my previous benefit level, etc.]\n\n## Need for Expedited Decision\n\n[If applicable, explain why you need an expedited decision - e.g., risk of eviction, inability to afford medication, etc.]\n\nPlease acknowledge receipt of this appeal and advise me of the next steps in the appeal process, including any hearing dates. I can be reached at [Phone Number] or [Email Address].\n\nThank you for your consideration of my appeal.\n\nSincerely,\n\n[Signature]\n\n[Your Full Name]\n[Your Address]\n[Your Phone Number]\n[Your Email Address]\n\nEnclosures: [List all enclosed documents]",
        previewImageUrl: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "appealBoardName", "referenceNumber", "agencyName", "decisionDate", "programName", "decisionDescription", "appealGrounds", "currentSituation", "supportingDocuments", "specificRequest", "expeditedReason", "contactInformation"]
      },
      {
        name: "Emergency Housing Application Letter",
        description: "Request emergency housing or shelter services when facing homelessness.",
        category: "Transition Services",
        applicableProvinces: ["ON", "BC", "AB", "MB", "QC"],
        basePrice: 5.99,
        templateContent: "# EMERGENCY HOUSING APPLICATION LETTER\n\n[Date]\n\n[Housing Authority/Shelter Name]\n[Address]\n\nRE: Urgent Request for Emergency Housing Assistance\n\nDear [Housing Authority/Appropriate Department],\n\nI, [Your Full Name], am writing to request immediate emergency housing assistance. I am currently in a housing crisis and facing [imminent homelessness/am currently homeless] due to [brief explanation of circumstances].\n\n## Current Housing Situation\n\n[Detailed description of your current housing situation, including:]  \n- Current living arrangement: [e.g., temporarily staying with friends, in shelter, in car, etc.]  \n- Date when current arrangement ends (if applicable): [Date]  \n- Reason for housing crisis: [e.g., eviction, domestic violence, fire, etc.]  \n- Length of time in crisis: [how long you've been without stable housing]  \n\n## Household Information\n\nPersons requiring housing:  \n1. [Your name], [age], [any relevant health conditions]  \n2. [Additional household member], [age], [relationship to you], [any relevant health conditions]  \n3. [Additional household members as applicable]  \n\nTotal monthly household income: $[Amount] from [sources of income]  \n\n## Special Circumstances/Needs\n\n[Describe any special circumstances that make your situation particularly urgent or any special needs your household has, such as:]  \n- Health or mobility issues requiring accessible housing  \n- Safety concerns (e.g., fleeing domestic violence)  \n- Children's school locations  \n- Employment locations  \n- Mental health considerations  \n\n## Previous Assistance\n\n[List any previous attempts to secure housing assistance, including agencies contacted and outcomes]\n\n## Requested Assistance\n\nI am requesting:  \n- [Type of assistance needed - emergency shelter, temporary housing subsidy, priority placement on subsidized housing waitlist, etc.]  \n- Preferred location(s): [if relevant]  \n- Timeframe needed: [immediate/specific date]  \n\n## Supporting Documentation\n\nI have attached the following documents to support my request:  \n1. [ID/proof of identity]  \n2. [Income verification]  \n3. [Eviction notice, if applicable]  \n4. [Medical documentation, if applicable]  \n5. [Police reports or restraining orders, if relevant]  \n\nDue to the urgent nature of my situation, I would greatly appreciate your expedited review of my application. I can be reached at [Phone Number] or [Email Address] at any time.\n\nThank you for your consideration of my request.\n\nSincerely,\n\n[Signature]\n\n[Your Full Name]\n[Current Contact Address]\n[Phone Number]\n[Email Address]\n\nEnclosures: [List all enclosed documents]",
        previewImageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "housingAuthorityName", "housingCrisisDescription", "currentLivingArrangement", "endDate", "reasonForCrisis", "crisisDuration", "householdMembers", "monthlyIncome", "incomeSources", "specialCircumstances", "previousAssistance", "assistanceType", "preferredLocations", "timeframeNeeded", "supportingDocuments", "contactInformation"]
      },
      
      // General Templates
      {
        name: "Administrative Tribunal Appeal",
        description: "For appealing decisions made by government administrative tribunals.",
        category: "Appeals",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Administrative Tribunal Appeal\n\n[Date]\n\n[Administrative Tribunal Name]\n[Address]\n\nRE: Appeal of Decision [Reference Number]\n\nDear Sir/Madam,\n\nI, [Full Name], am writing to formally appeal the decision made by [Agency/Tribunal] dated [Decision Date] regarding [Brief Description of Case].\n\n[Detailed explanation of grounds for appeal]\n\nIn light of the above, I respectfully request that the tribunal review the decision and [Specific Request/Outcome].\n\nThank you for your consideration.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]",
        previewImageUrl: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "tribunalName", "decisionReferenceNumber", "decisionDate", "caseDescription", "groundsForAppeal", "requestedOutcome"]
      },
      {
        name: "Freedom of Information Request",
        description: "Request information from government agencies under FOI legislation.",
        category: "Information Requests",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Freedom of Information Request\n\n[Date]\n\n[Government Agency Name]\n[Address]\n\nRE: Freedom of Information Request\n\nDear Sir/Madam,\n\nI, [Full Name], am writing to request information under the [Applicable FOI Act] about [Subject of Request].\n\nSpecifically, I am seeking the following information:\n[Detailed description of requested information]\n\nPlease provide the information in the following format: [Preferred Format]\n\nShould you require any clarification or if fees are applicable, please contact me at [Contact Information].\n\nThank you for your assistance.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]",
        previewImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "agencyName", "applicableFOIAct", "requestSubject", "requestedInformation", "preferredFormat"]
      },
      {
        name: "Tax Assessment Dispute",
        description: "Challenge tax assessments from the CRA or provincial tax authorities.",
        category: "Tax Disputes",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Tax Assessment Dispute\n\n[Date]\n\n[Tax Authority Name]\n[Address]\n\nRE: Dispute of Tax Assessment [Reference Number]\n\nDear Sir/Madam,\n\nI, [Full Name], [Tax ID Number], am writing to formally dispute the tax assessment issued on [Assessment Date] for the tax period [Tax Period].\n\nI believe the assessment is incorrect for the following reasons:\n[Detailed explanation of grounds for dispute]\n\nEnclosed are the following documents that support my position:\n[List of supporting documents]\n\nBased on the above, I request that the assessment be [Specific request - e.g., cancelled, reduced, etc.].\n\nPlease contact me at [Contact Information] if you require any additional information.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]",
        previewImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "taxIdNumber", "taxAuthorityName", "assessmentReferenceNumber", "assessmentDate", "taxPeriod", "disputeGrounds", "supportingDocuments", "specificRequest"]
      },
      {
        name: "T6 - Tenant Application About Maintenance",
        description: "Ontario Landlord and Tenant Board form for tenants seeking remedies related to maintenance issues.",
        category: "Landlord-Tenant",
        applicableProvinces: ["ON"],
        basePrice: 9.99,
        templateContent: "# TENANT APPLICATION ABOUT MAINTENANCE (FORM T6)\n\n## Part 1: General Information\n\n### Tenant Information\nTenant's Name: [Full Name]\nMailing Address: [Address]\nPhone Number: [Phone]\nEmail: [Email]\n\n### Rental Unit Information\nRental Unit Address: [Rental Unit Address]\nTenancy Start Date: [Tenancy Start Date]\nCurrent Rent: $[Current Rent] per [month/week]\n\n### Landlord Information\nLandlord's Name: [Landlord Name]\nLandlord's Address: [Landlord Address]\nLandlord's Phone: [Landlord Phone]\nLandlord's Email: [Landlord Email]\n\n## Part 2: Maintenance Issues\n\n### Details of Maintenance Problems\n[Provide a detailed description of all maintenance issues in your rental unit including when they started, attempts to get them fixed, and their impact on your living conditions.]\n\n### Communication with Landlord\nI reported these issues to my landlord on the following dates:\n1. [Date 1] - Method: [in person/phone/email/text] - Response: [response]\n2. [Date 2] - Method: [in person/phone/email/text] - Response: [response]\n3. [Date 3] - Method: [in person/phone/email/text] - Response: [response]\n\n## Part 3: Remedies Requested\n\nI am requesting the following remedies:\n\n- [ ] An order requiring the landlord to complete the following repairs/maintenance work: [List repairs needed]\n- [ ] An order for a rent abatement of $[Amount] for the period from [Start Date] to [End Date]\n- [ ] An order for compensation of $[Amount] for: [Property damage/replacement costs/expenses]\n- [ ] An order for a rent reduction of [Percentage]% until the work is completed\n- [ ] An order permitting me to complete the necessary work and deduct the cost from my rent\n- [ ] Other remedies: [Specify other remedies sought]\n\n## Part 4: Evidence and Supporting Documentation\n\nI have attached the following evidence to support my application:\n\n- [ ] Photos/videos of the maintenance issues\n- [ ] Copies of communication with the landlord (texts, emails, letters)\n- [ ] Inspection reports (e.g., from public health, building inspection)\n- [ ] Witness statements\n- [ ] Medical reports (if health has been affected)\n- [ ] Receipts for expenses related to the maintenance issues\n- [ ] Other: [Specify other evidence]\n\n## Part 5: Signature\n\nI, [Full Name], confirm that the information provided in this application is complete and accurate.\n\nSignature: ________________________\n\nDate: [Current Date]\n\n## Important Notes:\n\n1. This is a template to help prepare your T6 application. The official form must be submitted through the Landlord and Tenant Board.\n2. Include specific dates, times, and details of all maintenance issues and communications.\n3. Be precise about the remedies you're seeking.\n4. Organize your evidence and submit copies (not originals) with your application.\n5. Keep a copy of your application and all supporting documents.\n\n## Legal Resources:\n\n- Landlord and Tenant Board: https://tribunalsontario.ca/ltb/\n- Community Legal Clinics: https://www.legalaid.on.ca/legal-clinics/\n- Steps to Justice: https://stepstojustice.ca/legal-topic/housing-law/",
        previewImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "address", "phone", "email", "rentalUnitAddress", "tenancyStartDate", "currentRent", "landlordName", "landlordAddress", "landlordPhone", "landlordEmail", "maintenanceIssuesDetails", "dateReported1", "methodReported1", "responseReceived1", "repairsNeeded", "rentAbatementAmount", "startDate", "endDate", "compensationAmount", "rentReductionPercentage", "otherRemedies", "currentDate"]
      },
      {
        name: "T2 - Tenant Application About Rights",
        description: "Ontario Landlord and Tenant Board form for tenants seeking remedies for landlord violations of rights.",
        category: "Landlord-Tenant",
        applicableProvinces: ["ON"],
        basePrice: 9.99,
        templateContent: "# TENANT APPLICATION ABOUT RIGHTS (FORM T2)\n\n## Part 1: General Information\n\n### Tenant Information\nTenant's Name: [Full Name]\nMailing Address: [Address]\nPhone Number: [Phone]\nEmail: [Email]\n\n### Rental Unit Information\nRental Unit Address: [Rental Unit Address]\nTenancy Start Date: [Tenancy Start Date]\nCurrent Rent: $[Current Rent] per [month/week]\n\n### Landlord Information\nLandlord's Name: [Landlord Name]\nLandlord's Address: [Landlord Address]\nLandlord's Phone: [Landlord Phone]\nLandlord's Email: [Landlord Email]\n\n## Part 2: Grounds for Application\n\nI believe my landlord has committed the following offenses under the Residential Tenancies Act (check all that apply):\n\n- [ ] Entered my rental unit illegally\n- [ ] Changed the locks without providing new keys\n- [ ] Substantially interfered with my reasonable enjoyment of the rental unit\n- [ ] Harassed, obstructed, coerced, threatened, or interfered with me\n- [ ] Withheld or interfered with vital services, care services, or meals\n- [ ] Discriminated against me\n- [ ] Did not give required notice before entering\n- [ ] Other: [Specify other grounds]\n\n## Part 3: Details of the Incidents\n\n### Incident 1:\nDate: [Date of Incident 1]\nTime: [Time of Incident 1]\nLocation: [Location of Incident 1]\n\nDescription of incident:\n[Provide detailed description of what happened, who was involved, and how it affected you. Include specific quotes, actions, and consequences.]\n\nWitnesses (if any): [Names of Witnesses]\n\n### Incident 2:\nDate: [Date of Incident 2]\nTime: [Time of Incident 2]\nLocation: [Location of Incident 2]\n\nDescription of incident:\n[Provide detailed description of what happened, who was involved, and how it affected you. Include specific quotes, actions, and consequences.]\n\nWitnesses (if any): [Names of Witnesses]\n\n### Incident 3:\nDate: [Date of Incident 3]\nTime: [Time of Incident 3]\nLocation: [Location of Incident 3]\n\nDescription of incident:\n[Provide detailed description of what happened, who was involved, and how it affected you. Include specific quotes, actions, and consequences.]\n\nWitnesses (if any): [Names of Witnesses]\n\n## Part 4: Remedies Requested\n\nI am requesting the following remedies:\n\n- [ ] An order that the landlord pay a fine to the Landlord and Tenant Board\n- [ ] An order requiring the landlord to stop the behavior described in this application\n- [ ] An order authorizing me to change the locks\n- [ ] An order that the tenancy be terminated\n- [ ] An order that the landlord pay me a rent abatement of $[Amount]\n- [ ] An order that the landlord pay me compensation of $[Amount] for: [Reason for compensation]\n- [ ] Other remedies: [Specify other remedies sought]\n\n## Part 5: Evidence and Supporting Documentation\n\nI have attached the following evidence to support my application:\n\n- [ ] Photos/videos of incidents\n- [ ] Audio recordings\n- [ ] Copies of communication with the landlord (texts, emails, letters)\n- [ ] Police reports\n- [ ] Witness statements\n- [ ] Medical reports (if health has been affected)\n- [ ] Other: [Specify other evidence]\n\n## Part 6: Signature\n\nI, [Full Name], confirm that the information provided in this application is complete and accurate.\n\nSignature: ________________________\n\nDate: [Current Date]\n\n## Important Notes:\n\n1. This is a template to help prepare your T2 application. The official form must be submitted through the Landlord and Tenant Board.\n2. Include specific dates, times, and details of all incidents.\n3. Be precise about the remedies you're seeking.\n4. Organize your evidence and submit copies (not originals) with your application.\n5. Keep a copy of your application and all supporting documents.\n\n## Legal Resources:\n\n- Landlord and Tenant Board: https://tribunalsontario.ca/ltb/\n- Community Legal Clinics: https://www.legalaid.on.ca/legal-clinics/\n- Steps to Justice: https://stepstojustice.ca/legal-topic/housing-law/",
        previewImageUrl: "https://images.unsplash.com/photo-1505455184862-554165e5f6ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "address", "phone", "email", "rentalUnitAddress", "tenancyStartDate", "currentRent", "landlordName", "landlordAddress", "landlordPhone", "landlordEmail", "offenseGrounds", "otherGrounds", "dateOfIncident1", "timeOfIncident1", "locationOfIncident1", "descriptionOfIncident1", "witnesses1", "dateOfIncident2", "timeOfIncident2", "locationOfIncident2", "descriptionOfIncident2", "witnesses2", "dateOfIncident3", "timeOfIncident3", "locationOfIncident3", "descriptionOfIncident3", "witnesses3", "rentAbatementAmount", "compensationAmount", "reasonForCompensation", "otherRemedies", "currentDate"]
      }
    ];
    
    templates.forEach(template => {
      const id = this.currentDocumentTemplateId++;
      this.documentTemplates.set(id, { ...template, id });
    });
  }
  // Seed community categories
  private seedCommunityCategories() {
    const categories: InsertCommunityCategory[] = [
      {
        name: "Stories",
        description: "Share your personal experiences and journeys",
        icon: "bookOpen",
        sortOrder: 1,
        isActive: true
      },
      {
        name: "Advice & Support",
        description: "Seek guidance or provide support to others in similar situations",
        icon: "helping-hand",
        sortOrder: 2,
        isActive: true
      },
      {
        name: "Resources",
        description: "Share helpful resources, links, and information",
        icon: "library",
        sortOrder: 3,
        isActive: true
      },
      {
        name: "Success Stories",
        description: "Celebrate victories, big and small, in your self-advocacy journey",
        icon: "trophy",
        sortOrder: 4,
        isActive: true
      },
      {
        name: "Mental Health",
        description: "A safe space to discuss mental health challenges and coping strategies",
        icon: "heart",
        sortOrder: 5,
        isActive: true
      }
    ];
    
    categories.forEach(category => {
      const id = this.currentCommunityCategoryId++;
      const now = new Date().toISOString();
      this.communityCategories.set(id, { ...category, id, createdAt: now });
    });
  }
  
  // Community comment operations
  async getCommunityComments(postId: number): Promise<CommunityComment[]> {
    return Array.from(this.communityComments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async getCommunityComment(id: number): Promise<CommunityComment | undefined> {
    return this.communityComments.get(id);
  }
  
  async createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment> {
    const id = this.currentCommunityCommentId++;
    const now = new Date().toISOString();
    const newComment: CommunityComment = {
      ...comment,
      id,
      likeCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.communityComments.set(id, newComment);
    return newComment;
  }
  
  async updateCommunityComment(id: number, commentData: Partial<CommunityComment>): Promise<CommunityComment | undefined> {
    const existingComment = this.communityComments.get(id);
    if (!existingComment) return undefined;
    
    const now = new Date().toISOString();
    const updatedComment = {
      ...existingComment,
      ...commentData,
      updatedAt: now
    };
    this.communityComments.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteCommunityComment(id: number): Promise<boolean> {
    // Check if the comment exists
    const existingComment = this.communityComments.get(id);
    if (!existingComment) return false;
    
    // Delete all likes for this comment
    const likesToDelete = Array.from(this.communityCommentLikes.values())
      .filter(like => like.commentId === id);
      
    for (const like of likesToDelete) {
      this.communityCommentLikes.delete(like.id);
    }
    
    // Delete all child comments (replies)
    const repliesDeleted = this.deleteCommentReplies(id);
    
    // Delete the comment itself
    this.communityComments.delete(id);
    return true;
  }
  
  private deleteCommentReplies(parentCommentId: number): boolean {
    const replies = Array.from(this.communityComments.values())
      .filter(comment => comment.parentCommentId === parentCommentId);
      
    for (const reply of replies) {
      // Recursive delete for nested replies
      this.deleteCommentReplies(reply.id);
      
      // Delete likes for this reply
      const likesToDelete = Array.from(this.communityCommentLikes.values())
        .filter(like => like.commentId === reply.id);
        
      for (const like of likesToDelete) {
        this.communityCommentLikes.delete(like.id);
      }
      
      // Delete the reply
      this.communityComments.delete(reply.id);
    }
    
    return true;
  }
  
  // Community like operations
  async togglePostLike(postId: number, userId: number): Promise<boolean> {
    // Check if user already liked this post
    const existingLike = Array.from(this.communityPostLikes.values())
      .find(like => like.postId === postId && like.userId === userId);
      
    if (existingLike) {
      // Unlike: remove the like
      this.communityPostLikes.delete(existingLike.id);
      
      // Update post like count
      const post = this.communityPosts.get(postId);
      if (post) {
        const updatedPost = {
          ...post,
          likeCount: Math.max(0, (post.likeCount || 0) - 1)
        };
        this.communityPosts.set(postId, updatedPost);
      }
      
      return false; // Indicates unliked
    } else {
      // Like: add new like
      const id = this.currentCommunityPostLikeId++;
      const now = new Date().toISOString();
      const newLike: CommunityPostLike = {
        id,
        postId,
        userId,
        createdAt: now
      };
      this.communityPostLikes.set(id, newLike);
      
      // Update post like count
      const post = this.communityPosts.get(postId);
      if (post) {
        const updatedPost = {
          ...post,
          likeCount: (post.likeCount || 0) + 1
        };
        this.communityPosts.set(postId, updatedPost);
      }
      
      return true; // Indicates liked
    }
  }
  
  async toggleCommentLike(commentId: number, userId: number): Promise<boolean> {
    // Check if user already liked this comment
    const existingLike = Array.from(this.communityCommentLikes.values())
      .find(like => like.commentId === commentId && like.userId === userId);
      
    if (existingLike) {
      // Unlike: remove the like
      this.communityCommentLikes.delete(existingLike.id);
      
      // Update comment like count
      const comment = this.communityComments.get(commentId);
      if (comment) {
        const updatedComment = {
          ...comment,
          likeCount: Math.max(0, (comment.likeCount || 0) - 1)
        };
        this.communityComments.set(commentId, updatedComment);
      }
      
      return false; // Indicates unliked
    } else {
      // Like: add new like
      const id = this.currentCommunityCommentLikeId++;
      const now = new Date().toISOString();
      const newLike: CommunityCommentLike = {
        id,
        commentId,
        userId,
        createdAt: now
      };
      this.communityCommentLikes.set(id, newLike);
      
      // Update comment like count
      const comment = this.communityComments.get(commentId);
      if (comment) {
        const updatedComment = {
          ...comment,
          likeCount: (comment.likeCount || 0) + 1
        };
        this.communityComments.set(commentId, updatedComment);
      }
      
      return true; // Indicates liked
    }
  }
  
  async getPostLikes(postId: number): Promise<CommunityPostLike[]> {
    return Array.from(this.communityPostLikes.values())
      .filter(like => like.postId === postId);
  }
  
  async getCommentLikes(commentId: number): Promise<CommunityCommentLike[]> {
    return Array.from(this.communityCommentLikes.values())
      .filter(like => like.commentId === commentId);
  }
  
  // Community bookmark operations
  async toggleBookmark(postId: number, userId: number): Promise<boolean> {
    // Check if user already bookmarked this post
    const existingBookmark = Array.from(this.communityBookmarks.values())
      .find(bookmark => bookmark.postId === postId && bookmark.userId === userId);
      
    if (existingBookmark) {
      // Remove bookmark
      this.communityBookmarks.delete(existingBookmark.id);
      return false; // Indicates removed
    } else {
      // Add bookmark
      const id = this.currentCommunityBookmarkId++;
      const now = new Date().toISOString();
      const newBookmark: CommunityBookmark = {
        id,
        postId,
        userId,
        createdAt: now
      };
      this.communityBookmarks.set(id, newBookmark);
      return true; // Indicates added
    }
  }
  
  async getUserBookmarks(userId: number): Promise<CommunityBookmark[]> {
    return Array.from(this.communityBookmarks.values())
      .filter(bookmark => bookmark.userId === userId);
  }
  
  // User role operations
  async getUserRole(userId: number): Promise<UserRole | undefined> {
    return Array.from(this.userRoles.values())
      .find(role => role.userId === userId);
  }
  
  async assignUserRole(role: InsertUserRole): Promise<UserRole> {
    // Remove any existing role for this user
    const existingRoles = Array.from(this.userRoles.values())
      .filter(r => r.userId === role.userId);
      
    for (const existingRole of existingRoles) {
      this.userRoles.delete(existingRole.id);
    }
    
    // Add new role
    const id = this.currentUserRoleId++;
    const now = new Date().toISOString();
    const newRole: UserRole = {
      ...role,
      id,
      createdAt: now
    };
    this.userRoles.set(id, newRole);
    return newRole;
  }
  
  async updateUserRole(userId: number, role: string): Promise<UserRole | undefined> {
    const existingRole = Array.from(this.userRoles.values())
      .find(r => r.userId === userId);
      
    if (!existingRole) return undefined;
    
    const updatedRole = {
      ...existingRole,
      role
    };
    this.userRoles.set(existingRole.id, updatedRole);
    return updatedRole;
  }

  // Marketing funnel event methods
  async trackFunnelEvent(event: InsertMarketingFunnelEvent): Promise<MarketingFunnelEvent> {
    const id = this.currentMarketingFunnelEventId++;
    const now = new Date().toISOString();
    const newEvent: MarketingFunnelEvent = {
      ...event,
      id,
      createdAt: now
    };
    this.marketingFunnelEvents.set(id, newEvent);
    return newEvent;
  }

  async getFunnelEvents(funnelName?: string): Promise<MarketingFunnelEvent[]> {
    const events = Array.from(this.marketingFunnelEvents.values());
    
    if (funnelName) {
      return events.filter(event => event.funnelName === funnelName);
    }
    
    return events;
  }

  async getUserFunnelEvents(userId: number): Promise<MarketingFunnelEvent[]> {
    return Array.from(this.marketingFunnelEvents.values()).filter(
      event => event.userId === userId
    );
  }

  // Marketing lead methods
  async createMarketingLead(lead: InsertMarketingLead): Promise<MarketingLead> {
    const id = this.currentMarketingLeadId++;
    const now = new Date().toISOString();
    const newLead: MarketingLead = {
      ...lead,
      id,
      convertedToUser: false,
      userId: null,
      createdAt: now,
      updatedAt: now
    };
    this.marketingLeads.set(id, newLead);
    return newLead;
  }

  async getMarketingLeadByEmail(email: string): Promise<MarketingLead | undefined> {
    return Array.from(this.marketingLeads.values()).find(
      lead => lead.email === email
    );
  }

  async updateMarketingLead(id: number, leadData: Partial<MarketingLead>): Promise<MarketingLead | undefined> {
    const existingLead = this.marketingLeads.get(id);
    if (!existingLead) return undefined;
    
    const now = new Date().toISOString();
    const updatedLead = {
      ...existingLead,
      ...leadData,
      updatedAt: now
    };
    this.marketingLeads.set(id, updatedLead);
    return updatedLead;
  }

  async convertLeadToUser(leadId: number, userId: number): Promise<MarketingLead> {
    const lead = this.marketingLeads.get(leadId);
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }
    
    const now = new Date().toISOString();
    const updatedLead = {
      ...lead,
      convertedToUser: true,
      userId,
      updatedAt: now
    };
    this.marketingLeads.set(leadId, updatedLead);
    return updatedLead;
  }
  
  // Evidence file operations
  async getEvidenceFiles(userId: number): Promise<EvidenceFile[]> {
    return Array.from(this.evidenceFiles.values()).filter(
      (file) => file.userId === userId
    );
  }
  
  async getEvidenceFile(id: number): Promise<EvidenceFile | undefined> {
    return this.evidenceFiles.get(id);
  }
  
  async createEvidenceFile(file: InsertEvidenceFile): Promise<EvidenceFile> {
    try {
      console.log("Storage: createEvidenceFile called with data:", {
        userId: file.userId,
        fileName: file.fileName,
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize
      });
      
      // Validate essential fields
      if (!file.userId) {
        console.error("Storage: Missing required userId for evidence file");
        throw new Error("User ID is required for evidence file upload");
      }
      
      if (!file.fileName) {
        console.error("Storage: Missing required fileName for evidence file");
        throw new Error("File name is required for evidence file upload");
      }
      
      // Check if the user exists - but don't fail if not found
      // This allows us to handle demo cases and temporary uploads
      const user = this.users.get(file.userId);
      if (!user) {
        console.log(`Storage: Warning - User with ID ${file.userId} not found for evidence file upload, but proceeding anyway`);
        // Create the user if it doesn't exist (with minimal information)
        if (!this.users.has(file.userId)) {
          this.users.set(file.userId, {
            id: file.userId,
            username: `temp_user_${file.userId}`,
            email: `temp_user_${file.userId}@example.com`,
            password: "placeholder", // This is just a placeholder, not a real password
            firstName: "Temporary",
            lastName: "User",
            createdAt: new Date().toISOString(),
            isActive: true
          });
          console.log(`Storage: Created temporary user with ID ${file.userId} to allow file upload`);
        }
      }
      else {
        console.log(`Storage: Verified user exists with ID ${file.userId}`);
      }
      
      const id = this.currentEvidenceFileId++;
      console.log("Storage: Assigned evidence file ID:", id);
      
      const now = new Date().toISOString();
      const newFile: EvidenceFile = {
        ...file,
        id,
        createdAt: now,
        updatedAt: now,
        analyzedContent: null
      };
      
      // Store the file
      this.evidenceFiles.set(id, newFile);
      console.log("Storage: Evidence file created successfully with ID:", id);
      
      return newFile;
    } catch (error) {
      console.error("Storage: Error creating evidence file:", error);
      throw error;
    }
  }
  
  async updateEvidenceFile(id: number, fileData: Partial<EvidenceFile>): Promise<EvidenceFile | undefined> {
    const existingFile = this.evidenceFiles.get(id);
    if (!existingFile) return undefined;
    
    const now = new Date().toISOString();
    const updatedFile = {
      ...existingFile,
      ...fileData,
      updatedAt: now
    };
    this.evidenceFiles.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteEvidenceFile(id: number): Promise<boolean> {
    const exists = this.evidenceFiles.has(id);
    if (!exists) return false;
    
    this.evidenceFiles.delete(id);
    return true;
  }
  
  async updateEvidenceAnalysis(id: number, analyzedContent: string): Promise<EvidenceFile | undefined> {
    const existingFile = this.evidenceFiles.get(id);
    if (!existingFile) return undefined;
    
    const now = new Date().toISOString();
    const updatedFile = {
      ...existingFile,
      analyzedContent,
      updatedAt: now
    };
    this.evidenceFiles.set(id, updatedFile);
    return updatedFile;
  }
  
  // Case analysis operations
  async getCaseAnalyses(userId: number): Promise<CaseAnalysis[]> {
    return Array.from(this.caseAnalyses.values()).filter(
      (analysis) => analysis.userId === userId
    );
  }
  
  async getCaseAnalysis(id: number): Promise<CaseAnalysis | undefined> {
    return this.caseAnalyses.get(id);
  }
  
  async createCaseAnalysis(analysis: InsertCaseAnalysis): Promise<CaseAnalysis> {
    const id = this.currentCaseAnalysisId++;
    const now = new Date().toISOString();
    const newAnalysis: CaseAnalysis = {
      ...analysis,
      id,
      createdAt: now,
      updatedAt: now,
      meritScore: null,
      meritWeight: null,
      meritAssessment: null,
      predictedOutcome: null,
      meritFactors: null
    };
    this.caseAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async updateCaseAnalysis(id: number, analysisData: Partial<CaseAnalysis>): Promise<CaseAnalysis | undefined> {
    const existingAnalysis = this.caseAnalyses.get(id);
    if (!existingAnalysis) return undefined;
    
    const now = new Date().toISOString();
    const updatedAnalysis = {
      ...existingAnalysis,
      ...analysisData,
      updatedAt: now
    };
    this.caseAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  async getCaseAnalysisByEvidence(evidenceIds: number[]): Promise<CaseAnalysis | undefined> {
    // Find a case analysis that contains all the specified evidence files
    return Array.from(this.caseAnalyses.values()).find(analysis => {
      // Check if the analysis has a properly formatted evidenceIds field and if it contains all the specified evidence IDs
      if (!analysis.evidenceIds) return false;
      
      const analysisEvidenceIds = JSON.parse(analysis.evidenceIds as string);
      return evidenceIds.every(id => analysisEvidenceIds.includes(id));
    });
  }
  
  async addMeritAssessment(id: number, meritScore: number, meritWeight: number, meritAssessment: string, predictedOutcome: string, meritFactors: any): Promise<CaseAnalysis | undefined> {
    const existingAnalysis = this.caseAnalyses.get(id);
    if (!existingAnalysis) return undefined;
    
    const now = new Date().toISOString();
    const updatedAnalysis = {
      ...existingAnalysis,
      meritScore,
      meritWeight,
      meritAssessment,
      predictedOutcome,
      meritFactors: JSON.stringify(meritFactors),
      updatedAt: now
    };
    this.caseAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  // Chat operations
  async getChatConversations(userId: number): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }
  
  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    return this.chatConversations.get(id);
  }
  
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const id = this.currentChatConversationId++;
    const now = new Date().toISOString();
    const newConversation: ChatConversation = {
      ...conversation,
      id,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now
    };
    this.chatConversations.set(id, newConversation);
    return newConversation;
  }
  
  async updateChatConversation(id: number, conversationData: Partial<ChatConversation>): Promise<ChatConversation | undefined> {
    const existingConversation = this.chatConversations.get(id);
    if (!existingConversation) return undefined;
    
    const now = new Date().toISOString();
    const updatedConversation = {
      ...existingConversation,
      ...conversationData,
      updatedAt: now
    };
    this.chatConversations.set(id, updatedConversation);
    return updatedConversation;
  }
  
  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const now = new Date().toISOString();
    const newMessage: ChatMessage = {
      ...message,
      id,
      createdAt: now
    };
    this.chatMessages.set(id, newMessage);
    
    // Update the conversation's lastMessageAt timestamp
    const conversation = this.chatConversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessageAt = now;
      this.chatConversations.set(conversation.id, conversation);
    }
    
    return newMessage;
  }

  // Resource category methods
  async getResourceCategories(): Promise<ResourceCategory[]> {
    return Array.from(this.resourceCategories.values())
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
  
  async getResourceCategory(id: number): Promise<ResourceCategory | undefined> {
    return this.resourceCategories.get(id);
  }
  
  async createResourceCategory(category: InsertResourceCategory): Promise<ResourceCategory> {
    const id = this.currentResourceCategoryId++;
    const now = new Date().toISOString();
    const newCategory: ResourceCategory = {
      ...category,
      id,
      sortOrder: category.sortOrder || 0,
      createdAt: now
    };
    this.resourceCategories.set(id, newCategory);
    return newCategory;
  }
  
  async updateResourceCategory(id: number, categoryData: Partial<ResourceCategory>): Promise<ResourceCategory | undefined> {
    const existingCategory = this.resourceCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = {
      ...existingCategory,
      ...categoryData
    };
    this.resourceCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteResourceCategory(id: number): Promise<boolean> {
    // Check if there are any subcategories associated with this category
    const hasSubcategories = Array.from(this.resourceSubcategories.values())
      .some(subcategory => subcategory.categoryId === id);
      
    // Check if there are any resources associated with this category
    const hasResources = Array.from(this.resources.values())
      .some(resource => resource.categoryId === id);
    
    // If there are associated subcategories or resources, don't allow deletion
    if (hasSubcategories || hasResources) {
      return false;
    }
    
    const deleted = this.resourceCategories.delete(id);
    return deleted;
  }
  
  // Resource subcategory methods
  async getResourceSubcategories(categoryId?: number): Promise<ResourceSubcategory[]> {
    let subcategories = Array.from(this.resourceSubcategories.values());
    
    if (categoryId !== undefined) {
      subcategories = subcategories.filter(subcategory => subcategory.categoryId === categoryId);
    }
    
    return subcategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
  
  async getResourceSubcategory(id: number): Promise<ResourceSubcategory | undefined> {
    return this.resourceSubcategories.get(id);
  }
  
  async createResourceSubcategory(subcategory: InsertResourceSubcategory): Promise<ResourceSubcategory> {
    // Verify the category exists
    const categoryExists = this.resourceCategories.has(subcategory.categoryId);
    if (!categoryExists) {
      throw new Error(`Category with ID ${subcategory.categoryId} does not exist`);
    }
    
    const id = this.currentResourceSubcategoryId++;
    const now = new Date().toISOString();
    const newSubcategory: ResourceSubcategory = {
      ...subcategory,
      id,
      sortOrder: subcategory.sortOrder || 0,
      createdAt: now
    };
    this.resourceSubcategories.set(id, newSubcategory);
    return newSubcategory;
  }
  
  async updateResourceSubcategory(id: number, subcategoryData: Partial<ResourceSubcategory>): Promise<ResourceSubcategory | undefined> {
    const existingSubcategory = this.resourceSubcategories.get(id);
    if (!existingSubcategory) return undefined;
    
    // If trying to change the category ID, verify the new category exists
    if (subcategoryData.categoryId && subcategoryData.categoryId !== existingSubcategory.categoryId) {
      const newCategoryExists = this.resourceCategories.has(subcategoryData.categoryId);
      if (!newCategoryExists) {
        throw new Error(`Category with ID ${subcategoryData.categoryId} does not exist`);
      }
    }
    
    const updatedSubcategory = {
      ...existingSubcategory,
      ...subcategoryData
    };
    this.resourceSubcategories.set(id, updatedSubcategory);
    return updatedSubcategory;
  }
  
  async deleteResourceSubcategory(id: number): Promise<boolean> {
    // Check if there are any resources associated with this subcategory
    const hasResources = Array.from(this.resources.values())
      .some(resource => resource.subcategoryId === id);
    
    // If there are associated resources, don't allow deletion
    if (hasResources) {
      return false;
    }
    
    const deleted = this.resourceSubcategories.delete(id);
    return deleted;
  }
  
  // Resource methods
  async getResources(options?: { province?: string, categoryId?: number, subcategoryId?: number, isPremium?: boolean }): Promise<Resource[]> {
    let resources = Array.from(this.resources.values());
    
    if (options) {
      // Filter by province if specified
      if (options.province) {
        resources = resources.filter(resource => resource.province === options.province);
      }
      
      // Filter by category if specified
      if (options.categoryId !== undefined) {
        resources = resources.filter(resource => resource.categoryId === options.categoryId);
      }
      
      // Filter by subcategory if specified
      if (options.subcategoryId !== undefined) {
        resources = resources.filter(resource => resource.subcategoryId === options.subcategoryId);
      }
      
      // Filter by premium status if specified
      if (options.isPremium !== undefined) {
        resources = resources.filter(resource => resource.isPremium === options.isPremium);
      }
    }
    
    // Sort by created date, newest first
    return resources.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    // Verify the category exists
    const categoryExists = this.resourceCategories.has(resource.categoryId);
    if (!categoryExists) {
      throw new Error(`Category with ID ${resource.categoryId} does not exist`);
    }
    
    // If subcategory is provided, verify it exists and belongs to the specified category
    if (resource.subcategoryId) {
      const subcategory = this.resourceSubcategories.get(resource.subcategoryId);
      if (!subcategory) {
        throw new Error(`Subcategory with ID ${resource.subcategoryId} does not exist`);
      }
      if (subcategory.categoryId !== resource.categoryId) {
        throw new Error(`Subcategory with ID ${resource.subcategoryId} does not belong to category with ID ${resource.categoryId}`);
      }
    }
    
    const id = this.currentResourceId++;
    const now = new Date().toISOString();
    const newResource: Resource = {
      ...resource,
      id,
      createdAt: now,
      updatedAt: now,
      tags: resource.tags || [],
      isPremium: resource.isPremium || false
    };
    this.resources.set(id, newResource);
    return newResource;
  }
  
  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const existingResource = this.resources.get(id);
    if (!existingResource) return undefined;
    
    // If trying to change the category ID, verify the new category exists
    if (resourceData.categoryId && resourceData.categoryId !== existingResource.categoryId) {
      const newCategoryExists = this.resourceCategories.has(resourceData.categoryId);
      if (!newCategoryExists) {
        throw new Error(`Category with ID ${resourceData.categoryId} does not exist`);
      }
    }
    
    // If trying to change the subcategory ID, verify it exists and belongs to the correct category
    if (resourceData.subcategoryId && resourceData.subcategoryId !== existingResource.subcategoryId) {
      const subcategory = this.resourceSubcategories.get(resourceData.subcategoryId);
      if (!subcategory) {
        throw new Error(`Subcategory with ID ${resourceData.subcategoryId} does not exist`);
      }
      
      // Use the updated category ID if it's being changed, otherwise use the existing one
      const categoryId = resourceData.categoryId || existingResource.categoryId;
      if (subcategory.categoryId !== categoryId) {
        throw new Error(`Subcategory with ID ${resourceData.subcategoryId} does not belong to category with ID ${categoryId}`);
      }
    }
    
    const now = new Date().toISOString();
    const updatedResource = {
      ...existingResource,
      ...resourceData,
      updatedAt: now
    };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    const deleted = this.resources.delete(id);
    return deleted;
  }
  
  async searchResources(searchTerm: string, options?: { province?: string, categoryId?: number, subcategoryId?: number, isPremium?: boolean }): Promise<Resource[]> {
    // First, get resources based on the filter options
    const resources = await this.getResources(options);
    
    if (!searchTerm) return resources;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Filter resources based on the search term
    return resources.filter(resource => {
      return (
        resource.title.toLowerCase().includes(lowerSearchTerm) ||
        resource.description.toLowerCase().includes(lowerSearchTerm) ||
        resource.content.toLowerCase().includes(lowerSearchTerm) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );
    });
  }

  // Resource like operations
  async getResourceLikes(resourceId: number): Promise<ResourceLike[]> {
    return Array.from(this.resourceLikes.values())
      .filter(like => like.resourceId === resourceId);
  }

  async getResourceLikeByUserAndResource(userId: number, resourceId: number): Promise<ResourceLike | undefined> {
    return Array.from(this.resourceLikes.values())
      .find(like => like.userId === userId && like.resourceId === resourceId);
  }

  async createResourceLike(like: InsertResourceLike): Promise<ResourceLike> {
    // Check if the user already liked this resource
    const existingLike = await this.getResourceLikeByUserAndResource(like.userId, like.resourceId);
    if (existingLike) {
      return existingLike;
    }

    const newLike: ResourceLike = {
      id: this.currentResourceLikeId++,
      ...like,
      createdAt: new Date()
    };

    this.resourceLikes.set(newLike.id, newLike);
    return newLike;
  }

  async deleteResourceLike(id: number): Promise<boolean> {
    return this.resourceLikes.delete(id);
  }

  // Resource bookmark operations
  async getResourceBookmarks(userId: number): Promise<ResourceBookmark[]> {
    return Array.from(this.resourceBookmarks.values())
      .filter(bookmark => bookmark.userId === userId);
  }

  async getResourceBookmarkByUserAndResource(userId: number, resourceId: number): Promise<ResourceBookmark | undefined> {
    return Array.from(this.resourceBookmarks.values())
      .find(bookmark => bookmark.userId === userId && bookmark.resourceId === resourceId);
  }

  async createResourceBookmark(bookmark: InsertResourceBookmark): Promise<ResourceBookmark> {
    // Check if the user already bookmarked this resource
    const existingBookmark = await this.getResourceBookmarkByUserAndResource(bookmark.userId, bookmark.resourceId);
    if (existingBookmark) {
      return existingBookmark;
    }

    const newBookmark: ResourceBookmark = {
      id: this.currentResourceBookmarkId++,
      ...bookmark,
      createdAt: new Date()
    };

    this.resourceBookmarks.set(newBookmark.id, newBookmark);
    return newBookmark;
  }

  async deleteResourceBookmark(id: number): Promise<boolean> {
    return this.resourceBookmarks.delete(id);
  }
  
  // Contributor reputation operations
  async getContributorReputation(userId: number): Promise<ContributorReputation | undefined> {
    return this.contributorReputations.get(userId);
  }
  
  async getTopContributors(limit: number = 10): Promise<ContributorReputation[]> {
    return Array.from(this.contributorReputations.values())
      .sort((a, b) => b.reputationScore - a.reputationScore)
      .slice(0, limit);
  }
  
  async createContributorReputation(reputation: InsertContributorReputation): Promise<ContributorReputation> {
    const userId = reputation.userId;
    const now = new Date();
    const newReputation: ContributorReputation = {
      ...reputation,
      id: this.currentContributorReputationId++,
      createdAt: now,
      updatedAt: now,
      level: reputation.level || "Newcomer",
      badges: reputation.badges || [],
      contributionCount: reputation.contributionCount || 0,
      reputationScore: reputation.reputationScore || 0
    };
    this.contributorReputations.set(userId, newReputation);
    return newReputation;
  }
  
  async updateContributorReputation(userId: number, updates: Partial<ContributorReputation>): Promise<ContributorReputation | undefined> {
    const existingReputation = this.contributorReputations.get(userId);
    if (!existingReputation) return undefined;
    
    const now = new Date();
    const updatedReputation = {
      ...existingReputation,
      ...updates,
      updatedAt: now
    };
    this.contributorReputations.set(userId, updatedReputation);
    return updatedReputation;
  }
  
  // Resource vote operations
  async getResourceVotes(resourceId: number): Promise<ResourceVote[]> {
    return Array.from(this.resourceVotes.values()).filter(
      (vote) => vote.resourceId === resourceId
    );
  }
  
  async getUserResourceVote(userId: number, resourceId: number): Promise<ResourceVote | undefined> {
    return Array.from(this.resourceVotes.values()).find(
      (vote) => vote.userId === userId && vote.resourceId === resourceId
    );
  }
  
  async createResourceVote(vote: InsertResourceVote): Promise<ResourceVote> {
    const id = this.currentResourceVoteId++;
    const now = new Date();
    const newVote: ResourceVote = {
      ...vote,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.resourceVotes.set(id, newVote);
    
    // Update resource vote count
    const resource = this.resources.get(vote.resourceId);
    if (resource) {
      const voteValue = vote.vote === 1 ? 1 : -1;
      const updatedResource = {
        ...resource,
        voteCount: (resource.voteCount || 0) + voteValue
      };
      this.resources.set(resource.id, updatedResource);
      
      // Update contributor reputation
      const contributorId = resource.userId;
      const reputation = this.contributorReputations.get(contributorId);
      
      if (reputation) {
        // Add 5 points for upvote or subtract 3 for downvote
        const pointsChange = vote.vote === 1 ? 5 : -3;
        const updatedReputation = {
          ...reputation,
          reputationScore: reputation.reputationScore + pointsChange,
          updatedAt: now
        };
        this.contributorReputations.set(contributorId, updatedReputation);
        
        // Create reputation history entry
        this.createReputationHistoryEntry({
          userId: contributorId,
          action: vote.vote === 1 ? "upvote_received" : "downvote_received",
          points: pointsChange,
          resourceId: resource.id,
          description: `Your resource "${resource.title}" received a ${vote.vote === 1 ? "upvote" : "downvote"}`
        });
      } else {
        // Create new reputation record for the contributor if it doesn't exist
        this.createContributorReputation({
          userId: contributorId,
          reputationScore: vote.vote === 1 ? 5 : -3,
          contributionCount: 1,
          level: "Newcomer",
          badges: []
        });
        
        // Create reputation history entry
        this.createReputationHistoryEntry({
          userId: contributorId,
          action: vote.vote === 1 ? "upvote_received" : "downvote_received",
          points: vote.vote === 1 ? 5 : -3,
          resourceId: resource.id,
          description: `Your resource "${resource.title}" received a ${vote.vote === 1 ? "upvote" : "downvote"}`
        });
      }
    }
    
    return newVote;
  }
  
  async updateResourceVote(id: number, voteUpdates: Partial<ResourceVote>): Promise<ResourceVote | undefined> {
    const existingVote = this.resourceVotes.get(id);
    if (!existingVote) return undefined;
    
    const now = new Date();
    const oldVote = existingVote.vote;
    const newVote = voteUpdates.vote !== undefined ? voteUpdates.vote : oldVote;
    
    // If the vote value is changing, update the resource vote count
    if (oldVote !== newVote) {
      const resource = this.resources.get(existingVote.resourceId);
      if (resource) {
        // Determine the vote count adjustment based on the change
        let adjustment = 0;
        if (oldVote === 1 && newVote === -1) adjustment = -2; // From upvote to downvote (-1 for removed upvote, -1 for new downvote)
        else if (oldVote === -1 && newVote === 1) adjustment = 2; // From downvote to upvote (+1 for removed downvote, +1 for new upvote)
        
        const updatedResource = {
          ...resource,
          voteCount: (resource.voteCount || 0) + adjustment
        };
        this.resources.set(resource.id, updatedResource);
        
        // Update contributor reputation
        const contributorId = resource.userId;
        const reputation = this.contributorReputations.get(contributorId);
        if (reputation) {
          let pointsChange = 0;
          if (oldVote === 1 && newVote === -1) pointsChange = -8; // -5 for removed upvote, -3 for new downvote
          else if (oldVote === -1 && newVote === 1) pointsChange = 8; // +3 for removed downvote, +5 for new upvote
          
          const updatedReputation = {
            ...reputation,
            reputationScore: reputation.reputationScore + pointsChange,
            updatedAt: now
          };
          this.contributorReputations.set(contributorId, updatedReputation);
          
          // Create reputation history entry
          if (pointsChange !== 0) {
            this.createReputationHistoryEntry({
              userId: contributorId,
              action: 'vote_changed',
              points: pointsChange,
              resourceId: resource.id,
              description: `Vote changed from ${oldVote === 1 ? "upvote" : "downvote"} to ${newVote === 1 ? "upvote" : "downvote"} on your resource "${resource.title}"`
            });
          }
        }
      }
    }
    
    const updatedVote = {
      ...existingVote,
      ...voteUpdates,
      updatedAt: now
    };
    this.resourceVotes.set(id, updatedVote);
    return updatedVote;
  }
  
  async deleteResourceVote(id: number): Promise<boolean> {
    const vote = this.resourceVotes.get(id);
    if (!vote) return false;
    
    // Update resource vote count
    const resource = this.resources.get(vote.resourceId);
    if (resource) {
      // Apply opposite value to remove the vote impact
      const voteValue = vote.vote === 1 ? -1 : 1; 
      const updatedResource = {
        ...resource,
        voteCount: (resource.voteCount || 0) + voteValue
      };
      this.resources.set(resource.id, updatedResource);
      
      // Update contributor reputation
      const contributorId = resource.userId;
      const reputation = this.contributorReputations.get(contributorId);
      if (reputation) {
        // Remove points based on vote type
        const pointsChange = vote.vote === 1 ? -5 : 3; // Remove 5 for upvote or add back 3 for downvote
        const updatedReputation = {
          ...reputation,
          reputationScore: reputation.reputationScore + pointsChange,
          updatedAt: new Date()
        };
        this.contributorReputations.set(contributorId, updatedReputation);
        
        // Create reputation history entry
        this.createReputationHistoryEntry({
          userId: contributorId,
          action: vote.vote === 1 ? 'upvote_removed' : 'downvote_removed',
          points: pointsChange,
          resourceId: resource.id,
          description: `A ${vote.vote === 1 ? "upvote" : "downvote"} was removed from your resource "${resource.title}"`
        });
      }
    }
    
    this.resourceVotes.delete(id);
    return true;
  }
  
  // Reputation history operations
  async getReputationHistory(userId: number): Promise<ReputationHistory[]> {
    return Array.from(this.reputationHistory.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createReputationHistoryEntry(entry: InsertReputationHistory): Promise<ReputationHistory> {
    const id = this.currentReputationHistoryId++;
    const now = new Date();
    const newEntry: ReputationHistory = {
      ...entry,
      id,
      createdAt: now,
    };
    this.reputationHistory.set(id, newEntry);
    return newEntry;
  }

  // Form data operations
  private formDataMap: Map<number, FormData> = new Map();
  private currentFormDataId: number = 1;

  async getFormData(userId: number, formType: string): Promise<FormData | undefined> {
    const userForms = Array.from(this.formDataMap.values()).filter(
      formData => formData.userId === userId && formData.formType === formType
    );
    
    // Return the most recent form data for this user and form type
    if (userForms.length > 0) {
      return userForms.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0]; // Return the most recent one
    }
    
    return undefined;
  }

  async getFormDataById(id: number): Promise<FormData | undefined> {
    return this.formDataMap.get(id);
  }

  async createFormData(data: InsertFormData): Promise<FormData> {
    const id = this.currentFormDataId++;
    const now = new Date().toISOString();
    
    const formData: FormData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.formDataMap.set(id, formData);
    return formData;
  }

  async updateFormData(id: number, data: Partial<FormData>): Promise<FormData | undefined> {
    const existingFormData = this.formDataMap.get(id);
    if (!existingFormData) return undefined;
    
    const updatedFormData = { 
      ...existingFormData, 
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.formDataMap.set(id, updatedFormData);
    return updatedFormData;
  }
}

export const storage = new MemStorage();
