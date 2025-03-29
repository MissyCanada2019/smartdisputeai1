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
      }
    ];
    
    templates.forEach(template => {
      const id = this.currentDocumentTemplateId++;
      this.documentTemplates.set(id, { ...template, id });
    });
  }
}

export const storage = new MemStorage();
