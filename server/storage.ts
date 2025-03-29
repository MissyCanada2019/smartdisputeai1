import { 
  users, type User, type InsertUser, 
  documentTemplates, type DocumentTemplate, type InsertDocumentTemplate,
  userDocuments, type UserDocument, type InsertUserDocument,
  incomeVerifications, type IncomeVerification, type InsertIncomeVerification
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Document template operations
  getDocumentTemplates(): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  getDocumentTemplatesByProvince(province: string): Promise<DocumentTemplate[]>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  
  // User document operations
  getUserDocuments(userId: number): Promise<UserDocument[]>;
  getUserDocument(id: number): Promise<UserDocument | undefined>;
  createUserDocument(document: InsertUserDocument): Promise<UserDocument>;
  updateUserDocument(id: number, document: Partial<UserDocument>): Promise<UserDocument | undefined>;
  
  // Income verification operations
  getIncomeVerifications(userId: number): Promise<IncomeVerification[]>;
  createIncomeVerification(verification: InsertIncomeVerification): Promise<IncomeVerification>;
  updateIncomeVerification(id: number, verification: Partial<IncomeVerification>): Promise<IncomeVerification | undefined>;
  
  // Payment updates
  updatePaymentStatus(documentId: number, status: string, paymentIntentId?: string): Promise<UserDocument | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documentTemplates: Map<number, DocumentTemplate>;
  private userDocuments: Map<number, UserDocument>;
  private incomeVerifications: Map<number, IncomeVerification>;
  
  private currentUserId: number;
  private currentDocumentTemplateId: number;
  private currentUserDocumentId: number;
  private currentIncomeVerificationId: number;

  constructor() {
    this.users = new Map();
    this.documentTemplates = new Map();
    this.userDocuments = new Map();
    this.incomeVerifications = new Map();
    
    this.currentUserId = 1;
    this.currentDocumentTemplateId = 1;
    this.currentUserDocumentId = 1;
    this.currentIncomeVerificationId = 1;
    
    // Seed document templates
    this.seedDocumentTemplates();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
  
  // Seed initial document templates
  private seedDocumentTemplates() {
    const templates: InsertDocumentTemplate[] = [
      {
        name: "Administrative Tribunal Appeal",
        description: "For appealing decisions made by government administrative tribunals.",
        category: "Appeals",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 39.99,
        templateContent: "# Administrative Tribunal Appeal\n\n[Date]\n\n[Administrative Tribunal Name]\n[Address]\n\nRE: Appeal of Decision [Reference Number]\n\nDear Sir/Madam,\n\nI, [Full Name], am writing to formally appeal the decision made by [Agency/Tribunal] dated [Decision Date] regarding [Brief Description of Case].\n\n[Detailed explanation of grounds for appeal]\n\nIn light of the above, I respectfully request that the tribunal review the decision and [Specific Request/Outcome].\n\nThank you for your consideration.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]",
        previewImageUrl: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "tribunalName", "decisionReferenceNumber", "decisionDate", "caseDescription", "groundsForAppeal", "requestedOutcome"]
      },
      {
        name: "Freedom of Information Request",
        description: "Request information from government agencies under FOI legislation.",
        category: "Information Requests",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 29.99,
        templateContent: "# Freedom of Information Request\n\n[Date]\n\n[Government Agency Name]\n[Address]\n\nRE: Freedom of Information Request\n\nDear Sir/Madam,\n\nI, [Full Name], am writing to request information under the [Applicable FOI Act] about [Subject of Request].\n\nSpecifically, I am seeking the following information:\n[Detailed description of requested information]\n\nPlease provide the information in the following format: [Preferred Format]\n\nShould you require any clarification or if fees are applicable, please contact me at [Contact Information].\n\nThank you for your assistance.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]",
        previewImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "agencyName", "applicableFOIAct", "requestSubject", "requestedInformation", "preferredFormat"]
      },
      {
        name: "Tax Assessment Dispute",
        description: "Challenge tax assessments from the CRA or provincial tax authorities.",
        category: "Tax Disputes",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 49.99,
        templateContent: "# Tax Assessment Dispute\n\n[Date]\n\n[Tax Authority Name]\n[Address]\n\nRE: Dispute of Tax Assessment [Reference Number]\n\nDear Sir/Madam,\n\nI, [Full Name], [Tax ID Number], am writing to formally dispute the tax assessment issued on [Assessment Date] for the tax period [Tax Period].\n\nI believe the assessment is incorrect for the following reasons:\n[Detailed explanation of grounds for dispute]\n\nEnclosed are the following documents that support my position:\n[List of supporting documents]\n\nBased on the above, I request that the assessment be [Specific request - e.g., cancelled, reduced, etc.].\n\nPlease contact me at [Contact Information] if you require any additional information.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]",
        previewImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "taxIdNumber", "taxAuthorityName", "assessmentReferenceNumber", "assessmentDate", "taxPeriod", "disputeGrounds", "supportingDocuments", "specificRequest"]
      }
    ];
    
    templates.forEach(template => {
      const id = this.currentDocumentTemplateId++;
      this.documentTemplates.set(id, { ...template, id });
    });
  }
}

export const storage = new MemStorage();
