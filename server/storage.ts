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
  getDocumentTemplatesByCategory(category: string): Promise<DocumentTemplate[]>;
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
        name: "Cease and Desist Letter",
        description: "Formal demand to stop an individual or organization from a specific action.",
        category: "Legal Notices",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Cease and Desist Letter\n\n[Date]\n\n[Recipient Name]\n[Recipient Address]\n\nRE: CEASE AND DESIST NOTICE\n\nDear [Recipient Name],\n\nThis letter serves as a formal demand that you immediately CEASE AND DESIST the following behavior/action(s):\n\n[Detailed description of behavior/actions to be stopped]\n\nThis behavior began on or about [Date behavior began] and has continued through [Most recent date].\n\nThis behavior is [unlawful/harassing/defamatory/in violation of our agreement dated (date)] because:\n\n[Explanation of why the behavior is unlawful or prohibited]\n\nThe behavior violates the following laws or agreements:\n[Specific laws, regulations, or agreements being violated]\n\nI demand that you:\n\n1. Immediately stop the described behavior/actions\n2. Provide written assurance within [Number] days that you will cease and desist from further behavior of this nature\n3. [Any other specific demands]\n\nIf you fail to comply with this demand, I will [Potential consequences, which may include]:\n\n1. Pursue legal action against you\n2. Seek monetary damages and legal fees\n3. Obtain a restraining order or other injunctive relief\n4. [Other potential consequences]\n\nThis letter serves as your final warning to discontinue this unwanted behavior before I pursue legal action.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Contact Information]\n\ncc: [Other relevant parties]\n\n[Note: This letter does not constitute full legal advice, and consultation with a qualified attorney is recommended for your specific situation.]",
        previewImageUrl: "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "recipientName", "recipientAddress", "behaviorDescription", "dateBehaviorBegan", "mostRecentDate", "legalBasis", "timeframe", "contactInformation"]
      },
      {
        name: "Equifax Dispute Letter",
        description: "Letter to dispute incorrect information on your Equifax credit report.",
        category: "Credit Disputes",
        applicableProvinces: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        basePrice: 5.99,
        templateContent: "# Equifax Credit Report Dispute Letter\n\n[Date]\n\nEquifax Canada\nNational Consumer Relations\nP.O. Box 190 Station Jean-Talon\nMontreal, Quebec\nH1S 2Z2\n\nRE: Dispute of Inaccurate Credit Information\n\nTo Whom It May Concern:\n\nI am writing to dispute inaccurate information that appears on my Equifax credit report. My name is [Full Name] and my Social Insurance Number is [SIN] (last 3 digits only: XXX-XXX-[Last 3 digits]).\n\nAfter reviewing my credit report dated [Credit Report Date], I have identified the following information that is inaccurate or incomplete:\n\nAccount/Item in Dispute: [Account Name/Number]\nReason for Dispute: [Select one or more]\n- This account does not belong to me\n- This account is closed\n- I have never been late on payments for this account\n- The amount shown is incorrect\n- This account was included in a bankruptcy\n- This account has been paid in full\n- Other: [Specify other reason]\n\nCorrect Information: [Describe what the correct information should be]\n\nEnclosed are copies of the following documents that support my position:\n[List of supporting documents - bank statements, payment confirmations, correspondence, etc.]\n\nPlease investigate this matter and correct or delete this information as per the Consumer Reporting Act. Please also send me a copy of my updated credit report showing the corrections.\n\nIf you have any questions or need additional information, please contact me at [Phone Number] or [Email Address].\n\nThank you for your prompt attention to this matter.\n\nSincerely,\n\n[Signature]\n\n[Full Name]\n[Current Address]\n[Phone Number]\n[Email Address]\n\nEnclosures: [List of supporting documents]\n\nNote: I am aware of my right to add a consumer statement to my credit file if the disputed information is not removed or corrected after your investigation.",
        previewImageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        requiredFields: ["fullName", "sinLastThreeDigits", "creditReportDate", "accountInDispute", "reasonForDispute", "correctInformation", "supportingDocuments", "contactInformation"]
      },
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
