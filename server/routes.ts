import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { User } from "@shared/schema";

// Extend the Express Request type to include authentication and user info
interface Request extends ExpressRequest {
  isAuthenticated(): boolean;
  user: User;
}
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  userInfoFormSchema, 
  insertUserSchema, 
  insertUserDocumentSchema,
  insertEvidenceFileSchema,
  insertCaseAnalysisSchema,
  insertResourceCategorySchema,
  insertResourceSubcategorySchema,
  insertResourceSchema,
  provinces
} from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { WebSocketServer, WebSocket } from 'ws';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { dirname } from "path";
import registerDirectEvidenceRoutes from "./directEvidence";

// WebSocket client tracking
interface WebSocketClient {
  ws: WebSocket;
  userId?: number;
  connectionTime: Date;
}

// Function to broadcast messages to connected WebSocket clients
const broadcastMessage = (clients: Map<string, WebSocketClient>, message: any, filters?: { userId?: number }) => {
  const payload = JSON.stringify(message);
  
  clients.forEach((client) => {
    // Only send to clients that match the filters (if any)
    if (
      (!filters || !filters.userId || client.userId === filters.userId) && 
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(payload);
    }
  });
};

// Lazy-loaded Stripe client
let stripeInstance: Stripe | null = null;
const getStripe = (): Stripe | null => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('Missing STRIPE_SECRET_KEY. Payment processing will not work properly. API calls will be mocked.');
      return null;
    }
    
    try {
      stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16" as any, // Specify the API version
      });
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      return null;
    }
  }
  return stripeInstance;
};

// OpenAI integration removed

export async function registerRoutes(app: Express): Promise<Server> {
  // Create the HTTP server immediately to open the port faster
  const httpServer = createServer(app);
  
  // Output directory for generated PDFs - define at function scope
  const documentsDir = path.join(__dirname, "../docs");
  
  // Set up upload directory for supporting documents - define at function scope
  const uploadsDir = path.join(__dirname, "../uploads");
  
  // Path to the client/public directory for static files like sitemap and robots.txt
  const publicDir = path.join(__dirname, "../client/public");
  
  // Set up directories in a non-blocking way
  setTimeout(() => {
    // Create directories if they don't exist
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }, 0);
  
  // Serve sitemap.xml and robots.txt from the client/public directory
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'sitemap.xml'));
  });
  
  app.get('/robots.txt', (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'robots.txt'));
  });
  
  // Serve Google site verification files via file system
  app.get('/google4b945706e36a5db4.html', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../google4b945706e36a5db4.html');
    res.sendFile(filePath);
  });
  
  app.get('/google9fGsDdnUDR_1_WC3hApOV0nkhDs7MQL9ZVA1s5UC5nU.html', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../google9fGsDdnUDR_1_WC3hApOV0nkhDs7MQL9ZVA1s5UC5nU.html');
    res.sendFile(filePath);
  });
  
  app.get('/googleKuESneYJdf5D13zZgmGEpGrciobNL2DaEdX-VBEwUyg.html', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../googleKuESneYJdf5D13zZgmGEpGrciobNL2DaEdX-VBEwUyg.html');
    res.sendFile(filePath);
  });
  
  // Serve Google Analytics verification file
  app.get('/google-analytics-verification.html', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../google-analytics-verification.html');
    res.sendFile(filePath);
  });
  
  // Serve Google Analytics JS file
  app.get('/ga4-analytics.js', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../ga4-analytics.js');
    res.set('Content-Type', 'application/javascript');
    res.sendFile(filePath);
  });
  
  // Serve Google Tag Manager HTML file
  app.get('/gtm.html', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../client/public/gtm.html');
    res.sendFile(filePath);
  });
  
  // Serve Google Tag Manager JavaScript file
  app.get('/gtm.js', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../gtm.js');
    res.set('Content-Type', 'application/javascript');
    res.sendFile(filePath);
  });
  
  // Serve Google Search Console verification file
  app.get('/google-search-console-verification.html', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../client/public/google-search-console-verification.html');
    res.sendFile(filePath);
  });
  
  // Configure multer for file uploads
  const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: fileStorage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: function (req, file, cb) {
      // Check the mimetype first (more reliable)
      const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
      
      // Fallback to extension checking for compatibility
      const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error("Unsupported file type. Supported types are: ('.jpg', '.png', '.gif', '.pdf', '.doc', '.docx')"));
      }
    }
  });

  // Get all document templates
  app.get("/api/document-templates", async (_req: Request, res: Response) => {
    try {
      const templates = await storage.getDocumentTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching document templates: ${error.message}` });
    }
  });

  // Get document templates by province
  app.get("/api/document-templates/province/:province", async (req: Request, res: Response) => {
    try {
      const { province } = req.params;
      const templates = await storage.getDocumentTemplatesByProvince(province);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching templates by province: ${error.message}` });
    }
  });

  // Get document templates by category
  app.get("/api/document-templates/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const templates = await storage.getDocumentTemplatesByCategory(category);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching templates by category: ${error.message}` });
    }
  });

  // Get single document template
  app.get("/api/document-templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const template = await storage.getDocumentTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching template: ${error.message}` });
    }
  });

  // Create user document
  app.post("/api/user-documents", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertUserDocumentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid document data", errors: validationResult.error.format() });
      }
      
      const userDocumentData = validationResult.data;
      
      // Create user document
      const newDocument = await storage.createUserDocument(userDocumentData);
      res.status(201).json(newDocument);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating user document: ${error.message}` });
    }
  });

  // Get user documents
  app.get("/api/user-documents/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const searchTerm = req.query.search as string | undefined;
      
      let documents;
      if (searchTerm) {
        documents = await storage.searchUserDocuments(userId, searchTerm);
      } else {
        documents = await storage.getUserDocuments(userId);
      }
      
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching user documents: ${error.message}` });
    }
  });

  // Get single user document
  app.get("/api/user-documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const document = await storage.getUserDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching document: ${error.message}` });
    }
  });
  
  // Generate PDF document
  app.post("/api/generate-pdf/:documentId", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID format" });
      }
      
      // Get the user document
      const userDocument = await storage.getUserDocument(documentId);
      if (!userDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Get the document template
      const template = await storage.getDocumentTemplate(userDocument.templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Create PDF document
      const pdfFilename = `document_${documentId}_${Date.now()}.pdf`;
      const pdfPath = path.join(documentsDir, pdfFilename);
      
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);
      
      // Add content to PDF
      doc.fontSize(16).text(template.name, { align: 'center' });
      doc.moveDown();
      
      // Replace placeholders in template with actual data
      let content = template.templateContent;
      
      // Handle document data - it's stored as JSON in the database
      const documentData = userDocument.documentData as Record<string, any>;
      if (documentData && typeof documentData === 'object') {
        Object.entries(documentData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), String(value));
          }
        });
      }
      
      // Add the content to the PDF
      doc.fontSize(12).text(content);
      
      // Finalize PDF
      doc.end();
      
      // Update the document with the path
      const updatedDocument = await storage.updateUserDocument(documentId, {
        documentPath: pdfFilename
      });
      
      writeStream.on('finish', () => {
        // Notify user through WebSocket if they're connected
        if (app.locals.broadcastMessage && userDocument.userId) {
          app.locals.broadcastMessage({
            type: 'document_generated',
            documentId: documentId,
            fileName: pdfFilename,
            templateName: template.name,
            timestamp: new Date()
          }, { userId: userDocument.userId });
        }
        
        res.json({ 
          success: true, 
          filePath: pdfFilename,
          document: updatedDocument
        });
      });
    } catch (error: any) {
      res.status(500).json({ message: `Error generating PDF: ${error.message}` });
    }
  });
  
  // Download PDF document
  app.get("/api/download-pdf/:filename", (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(documentsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.download(filePath);
    } catch (error: any) {
      res.status(500).json({ message: `Error downloading file: ${error.message}` });
    }
  });

  // Create payment intent for one-time document purchase
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { amount, documentId } = req.body;
      
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // If the price is very low (less than a dollar), set a minimum of 5.99
      const finalAmount = amount < 1 ? 5.99 : amount;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: "cad",
        metadata: {
          documentId: documentId?.toString() || '',
          type: 'one-time'
        }
      });
      
      // If documentId is provided, update the document with the payment intent ID
      if (documentId) {
        await storage.updateUserDocument(documentId, {
          stripePaymentIntentId: paymentIntent.id
        });
      }
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: `Error creating payment intent: ${error.message}` });
    }
  });
  
  // Create or get a subscription
  app.post("/api/get-or-create-subscription", async (req: Request, res: Response) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please log in to create a subscription" });
      }

      let user = req.user;

      // If the user already has a subscription, return the existing subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // Extract the payment intent client secret safely
        let clientSecret = null;
        if (subscription.latest_invoice && 
            typeof subscription.latest_invoice !== 'string' && 
            subscription.latest_invoice.payment_intent && 
            typeof subscription.latest_invoice.payment_intent !== 'string') {
          clientSecret = subscription.latest_invoice.payment_intent.client_secret;
        }

        res.json({
          subscriptionId: subscription.id,
          clientSecret: clientSecret,
        });

        return;
      }
      
      if (!user.email) {
        return res.status(400).json({ message: "User email is required for subscription" });
      }

      try {
        // Create a customer first if the user doesn't have a Stripe customer ID
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          });
          
          customerId = customer.id;
          user = await storage.updateStripeCustomerId(user.id, customer.id);
        }
        
        // Get plan details from request
        const { plan } = req.body;
        if (!plan) {
          return res.status(400).json({ message: "Plan selection is required" });
        }
        
        // Determine price based on plan type
        let priceId;
        
        // This would be replaced with actual Stripe price IDs from your Stripe dashboard
        // For now, we'll use placeholders
        switch(plan) {
          case 'monthly':
            priceId = process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly';
            break;
          case 'annual':
            priceId = process.env.STRIPE_ANNUAL_PRICE_ID || 'price_annual';
            break;
          case 'low_income_year':
            priceId = process.env.STRIPE_LOW_INCOME_PRICE_ID || 'price_low_income';
            break;
          default:
            return res.status(400).json({ message: "Invalid plan selected" });
        }

        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: priceId, // You'll need to create these price objects in your Stripe dashboard
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Update user with subscription information
        await storage.updateUserStripeInfo(user.id, {
          customerId, 
          subscriptionId: subscription.id
        });
    
        // Extract the payment intent client secret safely
        let clientSecret = null;
        if (subscription.latest_invoice && 
            typeof subscription.latest_invoice !== 'string' && 
            subscription.latest_invoice.payment_intent && 
            typeof subscription.latest_invoice.payment_intent !== 'string') {
          clientSecret = subscription.latest_invoice.payment_intent.client_secret;
        }
    
        res.json({
          subscriptionId: subscription.id,
          clientSecret,
        });
      } catch (error: any) {
        return res.status(400).json({ error: { message: error.message } });
      }
    } catch (error: any) {
      res.status(500).json({ message: `Error creating subscription: ${error.message}` });
    }
  });
  
  // For single document purchases or low-income single document purchase
  app.post("/api/create-subscription", async (req: Request, res: Response) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { plan, amount } = req.body;
      
      if (!plan || !amount) {
        return res.status(400).json({ message: "Invalid subscription data" });
      }
      
      // Set the subscription price based on the plan
      let finalAmount = amount;
      
      // Standard pricing tiers
      if (plan === 'monthly') {
        finalAmount = 50;
      } else if (plan === 'annual') {
        finalAmount = 1000;
      } else if (plan === 'basic_document') {
        finalAmount = 5.99;
      } 
      // Low-income pricing tiers
      else if (plan === 'low_income_year') {
        finalAmount = 25;
      } else if (plan === 'low_income_doc') {
        finalAmount = 0.99;
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: "cad",
        metadata: {
          plan,
          type: plan.includes('_doc') ? 'one-time' : 'subscription'
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: `Error creating subscription: ${error.message}` });
    }
  });
  
  // Webhook for Stripe events
  app.post("/api/webhook", async (req: Request, res: Response) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const payload = req.body;
      const event = payload;
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const documentId = paymentIntent.metadata.documentId;
          
          if (documentId) {
            const docId = parseInt(documentId);
            const updatedDoc = await storage.updatePaymentStatus(docId, "paid", paymentIntent.id);
            
            // Notify user via WebSocket if possible
            if (app.locals.broadcastMessage && updatedDoc && updatedDoc.userId) {
              app.locals.broadcastMessage({
                type: 'payment_success',
                documentId: docId,
                message: "Your payment has been successfully processed. You can now access your complete document.",
                timestamp: new Date()
              }, { userId: updatedDoc.userId });
            }
          }
          break;
          
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          const failedDocumentId = failedPaymentIntent.metadata.documentId;
          
          if (failedDocumentId) {
            const docId = parseInt(failedDocumentId);
            const updatedDoc = await storage.updatePaymentStatus(docId, "failed", failedPaymentIntent.id);
            
            // Notify user via WebSocket if possible
            if (app.locals.broadcastMessage && updatedDoc && updatedDoc.userId) {
              app.locals.broadcastMessage({
                type: 'payment_failed',
                documentId: docId,
                message: "Your payment could not be processed. Please try again or use a different payment method.",
                timestamp: new Date()
              }, { userId: updatedDoc.userId });
            }
          }
          break;
      }
      
      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: `Webhook error: ${error.message}` });
    }
  });
  
  // Create a user (simplified for demo)
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      console.log("POST /api/users - Request body:", JSON.stringify(req.body));
      
      // Check if this is a temporary user request
      const { isTemporary } = req.body;
      console.log("Is temporary user request:", isTemporary);
      
      if (isTemporary) {
        console.log("Processing temporary user creation");
        // For temporary users, use a more relaxed validation
        const tempUserSchema = z.object({
          username: z.string(),
          password: z.string(),
          isTemporary: z.boolean().optional().default(true)
        });
        
        // Validate temporary user data
        const validationResult = tempUserSchema.safeParse(req.body);
        if (!validationResult.success) {
          console.error("Temporary user validation failed:", validationResult.error.format());
          return res.status(400).json({ message: "Invalid temporary user data", errors: validationResult.error.format() });
        }
        
        const tempUserData = validationResult.data;
        console.log("Validated temporary user data:", { ...tempUserData, password: "*******" });
        
        // Temporary users get a random email to avoid conflicts
        const randomEmail = `temp_${Date.now()}@smartdispute.ai`;
        console.log("Generated random email for temporary user:", randomEmail);
        
        try {
          // Create the temporary user
          const newUser = await storage.createUser({
            ...tempUserData,
            email: randomEmail,
            firstName: "Temporary",
            lastName: "User"
          });
          
          console.log("Temporary user created successfully with ID:", newUser.id);
          return res.status(201).json(newUser);
        } catch (storageError) {
          console.error("Error in storage.createUser:", storageError);
          throw storageError;
        }
      } else {
        // For regular users, use the full validation
        const userSchema = insertUserSchema.extend({
          password: z.string().min(6, "Password must be at least 6 characters"),
          email: z.string().email("Invalid email format")
        });
        
        // Validate request body
        const validationResult = userSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ message: "Invalid user data", errors: validationResult.error.format() });
        }
        
        const userData = validationResult.data;
        
        // Check if user with email already exists
        const existingUser = await storage.getUserByEmail(userData.email!);
        if (existingUser) {
          return res.status(409).json({ message: "User with this email already exists" });
        }
        
        // Create user
        const newUser = await storage.createUser(userData);
        res.status(201).json(newUser);
      }
    } catch (error: any) {
      res.status(500).json({ message: `Error creating user: ${error.message}` });
    }
  });
  
  // Update user info
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Validate request body
      const validationResult = userInfoFormSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid user data", errors: validationResult.error.format() });
      }
      
      const userData = validationResult.data;
      
      // Update user
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: `Error updating user: ${error.message}` });
    }
  });
  
  // Create income verification request
  // Income and status verification endpoint
  app.post("/api/income-verification", upload.single('verification_document'), async (req: Request, res: Response) => {
    try {
      // Get user ID from session if authenticated
      const userId = req.isAuthenticated() ? req.user.id : null;
      const { verificationType, selfDeclaration } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "You must be logged in to verify your status" });
      }
      
      if (!verificationType || !['low_income', 'disability', 'agency'].includes(verificationType)) {
        return res.status(400).json({ message: "Invalid verification type" });
      }
      
      // Check if we have a document upload or self-declaration
      let documentPath = undefined;
      
      if (req.file) {
        // We have an uploaded document
        documentPath = req.file.path;
        console.log(`Received verification document: ${documentPath}`);
      } else if (selfDeclaration === 'true') {
        // User is self-declaring - we trust them for now
        console.log(`User ${userId} self-declared ${verificationType} status`);
      } else {
        return res.status(400).json({ message: "Either a document upload or self-declaration is required" });
      }
      
      // Store verification in database - in a real system, this would be pending review
      // For now, we'll auto-approve the verification
      const verification = {
        userId,
        notes: `Verification type: ${verificationType}, Self-declared: ${selfDeclaration === 'true'}`,
        verificationDocumentPath: documentPath,
      };
      
      // Save verification to the database
      const savedVerification = await storage.createIncomeVerification(verification);
      
      // For the demo, we'll just return a success response
      res.status(200).json({ 
        verified: true,
        message: "Your verification has been accepted",
        verificationType,
        selfDeclared: selfDeclaration === 'true'
      });
    } catch (error: any) {
      console.error("Income verification error:", error);
      res.status(500).json({ message: `Error processing verification: ${error.message}` });
    }
  });
  
  // Document folder management endpoints
  app.get("/api/document-folders/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const folders = await storage.getDocumentFolders(userId);
      res.json(folders);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching document folders: ${error.message}` });
    }
  });
  
  app.post("/api/document-folders", async (req: Request, res: Response) => {
    try {
      const folderData = req.body;
      const folder = await storage.createDocumentFolder(folderData);
      res.status(201).json(folder);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating document folder: ${error.message}` });
    }
  });
  
  app.patch("/api/document-folders/:id", async (req: Request, res: Response) => {
    try {
      const folderId = parseInt(req.params.id);
      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID format" });
      }
      
      const folderData = req.body;
      const updatedFolder = await storage.updateDocumentFolder(folderId, folderData);
      
      if (!updatedFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json(updatedFolder);
    } catch (error: any) {
      res.status(500).json({ message: `Error updating document folder: ${error.message}` });
    }
  });
  
  app.delete("/api/document-folders/:id", async (req: Request, res: Response) => {
    try {
      const folderId = parseInt(req.params.id);
      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID format" });
      }
      
      const success = await storage.deleteDocumentFolder(folderId);
      
      if (!success) {
        return res.status(404).json({ message: "Folder not found or cannot be deleted" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: `Error deleting document folder: ${error.message}` });
    }
  });
  
  app.get("/api/document-folders/:folderId/documents", async (req: Request, res: Response) => {
    try {
      const folderId = parseInt(req.params.folderId);
      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID format" });
      }
      
      const documents = await storage.getFolderDocuments(folderId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching folder documents: ${error.message}` });
    }
  });
  
  app.post("/api/document-folder-assignments", async (req: Request, res: Response) => {
    try {
      const assignmentData = req.body;
      const assignment = await storage.createDocumentFolderAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating folder assignment: ${error.message}` });
    }
  });
  
  app.post("/api/documents/:documentId/move-to-folder/:folderId", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const folderId = parseInt(req.params.folderId);
      
      if (isNaN(documentId) || isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const assignment = await storage.moveDocumentToFolder(documentId, folderId);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: `Error moving document to folder: ${error.message}` });
    }
  });
  
  // Generate a preview version of the PDF for users before purchase
  app.get("/api/preview-pdf/:documentId", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getUserDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const template = await storage.getDocumentTemplate(document.templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Create a preview version of the PDF (watermarked, first page only, or limited content)
      const previewFilename = `preview_${document.id}_${Date.now()}.pdf`;
      const previewPath = path.join(documentsDir, previewFilename);
      
      // Generate preview PDF with a watermark
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(previewPath);
      
      doc.pipe(stream);
      
      // Add header with logo and title
      doc.fontSize(24).text("SmartDisputesAICanada", { align: 'center' });
      doc.fontSize(18).text("Document Preview", { align: 'center' });
      doc.moveDown();
      
      // Add document template info
      doc.fontSize(16).text(`${template.name} - Preview`, { align: 'center' });
      doc.moveDown();
      
      // Add user info (limited)
      doc.fontSize(12).text(`Document ID: ${document.id}`);
      doc.text(`Created: ${new Date(document.createdAt).toLocaleDateString()}`);
      doc.moveDown();
      
      // Add document content preview with watermark text
      doc.fontSize(14).text("Document Preview Content");
      doc.moveDown();
      
      // Add sample text from the template
      doc.fontSize(12).text(template.description || "Document description not available");
      doc.moveDown();
      
      // Add some placeholder text instead of actual content
      doc.text("This is a preview of your document. Purchase the full version to access the complete document with all of your information.");
      doc.moveDown(2);
      
      // Add a watermark
      doc.save();
      doc.rotate(-45, { origin: [300, 300] });
      doc.fontSize(60).fillColor('rgba(200, 200, 200, 0.4)').text('PREVIEW ONLY', 100, 300);
      doc.restore();
      
      // Add purchase information
      doc.moveDown(4);
      doc.fontSize(14).fillColor('black').text("To purchase the full document:", { align: 'center' });
      doc.fontSize(12).text(`1. Complete the form submission process`, { align: 'center' });
      doc.text(`2. Pay the one-time fee of $${template.basePrice.toFixed(2)} CAD`, { align: 'center' });
      doc.text(`3. Receive immediate access to download your complete document`, { align: 'center' });
      
      // Add a disclaimer at the bottom
      doc.moveDown(2);
      doc.fontSize(10).text("DISCLAIMER: This document is provided for informational purposes only and does not constitute legal advice. SmartDisputesAICanada is not a law firm and is not a substitute for an attorney or law firm.", { align: 'center' });
      
      doc.end();
      
      // Wait for the PDF to be fully written
      stream.on('finish', () => {
        const fileStream = fs.createReadStream(previewPath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${previewFilename}`);
        fileStream.pipe(res);
        
        // Clean up the file after sending
        fileStream.on('end', () => {
          // Delete the preview file after sending to save space
          // fs.unlinkSync(previewPath);
        });
      });
      
      stream.on('error', (error) => {
        console.error("Error generating PDF preview:", error);
        res.status(500).json({ message: "Error generating PDF preview" });
      });
    } catch (error: any) {
      console.error("Error in preview-pdf endpoint:", error);
      res.status(500).json({ message: "Server error generating PDF preview" });
    }
  });
  
  // Email the document preview to a user
  app.post("/api/email-document-preview", async (req: Request, res: Response) => {
    try {
      const { documentId, email, previewOnly } = req.body;
      
      if (!documentId || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // In a real implementation, this would send an email with the document preview
      // using a service like SendGrid, Mailgun, etc.
      
      // For now, we'll just respond with success
      setTimeout(() => {
        res.status(200).json({ 
          message: "Email sent successfully",
          details: {
            to: email,
            documentId,
            previewOnly
          }
        });
      }, 1000); // Simulate sending delay
      
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Server error sending email" });
    }
  });
  
  // Chatbot API endpoint - Smart Rules-based Implementation (No OpenAI)
  app.post("/api/chatbot", async (req: Request, res: Response) => {
    try {
      const { message, context, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Missing message content" });
      }
      
      // Fetch all document templates for reference
      const templates = await storage.getDocumentTemplates();
      
      // Simple keyword matching for template recommendations
      const messageLC = message.toLowerCase();
      const templateScores: Record<number, number> = {};
      let responseMessage = '';
      
      // Initial greeting and empathy response
      responseMessage = "Thank you for reaching out to SmartDisputesAICanada. I understand navigating legal challenges can be difficult, and I'm here to help you find the right resources.\n\n";
      
      // Check for Canadian province/territory mentions
      const canadianProvinces = [
        'alberta', 'british columbia', 'bc', 'manitoba', 'new brunswick', 
        'newfoundland and labrador', 'newfoundland', 'northwest territories', 
        'nova scotia', 'nunavut', 'ontario', 'prince edward island', 'pei', 
        'quebec', 'saskatchewan', 'yukon'
      ];
      
      let detectedProvince = '';
      for (const province of canadianProvinces) {
        if (messageLC.includes(province)) {
          detectedProvince = province;
          // Map abbreviated versions to full names
          if (province === 'bc') detectedProvince = 'British Columbia';
          if (province === 'pei') detectedProvince = 'Prince Edward Island';
          
          // Format province name properly
          detectedProvince = detectedProvince
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Enhance the score of templates applicable to this province
          templates.forEach(t => {
            if (t.applicableProvinces && 
                Array.isArray(t.applicableProvinces) && 
                t.applicableProvinces.some(p => p.toLowerCase().includes(detectedProvince.toLowerCase()))) {
              templateScores[t.id] = (templateScores[t.id] || 0) + 5;
            }
          });
          
          responseMessage += `I see you're located in ${detectedProvince}. I'll tailor my advice to the laws specific to your province.\n\n`;
          break;
        }
      }
      
      // CAS (Children's Aid Society) related keywords
      if (messageLC.includes('child') || messageLC.includes('cas') || messageLC.includes('children') || 
          messageLC.includes('kid') || messageLC.includes('parent') || messageLC.includes('school visit') || 
          messageLC.includes('apprehension') || messageLC.includes('family')) {
        
        responseMessage += "I see you're dealing with a situation related to children or family services. You have the right to advocate for yourself and your family in these challenging situations.\n\n";
        
        if (messageLC.includes('school visit') || (messageLC.includes('school') && messageLC.includes('visit'))) {
          // Find template about CAS school visits
          templates.forEach(t => {
            if (t.name.toLowerCase().includes('school visit') && t.category === 'Children\'s Aid Societies') {
              templateScores[t.id] = (templateScores[t.id] || 0) + 10;
            }
          });
          
          responseMessage += "When CAS visits a child at school, you have specific rights as a parent. The right document can help you respond appropriately.\n\n";
        }
        
        if (messageLC.includes('apprehend') || messageLC.includes('take') || messageLC.includes('took') || messageLC.includes('removed')) {
          // Find template about child apprehension
          templates.forEach(t => {
            if ((t.name.toLowerCase().includes('apprehension') || t.name.toLowerCase().includes('return')) && 
                t.category === 'Children\'s Aid Societies') {
              templateScores[t.id] = (templateScores[t.id] || 0) + 10;
            }
          });
          
          responseMessage += "If your child has been apprehended, it's important to understand your rights and the steps you can take to address the situation.\n\n";
        }
        
        if (messageLC.includes('court') || messageLC.includes('hearing') || messageLC.includes('judge')) {
          // Find template about court proceedings
          templates.forEach(t => {
            if ((t.name.toLowerCase().includes('court') || t.name.toLowerCase().includes('hearing')) && 
                t.category === 'Children\'s Aid Societies') {
              templateScores[t.id] = (templateScores[t.id] || 0) + 10;
            }
          });
          
          responseMessage += "Court proceedings can be intimidating, but with proper preparation, you can effectively represent your interests.\n\n";
        }
        
        // Add score to all CAS templates as a fallback
        templates.forEach(t => {
          if (t.category === 'Children\'s Aid Societies') {
            templateScores[t.id] = (templateScores[t.id] || 0) + 3;
          }
        });
      }
      
      // Landlord-Tenant related keywords
      if (messageLC.includes('landlord') || messageLC.includes('tenant') || messageLC.includes('rent') || 
          messageLC.includes('apartment') || messageLC.includes('evict') || messageLC.includes('lease') || 
          messageLC.includes('housing') || messageLC.includes('repair') || messageLC.includes('maintenance')) {
        
        responseMessage += "I understand you're facing a housing or landlord-tenant issue. These situations can be stressful, but you have rights as a tenant.\n\n";
        
        // Check for province-specific mentions
        const provinces = ['ontario', 'quebec', 'british columbia', 'bc', 'alberta', 'manitoba', 
                         'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland', 'pei', 
                         'prince edward island', 'yukon', 'northwest territories', 'nunavut'];
        
        let mentionedProvince = '';
        for (const province of provinces) {
          if (messageLC.includes(province)) {
            mentionedProvince = province === 'bc' ? 'British Columbia' : 
                              province.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            break;
          }
        }
        
        if (mentionedProvince) {
          responseMessage += `I see you're located in ${mentionedProvince}. I'll focus on templates that apply specifically to your province.\n\n`;
          
          // Prioritize templates for the mentioned province
          templates.forEach(t => {
            if (t.category === 'Landlord-Tenant' && 
                t.applicableProvinces.some(p => p.toLowerCase() === mentionedProvince.toLowerCase())) {
              templateScores[t.id] = (templateScores[t.id] || 0) + 8;
            }
          });
        }
        
        if (messageLC.includes('repair') || messageLC.includes('maintenance') || 
            messageLC.includes('fix') || messageLC.includes('broken')) {
          // Find templates about repairs
          templates.forEach(t => {
            if ((t.name.toLowerCase().includes('repair') || t.name.toLowerCase().includes('maintenance')) && 
                t.category === 'Landlord-Tenant') {
              templateScores[t.id] = (templateScores[t.id] || 0) + 10;
            }
          });
          
          responseMessage += "Landlords have an obligation to maintain the property in good repair. There are specific documents that can help you request necessary repairs.\n\n";
        }
        
        if (messageLC.includes('rent increase') || 
            (messageLC.includes('rent') && (messageLC.includes('increase') || messageLC.includes('raised')))) {
          // Find templates about rent increases
          templates.forEach(t => {
            if ((t.name.toLowerCase().includes('rent increase') || t.name.toLowerCase().includes('increase')) && 
                t.category === 'Landlord-Tenant') {
              templateScores[t.id] = (templateScores[t.id] || 0) + 10;
            }
          });
          
          responseMessage += "Rent increases must follow specific rules and timelines. If you believe your rent increase is improper, you can challenge it.\n\n";
        }
        
        if (messageLC.includes('evict') || messageLC.includes('eviction') || messageLC.includes('notice') || 
            messageLC.includes('leave') || messageLC.includes('moving out')) {
          // Find templates about eviction or ending tenancy
          templates.forEach(t => {
            if ((t.name.toLowerCase().includes('evict') || t.name.toLowerCase().includes('notice') || 
                t.name.toLowerCase().includes('end') || t.name.toLowerCase().includes('termination')) && 
                t.category === 'Landlord-Tenant') {
              templateScores[t.id] = (templateScores[t.id] || 0) + 10;
            }
          });
          
          responseMessage += "Evictions must follow proper legal procedures. Understanding your rights can help you respond effectively to eviction notices.\n\n";
        }
        
        // Add score to all landlord-tenant templates as a fallback
        templates.forEach(t => {
          if (t.category === 'Landlord-Tenant') {
            templateScores[t.id] = (templateScores[t.id] || 0) + 3;
          }
        });
      }
      
      // Equifax and credit related keywords
      if (messageLC.includes('credit') || messageLC.includes('equifax') || messageLC.includes('transunion') || 
          messageLC.includes('report') || messageLC.includes('score') || messageLC.includes('dispute') || 
          messageLC.includes('debt') || messageLC.includes('collection')) {
        
        responseMessage += "I see you're dealing with a credit reporting issue. Errors on your credit report can have serious consequences, but you have the right to dispute inaccurate information.\n\n";
        
        // Find templates related to credit reports
        templates.forEach(t => {
          if (t.category === 'Equifax' || 
              t.name.toLowerCase().includes('credit') || 
              t.name.toLowerCase().includes('equifax') || 
              t.name.toLowerCase().includes('transunion')) {
            templateScores[t.id] = (templateScores[t.id] || 0) + 8;
          }
        });
        
        responseMessage += "Credit reporting agencies must investigate disputes and correct inaccurate information. The right document can help you start this process.\n\n";
      }
      
      // Transition services related keywords
      if (messageLC.includes('transition') || messageLC.includes('housing support') || 
          messageLC.includes('social service') || messageLC.includes('assistance program') || 
          messageLC.includes('community support')) {
        
        responseMessage += "I understand you're seeking transition services or community supports. Navigating these systems can be challenging, but there are resources available to help.\n\n";
        
        // Find templates related to transition services
        templates.forEach(t => {
          if (t.category === 'Transition services' || 
              t.name.toLowerCase().includes('transition') || 
              t.name.toLowerCase().includes('support') || 
              t.name.toLowerCase().includes('assistance')) {
            templateScores[t.id] = (templateScores[t.id] || 0) + 8;
          }
        });
        
        responseMessage += "Properly documenting your needs and requests can help you access the services you're entitled to.\n\n";
      }
      
      // If no specific category was matched, provide a general response
      if (Object.keys(templateScores).length === 0) {
        responseMessage += "I'd like to help you find the right document for your situation. Could you provide more details about:\n\n";
        responseMessage += "1. The specific issue you're facing (e.g., landlord dispute, CAS interaction, credit report error)\n";
        responseMessage += "2. Your province or territory\n";
        responseMessage += "3. Any specific actions you've already taken\n\n";
        responseMessage += "This will help me recommend the most appropriate document templates for your situation.";
        
        // Return a general response with no specific templates
        if (app.locals.broadcastMessage && userId) {
          app.locals.broadcastMessage({
            type: 'chatbot_response',
            message: responseMessage,
            recommendedTemplateIds: [],
            timestamp: new Date()
          }, { userId });
        }
        
        return res.json({
          response: responseMessage,
          templates: templates.map(t => ({ id: t.id, name: t.name })),
          recommendedTemplateIds: []
        });
      }
      
      // Get the top 3 templates by score
      const recommendedTemplateIds = Object.entries(templateScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => parseInt(id));
      
      // Add recommended templates to the response
      if (recommendedTemplateIds.length > 0) {
        responseMessage += "Based on what you've shared, I recommend the following document templates:\n\n";
        
        for (let i = 0; i < recommendedTemplateIds.length; i++) {
          const template = templates.find(t => t.id === recommendedTemplateIds[i]);
          if (template) {
            responseMessage += `${i + 1}. **${template.name}**: ${template.description}\n`;
          }
        }
        
        responseMessage += "\nThese templates are designed to help you advocate for yourself effectively. You can select any of these templates to get started on your document.";
      }
      
      // If a userId was provided, send a WebSocket notification
      if (app.locals.broadcastMessage && userId) {
        app.locals.broadcastMessage({
          type: 'chatbot_response',
          message: responseMessage,
          recommendedTemplateIds,
          timestamp: new Date()
        }, { userId });
      }
      
      // Return the chatbot response
      res.json({ 
        response: responseMessage,
        templates: templates.map(t => ({ id: t.id, name: t.name })),
        recommendedTemplateIds: recommendedTemplateIds
      });
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      // Fetch all document templates for reference (even in error case)
      const templates = await storage.getDocumentTemplates();
      
      // Create fallback response
      const fallbackResponse = "I'm sorry, I'm currently having trouble processing your request. In the meantime, you can browse our document templates directly using the document selection page or try again in a few minutes.";
      
      // Try to intelligently recommend templates based on keywords in the user's message
      const message = req.body.message || "";
      const keywords: Record<string, number[]> = {
        // Children's Aid Societies
        "children": [1, 2, 3],              
        "child": [1, 2, 3],                 
        "cas": [1, 2, 3],
        "protection": [1, 2, 3],
        "family": [1, 2, 3],
        "apprehension": [1, 2, 3],
        "youth": [1, 2, 3],
        
        // Landlord-Tenant
        "rent": [4, 5, 6],                  
        "landlord": [4, 5, 6],              
        "tenant": [4, 5, 6],
        "rtb": [4, 5, 6],   // Residential Tenancy Branch (BC)
        "ltb": [4, 5, 6],   // Landlord Tenant Board (Ontario)
        "apartment": [4, 5, 6],             
        "housing": [4, 5, 6],
        "eviction": [4, 5, 6],
        "lease": [4, 5, 6],
        "notice": [4, 5, 6],
        
        // Equifax
        "credit": [7, 8, 9],                
        "equifax": [7, 8, 9],               
        "transunion": [7, 8, 9],
        "report": [7, 8, 9],                
        "score": [7, 8, 9],
        "dispute": [7, 8, 9],
        "debt": [7, 8, 9],
        "collection": [7, 8, 9],
        
        // Transition services
        "transition": [10, 11, 12],         
        "service": [10, 11, 12],            
        "support": [10, 11, 12],
        "assistance": [10, 11, 12],
        "community": [10, 11, 12],
        "social": [10, 11, 12],
        "welfare": [10, 11, 12],
        "benefits": [10, 11, 12]
      };
      
      let recommendedTemplateIds: number[] = [];
      
      // Simple keyword matching
      const lowerMessage = message.toLowerCase();
      Object.entries(keywords).forEach(([keyword, ids]) => {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          // Add IDs without using Set for compatibility
          ids.forEach(id => {
            if (!recommendedTemplateIds.includes(id)) {
              recommendedTemplateIds.push(id);
            }
          });
        }
      });
      
      // If no keywords matched, recommend a sampling of templates
      if (recommendedTemplateIds.length === 0) {
        recommendedTemplateIds = [1, 4, 7, 10]; // One from each category
      }
      
      // Return a 200 status with fallback content rather than an error
      // This allows the frontend to display a helpful message instead of just an error
      res.status(200).json({
        response: fallbackResponse,
        templates: templates.map(t => ({ id: t.id, name: t.name })),
        recommendedTemplateIds,
        isError: true
      });
    }
  });

  // File upload endpoint for supporting documents
  app.post("/api/upload-documents", upload.array('documents', 5), async (req: Request, res: Response) => {
    try {
      // Check if files were uploaded
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const files = Array.isArray(req.files) ? req.files : [req.files];
      const { documentId, userId, folderId } = req.body;
      
      if (!documentId && !userId && !folderId) {
        return res.status(400).json({ message: "Either documentId, userId, or folderId is required" });
      }
      
      // Create response with file information
      const uploadedFiles = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        filePath: file.path
      }));
      
      // If document ID is provided, update the document with the file attachments
      if (documentId) {
        const docId = parseInt(documentId);
        if (!isNaN(docId)) {
          const document = await storage.getUserDocument(docId);
          if (document) {
            // Update document with file attachments
            await storage.updateUserDocument(docId, {
              supportingDocuments: JSON.stringify(uploadedFiles)
            });
          }
        }
      }
      
      // If folderId is provided, add the files to the specified folder
      if (folderId) {
        const folderIdNum = parseInt(folderId);
        if (!isNaN(folderIdNum)) {
          // For each uploaded file, create a document record and assign it to the folder
          for (const file of uploadedFiles) {
            // Create a user document for the file
            const newDoc = await storage.createUserDocument({
              userId: parseInt(userId),
              templateId: 0, // Special template ID for uploaded files
              documentData: JSON.stringify({
                title: file.originalName,
                content: JSON.stringify(file)
              }),
              finalPrice: 0,
              paymentStatus: 'paid', // Mark as paid since it's a direct upload
              status: 'completed',
              supportingDocuments: JSON.stringify([file])
            });
            
            if (newDoc && newDoc.id) {
              // Add the document to the folder
              await storage.createDocumentFolderAssignment({
                documentId: newDoc.id,
                folderId: folderIdNum
              });
            }
          }
        }
      }
      
      // If userId is provided (for either income verification or evidence files)
      if (userId) {
        const uId = parseInt(userId);
        if (!isNaN(uId)) {
          // Check if we have an income verification request for this user
          const verifications = await storage.getIncomeVerifications(uId);
          if (verifications.length > 0) {
            const mostRecent = verifications[0]; // Assuming sorted by date descending
            // Update income verification with file attachments
            // Only use string type for verificationDocumentPath as per schema
            if (uploadedFiles && uploadedFiles.length > 0) {
              // Ensure we're dealing with our mapped object that has filename property
              const firstFile = uploadedFiles[0];
              if (firstFile && typeof firstFile === 'object' && 'filename' in firstFile) {
                await storage.updateIncomeVerification(mostRecent.id, {
                  verificationDocumentPath: firstFile.filename
                });
              }
            }
          }
          
          // Create evidence files for this user (used in the evidence-upload page)
          const createdEvidenceFiles = [];
          for (const file of uploadedFiles) {
            try {
              const newEvidenceFile = await storage.createEvidenceFile({
                userId: uId,
                fileName: file.filename,
                originalName: file.originalName,
                filePath: file.path,
                fileType: file.mimetype,
                fileSize: file.size,
                description: null,
                tags: []
              });
              
              if (newEvidenceFile) {
                createdEvidenceFiles.push(newEvidenceFile);
              }
            } catch (evidenceErr) {
              console.error("Error creating evidence file:", evidenceErr);
            }
          }
          
          // If we created evidence files, include them in the response
          if (createdEvidenceFiles.length > 0) {
            return res.status(200).json({ 
              success: true, 
              message: "Files uploaded successfully as evidence", 
              files: createdEvidenceFiles 
            });
          }
        }
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Files uploaded successfully", 
        files: uploadedFiles 
      });
    } catch (error: any) {
      res.status(500).json({ message: `File upload error: ${error.message}` });
    }
  });
  
  // Get uploaded file
  app.get("/api/uploads/:filename", (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.download(filePath);
    } catch (error: any) {
      res.status(500).json({ message: `Error downloading file: ${error.message}` });
    }
  });

  // Initialize WebSocket server with ping/pong checks
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true,
    perMessageDeflate: false
  });

  // Set up heartbeat
  function heartbeat() {
    this.isAlive = true;
  }

  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // Store connected clients
  const clients = new Map<string, WebSocketClient>();
  
  wss.on('connection', (ws) => {
    // Generate a unique client ID
    const clientId = Date.now().toString();
    
    // Store the client
    clients.set(clientId, {
      ws,
      connectionTime: new Date()
    });
    
    console.log(`WebSocket client connected. Total clients: ${clients.size}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to SmartDisputesAICanada WebSocket server',
      timestamp: new Date()
    }));
    
    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Associate user ID with this connection if provided
        if (data.type === 'identify' && data.userId) {
          const client = clients.get(clientId);
          if (client) {
            client.userId = data.userId;
            clients.set(clientId, client);
            
            // Confirm identity association
            ws.send(JSON.stringify({
              type: 'identify',
              success: true,
              message: 'User ID associated with this connection',
              timestamp: new Date()
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected. Remaining clients: ${clients.size}`);
    });
  });
  
  // Expose broadcast function for use in other API endpoints
  app.locals.broadcastMessage = (message: any, filters?: { userId?: number }) => {
    broadcastMessage(clients, message, filters);
  };
  
  // Community API endpoints
  
  // Get all community categories
  app.get("/api/community/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCommunityCategories();
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching community categories:", error);
      res.status(500).json({ message: "Error fetching community categories" });
    }
  });
  
  // Get a specific community category
  app.get("/api/community/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCommunityCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error("Error fetching community category:", error);
      res.status(500).json({ message: "Error fetching community category" });
    }
  });
  
  // Create a new community category (admin only)
  app.post("/api/community/categories", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Check if user is an admin
      const userRole = await storage.getUserRole(req.user.id);
      if (!userRole || userRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const category = req.body;
      const newCategory = await storage.createCommunityCategory(category);
      
      res.status(201).json(newCategory);
    } catch (error: any) {
      console.error("Error creating community category:", error);
      res.status(500).json({ message: "Error creating community category" });
    }
  });
  
  // Update a community category (admin only)
  app.put("/api/community/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Check if user is an admin
      const userRole = await storage.getUserRole(req.user.id);
      if (!userRole || userRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const categoryData = req.body;
      const updatedCategory = await storage.updateCommunityCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error: any) {
      console.error("Error updating community category:", error);
      res.status(500).json({ message: "Error updating community category" });
    }
  });
  
  // Delete a community category (admin only)
  app.delete("/api/community/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Check if user is an admin
      const userRole = await storage.getUserRole(req.user.id);
      if (!userRole || userRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const result = await storage.deleteCommunityCategory(id);
      
      if (!result) {
        return res.status(400).json({ message: "Category could not be deleted, it may have associated posts" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting community category:", error);
      res.status(500).json({ message: "Error deleting community category" });
    }
  });
  
  // Get community posts (optionally filtered by category)
  app.get("/api/community/posts", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      const posts = await storage.getCommunityPosts(categoryId);
      res.json(posts);
    } catch (error: any) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Error fetching community posts" });
    }
  });
  
  // Search community posts
  app.get("/api/community/posts/search", async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.query as string || "";
      
      const posts = await storage.searchCommunityPosts(searchTerm);
      res.json(posts);
    } catch (error: any) {
      console.error("Error searching community posts:", error);
      res.status(500).json({ message: "Error searching community posts" });
    }
  });
  
  // Get a specific community post
  app.get("/api/community/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getCommunityPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error: any) {
      console.error("Error fetching community post:", error);
      res.status(500).json({ message: "Error fetching community post" });
    }
  });
  
  // Create a new community post
  app.post("/api/community/posts", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const postData = {
        ...req.body,
        userId: req.user.id
      };
      
      const newPost = await storage.createCommunityPost(postData);
      
      // Broadcast to WebSocket clients
      app.locals.broadcastMessage({
        type: 'new_post',
        postId: newPost.id,
        categoryId: newPost.categoryId,
        title: newPost.title,
        timestamp: new Date()
      });
      
      res.status(201).json(newPost);
    } catch (error: any) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Error creating community post" });
    }
  });
  
  // Update a community post
  app.put("/api/community/posts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Get existing post
      const existingPost = await storage.getCommunityPost(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is the author or an admin
      const userRole = await storage.getUserRole(req.user.id);
      if (existingPost.userId !== req.user.id && (!userRole || userRole.role !== 'admin')) {
        return res.status(403).json({ message: "You don't have permission to update this post" });
      }
      
      const postData = req.body;
      const updatedPost = await storage.updateCommunityPost(id, postData);
      
      res.json(updatedPost);
    } catch (error: any) {
      console.error("Error updating community post:", error);
      res.status(500).json({ message: "Error updating community post" });
    }
  });
  
  // Delete a community post
  app.delete("/api/community/posts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Get existing post
      const existingPost = await storage.getCommunityPost(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is the author or an admin
      const userRole = await storage.getUserRole(req.user.id);
      if (existingPost.userId !== req.user.id && (!userRole || userRole.role !== 'admin')) {
        return res.status(403).json({ message: "You don't have permission to delete this post" });
      }
      
      const result = await storage.deleteCommunityPost(id);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to delete post" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting community post:", error);
      res.status(500).json({ message: "Error deleting community post" });
    }
  });
  
  // Get comments for a post
  app.get("/api/community/posts/:postId/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const comments = await storage.getCommunityComments(postId);
      res.json(comments);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Error fetching comments" });
    }
  });
  
  // Add a comment to a post
  app.post("/api/community/posts/:postId/comments", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if post exists
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const commentData = {
        ...req.body,
        postId,
        userId: req.user.id
      };
      
      const newComment = await storage.createCommunityComment(commentData);
      
      // Broadcast to WebSocket clients
      app.locals.broadcastMessage({
        type: 'new_comment',
        postId,
        commentId: newComment.id,
        userId: req.user.id,
        timestamp: new Date()
      });
      
      res.status(201).json(newComment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Error creating comment" });
    }
  });
  
  // Toggle like on a post
  app.post("/api/community/posts/:postId/like", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if post exists
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const result = await storage.togglePostLike(postId, req.user.id);
      const updatedPost = await storage.getCommunityPost(postId);
      
      res.json({ 
        liked: result,
        likeCount: updatedPost?.likeCount || 0
      });
    } catch (error: any) {
      console.error("Error toggling post like:", error);
      res.status(500).json({ message: "Error toggling post like" });
    }
  });
  
  // Toggle bookmark on a post
  app.post("/api/community/posts/:postId/bookmark", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if post exists
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const result = await storage.toggleBookmark(postId, req.user.id);
      
      res.json({ bookmarked: result });
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Error toggling bookmark" });
    }
  });
  
  // Get user's bookmarked posts
  app.get("/api/community/bookmarks", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const bookmarks = await storage.getUserBookmarks(req.user.id);
      
      // Get full post details
      const bookmarkedPosts = [];
      for (const bookmark of bookmarks) {
        const post = await storage.getCommunityPost(bookmark.postId);
        if (post) {
          bookmarkedPosts.push({
            ...post,
            bookmarkedAt: bookmark.createdAt
          });
        }
      }
      
      res.json(bookmarkedPosts);
    } catch (error: any) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Error fetching bookmarks" });
    }
  });
  
  // Marketing funnel routes
  
  // Track funnel event
  app.post("/api/marketing/track-event", async (req: Request, res: Response) => {
    try {
      const { funnelName, eventName, userId, metadata } = req.body;
      
      if (!funnelName || !eventName) {
        return res.status(400).json({ message: "Funnel name and event name are required" });
      }
      
      const eventData = {
        funnelName, 
        eventName,
        userId: userId || null,
        metadata: metadata || {}
      };
      
      const newEvent = await storage.trackFunnelEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error: any) {
      console.error("Error tracking funnel event:", error);
      res.status(500).json({ message: "Error tracking funnel event" });
    }
  });
  
  // Get funnel events (optionally filtered by funnel name)
  app.get("/api/marketing/funnel-events", async (req: Request, res: Response) => {
    try {
      // Require admin access for this endpoint
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userRole = await storage.getUserRole(req.user.id);
      if (!userRole || userRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const funnelName = req.query.funnelName as string | undefined;
      const events = await storage.getFunnelEvents(funnelName);
      
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching funnel events:", error);
      res.status(500).json({ message: "Error fetching funnel events" });
    }
  });
  
  // Get user's funnel events
  app.get("/api/marketing/user-funnel-events/:userId", async (req: Request, res: Response) => {
    try {
      // Require authentication - users can see their own events, admins can see anyone's
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check permissions - only own events or admin access
      if (req.user.id !== userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You don't have permission to view these events" });
        }
      }
      
      const events = await storage.getUserFunnelEvents(userId);
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching user funnel events:", error);
      res.status(500).json({ message: "Error fetching user funnel events" });
    }
  });
  
  // Create marketing lead
  app.post("/api/marketing/leads", async (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, phone, province, interests, source, funnelName } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if lead with this email already exists
      const existingLead = await storage.getMarketingLeadByEmail(email);
      if (existingLead) {
        // Update the existing lead with any new information
        const updatedLead = await storage.updateMarketingLead(existingLead.id, {
          firstName: firstName || existingLead.firstName,
          lastName: lastName || existingLead.lastName,
          phone: phone || existingLead.phone,
          province: province || existingLead.province,
          interests: interests || existingLead.interests,
          source: source || existingLead.source,
          funnelName: funnelName || existingLead.funnelName
        });
        
        // Also track this as a lead return event
        if (funnelName) {
          await storage.trackFunnelEvent({
            funnelName,
            eventName: 'lead_return',
            userId: null,
            metadata: { leadId: existingLead.id, email }
          });
        }
        
        return res.json(updatedLead);
      }
      
      // Create new lead
      const leadData = {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        province: province || null,
        interests: interests || {},
        source: source || 'website',
        funnelName: funnelName || null
      };
      
      const newLead = await storage.createMarketingLead(leadData);
      
      // Also track this as a lead capture event
      if (funnelName) {
        await storage.trackFunnelEvent({
          funnelName,
          eventName: 'lead_capture',
          userId: null,
          metadata: { leadId: newLead.id, email }
        });
      }
      
      res.status(201).json(newLead);
    } catch (error: any) {
      console.error("Error creating marketing lead:", error);
      res.status(500).json({ message: "Error creating marketing lead" });
    }
  });
  
  // Get marketing lead by email (admin only)
  app.get("/api/marketing/leads/email/:email", async (req: Request, res: Response) => {
    try {
      // Require admin access for this endpoint
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userRole = await storage.getUserRole(req.user.id);
      if (!userRole || userRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { email } = req.params;
      const lead = await storage.getMarketingLeadByEmail(email);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error: any) {
      console.error("Error fetching marketing lead:", error);
      res.status(500).json({ message: "Error fetching marketing lead" });
    }
  });
  
  // Update marketing lead
  app.put("/api/marketing/leads/:id", async (req: Request, res: Response) => {
    try {
      // Require admin access for this endpoint
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userRole = await storage.getUserRole(req.user.id);
      if (!userRole || userRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }
      
      const leadData = req.body;
      const updatedLead = await storage.updateMarketingLead(id, leadData);
      
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(updatedLead);
    } catch (error: any) {
      console.error("Error updating marketing lead:", error);
      res.status(500).json({ message: "Error updating marketing lead" });
    }
  });
  
  // Convert lead to user
  app.post("/api/marketing/leads/:leadId/convert/:userId", async (req: Request, res: Response) => {
    try {
      // Require admin access for this endpoint
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userRole = await storage.getUserRole(req.user.id);
      if (!userRole || userRole.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const leadId = parseInt(req.params.leadId);
      const userId = parseInt(req.params.userId);
      
      if (isNaN(leadId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid lead ID or user ID" });
      }
      
      // Convert the lead
      const updatedLead = await storage.convertLeadToUser(leadId, userId);
      
      // Track conversion event
      if (updatedLead.funnelName) {
        await storage.trackFunnelEvent({
          funnelName: updatedLead.funnelName,
          eventName: 'lead_conversion',
          userId,
          metadata: { leadId, email: updatedLead.email }
        });
      }
      
      res.json(updatedLead);
    } catch (error: any) {
      console.error("Error converting lead to user:", error);
      res.status(500).json({ message: "Error converting lead to user" });
    }
  });
  
  // Evidence files API endpoints
  
  // Get evidence files for the current logged-in user
  app.get("/api/evidence-files/user/current", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Use the logged-in user's ID
      const userId = req.user.id;
      
      const evidenceFiles = await storage.getEvidenceFiles(userId);
      res.json(evidenceFiles);
    } catch (error: any) {
      console.error("Error fetching evidence files for current user:", error);
      res.status(500).json({ message: `Error fetching evidence files: ${error.message}` });
    }
  });
  
  // Get all evidence files for a specific user
  app.get("/api/evidence-files/user/:userId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate user permissions (users can only access their own files)
      if (req.user.id !== userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only access your own evidence files" });
        }
      }
      
      const evidenceFiles = await storage.getEvidenceFiles(userId);
      res.json(evidenceFiles);
    } catch (error: any) {
      console.error("Error fetching evidence files:", error);
      res.status(500).json({ message: `Error fetching evidence files: ${error.message}` });
    }
  });
  
  // Get a specific evidence file
  app.get("/api/evidence-files/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid evidence file ID" });
      }
      
      const evidenceFile = await storage.getEvidenceFile(id);
      if (!evidenceFile) {
        return res.status(404).json({ message: "Evidence file not found" });
      }
      
      // Validate user permissions (users can only access their own files)
      if (req.user.id !== evidenceFile.userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only access your own evidence files" });
        }
      }
      
      res.json(evidenceFile);
    } catch (error: any) {
      console.error("Error fetching evidence file:", error);
      res.status(500).json({ message: `Error fetching evidence file: ${error.message}` });
    }
  });
  
  // Upload evidence files with enhanced diagnostics and error handling
  app.post("/api/evidence-files/upload", upload.array("evidence", 10), async (req: Request, res: Response) => {
    try {
      console.log("POST /api/evidence-files/upload - Request received at", new Date().toISOString());
      console.log("Content-Type:", req.headers['content-type']);
      console.log("Files received:", req.files ? (req.files as Express.Multer.File[]).length : 0);
      console.log("Request body keys:", Object.keys(req.body || {}));
      console.log("Request body:", { 
        userId: req.body.userId, 
        description: req.body.description,
        tags: req.body.tags
      });
      
      // Allow uploads from either authenticated users or those with a temporary userId in the request body
      let userId: number;

      // Check for authenticated user first
      if (req.isAuthenticated && req.isAuthenticated()) {
        console.log("Request is authenticated, using authenticated user ID:", req.user.id);
        userId = req.user.id;
      } 
      // If not authenticated, check for userId in request body
      else if (req.body && req.body.userId) {
        try {
          userId = parseInt(req.body.userId, 10);
          console.log("Using provided user ID from request body:", userId);
          
          if (isNaN(userId) || userId <= 0) {
            console.error("Invalid user ID format provided:", req.body.userId);
            return res.status(400).json({ 
              message: "Invalid user ID format", 
              details: "User ID must be a positive integer"
            });
          }
          
          // Verify this is a valid user ID in the database
          try {
            console.log("Verifying user exists with ID:", userId);
            const user = await storage.getUser(userId);
            
            if (!user) {
              console.error("User not found with ID:", userId);
              return res.status(404).json({ 
                message: "User not found", 
                details: "The provided user ID does not exist in the system" 
              });
            }
            
            console.log("Found valid user:", { 
              id: user.id, 
              isTemporary: user.isTemporary,
              username: user.username 
            });
          } catch (userError: any) {
            console.error("Database error verifying user ID:", userId, userError);
            return res.status(500).json({ 
              message: "Error verifying user account", 
              details: "Could not verify if the user exists in the database",
              error: userError.message 
            });
          }
        } catch (parseError: any) {
          console.error("Error parsing user ID:", req.body.userId, parseError);
          return res.status(400).json({ 
            message: "Invalid user ID format", 
            details: "User ID must be a number" 
          });
        }
      } 
      // No valid authentication or userId provided
      else {
        console.error("No valid authentication or userId provided in request");
        return res.status(401).json({ 
          message: "Authentication required or userId must be provided",
          details: "This endpoint requires either an authenticated session or a valid userId in the request body."
        });
      }
      
      // Validate files array from multer
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.error("No files uploaded or invalid files format");
        return res.status(400).json({ 
          message: "No files uploaded", 
          details: "Ensure you are sending files with the field name 'evidence'" 
        });
      }
      
      const files = req.files as Express.Multer.File[];
      console.log("Processing upload for", files.length, "files for userId:", userId);
      
      // Extract metadata from request
      const { description, tags } = req.body;
      const tagArray = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];
      
      // Process and store each file
      const uploadedFiles = [];
      
      for (const file of files) {
        console.log("Processing file:", {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          destination: file.destination,
          path: file.path,
          fieldname: file.fieldname
        });
        
        try {
          // Prepare evidence file data
          const evidenceFileData = {
            userId,
            fileName: file.filename,
            originalName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
            description: description || null,
            tags: tagArray
          };
          
          console.log("Saving file to database:", {
            userId: evidenceFileData.userId,
            fileName: evidenceFileData.fileName,
            description: evidenceFileData.description
          });
          
          // Create evidence file record in database
          const newFile = await storage.createEvidenceFile(evidenceFileData);
          
          console.log("File saved successfully to database:", { 
            id: newFile.id, 
            fileName: newFile.fileName 
          });
          
          uploadedFiles.push(newFile);
        } catch (fileError: any) {
          console.error("Error storing file in database:", file.originalname, fileError);
          
          // Continue with other files instead of failing completely
          console.log("Continuing with remaining files");
        }
      }
      
      // Handle case where no files were successfully processed
      if (uploadedFiles.length === 0) {
        console.error("No files were successfully processed");
        return res.status(500).json({
          message: "Failed to process any of the uploaded files",
          details: "Check server logs for more information"
        });
      }
      
      // Send notification through WebSocket if needed
      if (app.locals.broadcastMessage) {
        console.log("Broadcasting evidence upload notification via WebSocket");
        app.locals.broadcastMessage({
          type: 'evidence_uploaded',
          userId: userId,
          count: uploadedFiles.length,
          timestamp: new Date()
        }, { userId });
      }
      
      console.log("Upload completed successfully for", uploadedFiles.length, "files");
      res.status(201).json({ 
        message: "Files uploaded successfully", 
        files: uploadedFiles,
        userId: userId,
        count: uploadedFiles.length
      });
    } catch (error: any) {
      console.error("Error uploading evidence files:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ 
        message: `Server error during evidence file upload: ${error.message}`,
        errorType: error.name,
        errorDetails: error.stack
      });
    }
  });
  
  // Update evidence file
  app.patch("/api/evidence-files/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid evidence file ID" });
      }
      
      const evidenceFile = await storage.getEvidenceFile(id);
      if (!evidenceFile) {
        return res.status(404).json({ message: "Evidence file not found" });
      }
      
      // Validate user permissions (users can only update their own files)
      if (req.user.id !== evidenceFile.userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only update your own evidence files" });
        }
      }
      
      const { description, tags } = req.body;
      const updateData: Partial<typeof evidenceFile> = {};
      
      if (description !== undefined) {
        updateData.description = description;
      }
      
      if (tags !== undefined) {
        updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim());
      }
      
      const updatedFile = await storage.updateEvidenceFile(id, updateData);
      res.json(updatedFile);
    } catch (error: any) {
      console.error("Error updating evidence file:", error);
      res.status(500).json({ message: `Error updating evidence file: ${error.message}` });
    }
  });
  
  // Delete evidence file
  app.delete("/api/evidence-files/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid evidence file ID" });
      }
      
      const evidenceFile = await storage.getEvidenceFile(id);
      if (!evidenceFile) {
        return res.status(404).json({ message: "Evidence file not found" });
      }
      
      // Validate user permissions (users can only delete their own files)
      if (req.user.id !== evidenceFile.userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only delete your own evidence files" });
        }
      }
      
      // Delete the actual file from the filesystem
      try {
        fs.unlinkSync(evidenceFile.filePath);
      } catch (fsError) {
        console.warn(`Could not delete physical file ${evidenceFile.filePath}:`, fsError);
      }
      
      // Delete the file record from storage
      const success = await storage.deleteEvidenceFile(id);
      
      if (success) {
        res.json({ message: "Evidence file deleted successfully" });
      } else {
        res.status(500).json({ message: "Error deleting evidence file" });
      }
    } catch (error: any) {
      console.error("Error deleting evidence file:", error);
      res.status(500).json({ message: `Error deleting evidence file: ${error.message}` });
    }
  });
  
  // Transfer evidence files from one user to another (used when converting temporary user)
  app.patch("/api/evidence-files/transfer/:fromUserId/:toUserId", async (req: Request, res: Response) => {
    try {
      const fromUserId = parseInt(req.params.fromUserId);
      const toUserId = parseInt(req.params.toUserId);
      
      if (isNaN(fromUserId) || isNaN(toUserId)) {
        return res.status(400).json({ message: "Invalid user IDs" });
      }
      
      // Get all evidence files for the source user
      const evidenceFiles = await storage.getEvidenceFiles(fromUserId);
      
      if (evidenceFiles.length === 0) {
        return res.json({ 
          message: "No files to transfer",
          count: 0
        });
      }
      
      // Transfer each file to the new user
      let transferCount = 0;
      for (const file of evidenceFiles) {
        const updated = await storage.updateEvidenceFile(file.id, { userId: toUserId });
        if (updated) transferCount++;
      }
      
      res.json({ 
        message: `Successfully transferred ${transferCount} evidence files`,
        count: transferCount,
        files: evidenceFiles.map(f => f.id)
      });
    } catch (error: any) {
      console.error("Error transferring evidence files:", error);
      res.status(500).json({ message: `Error transferring evidence files: ${error.message}` });
    }
  });
  
  // Analyze evidence content
  app.post("/api/evidence-files/:id/analyze", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid evidence file ID" });
      }
      
      const evidenceFile = await storage.getEvidenceFile(id);
      if (!evidenceFile) {
        return res.status(404).json({ message: "Evidence file not found" });
      }
      
      // Validate user permissions (users can only analyze their own files)
      if (req.user.id !== evidenceFile.userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only analyze your own evidence files" });
        }
      }
      
      // Use OpenAI to analyze the file content
      let analyzedContent = "";
      const fileExt = path.extname(evidenceFile.originalName).toLowerCase();
      
      // For proper implementation, we would extract text content from files
      // Here's a more realistic implementation using OpenAI
      try {
        // Create a description of the file based on metadata
        const fileInfo = {
          name: evidenceFile.originalName,
          type: evidenceFile.fileType,
          size: evidenceFile.fileSize,
          extension: fileExt,
          description: evidenceFile.description || "",
          tags: evidenceFile.tags || []
        };
        
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // For text-based documents, we'd extract actual content
        // For images, we'd use OCR first then analyze
        // For now, we'll use the file metadata to simulate this
        const prompt = `
          I have uploaded a file as evidence for a legal case. Based on the available information, 
          please analyze this file and provide insights on what legal documents or forms might be most 
          relevant to my situation. The file has the following properties:
          
          File name: ${fileInfo.name}
          File type: ${fileInfo.type}
          Description: ${fileInfo.description || "No description provided"}
          Tags: ${fileInfo.tags?.join(", ") || "No tags provided"}
          
          Please analyze what this evidence might suggest about my legal situation and what Canadian legal 
          forms or templates would be most appropriate.
        `;
        
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a legal assistant specializing in Canadian law. Your task is to analyze evidence and suggest appropriate legal documents and actions." },
            { role: "user", content: prompt }
          ],
          max_tokens: 500,
        });
        
        // Extract the analysis from the AI response
        analyzedContent = response.choices[0].message.content || 
                         `Analysis of file ${evidenceFile.originalName}:\n` +
                         `This file appears to be relevant to your case. Based on the file type (${fileExt}), it may contain important evidence.`;
      } catch (aiError) {
        console.error("Error using OpenAI for analysis:", aiError);
        
        // Fallback if OpenAI analysis fails
        if (fileExt === '.pdf' || fileExt === '.doc' || fileExt === '.docx') {
          analyzedContent = `Document analysis of file ${evidenceFile.originalName}:\n` +
                            `This appears to be a ${fileExt.substring(1)} document with relevant information for your case.`;
        } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
          analyzedContent = `Image analysis of file ${evidenceFile.originalName}:\n` +
                            `This appears to be an image with potential evidence for your case.`;
        } else {
          analyzedContent = `Analysis of file ${evidenceFile.originalName}:\n` +
                            `This file type (${fileExt}) has been processed for relevant case information.`;
        }
      }
      
      // Update the evidence file with the analyzed content
      const updatedFile = await storage.updateEvidenceAnalysis(id, analyzedContent);
      
      if (updatedFile) {
        res.json({
          message: "Evidence file analyzed successfully",
          file: updatedFile
        });
      } else {
        res.status(500).json({ message: "Error updating evidence analysis" });
      }
    } catch (error: any) {
      console.error("Error analyzing evidence file:", error);
      res.status(500).json({ message: `Error analyzing evidence file: ${error.message}` });
    }
  });
  
  // Case Analysis API endpoints
  
  // Get all case analyses for a user
  app.get("/api/case-analyses/user/:userId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate user permissions (users can only access their own analyses)
      if (req.user.id !== userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only access your own case analyses" });
        }
      }
      
      const caseAnalyses = await storage.getCaseAnalyses(userId);
      res.json(caseAnalyses);
    } catch (error: any) {
      console.error("Error fetching case analyses:", error);
      res.status(500).json({ message: `Error fetching case analyses: ${error.message}` });
    }
  });
  
  // Get a specific case analysis
  app.get("/api/case-analyses/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case analysis ID" });
      }
      
      const caseAnalysis = await storage.getCaseAnalysis(id);
      if (!caseAnalysis) {
        return res.status(404).json({ message: "Case analysis not found" });
      }
      
      // Validate user permissions (users can only access their own analyses)
      if (req.user.id !== caseAnalysis.userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only access your own case analyses" });
        }
      }
      
      res.json(caseAnalysis);
    } catch (error: any) {
      console.error("Error fetching case analysis:", error);
      res.status(500).json({ message: `Error fetching case analysis: ${error.message}` });
    }
  });
  
  // Get case analysis by evidence ids
  app.post("/api/case-analyses/by-evidence", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { evidenceIds } = req.body;
      
      if (!evidenceIds || !Array.isArray(evidenceIds) || evidenceIds.length === 0) {
        return res.status(400).json({ message: "Invalid or missing evidence IDs" });
      }
      
      // Validate all evidence IDs are numbers
      const invalidId = evidenceIds.find(id => isNaN(parseInt(id)));
      if (invalidId) {
        return res.status(400).json({ message: `Invalid evidence ID format: ${invalidId}` });
      }
      
      // Validate user permissions (users can only access analyses for their own evidence)
      for (const evidenceId of evidenceIds) {
        const evidence = await storage.getEvidenceFile(parseInt(evidenceId));
        if (!evidence) {
          return res.status(404).json({ message: `Evidence file with ID ${evidenceId} not found` });
        }
        
        if (req.user.id !== evidence.userId) {
          const userRole = await storage.getUserRole(req.user.id);
          if (!userRole || userRole.role !== 'admin') {
            return res.status(403).json({ message: "You can only access analyses for your own evidence" });
          }
        }
      }
      
      const caseAnalysis = await storage.getCaseAnalysisByEvidence(evidenceIds);
      
      if (caseAnalysis) {
        res.json(caseAnalysis);
      } else {
        res.status(404).json({ message: "No case analysis found for the provided evidence IDs" });
      }
    } catch (error: any) {
      console.error("Error fetching case analysis by evidence:", error);
      res.status(500).json({ message: `Error fetching case analysis: ${error.message}` });
    }
  });
  
  // Create a new case analysis
  app.post("/api/case-analyses", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Validate request body
      const validationResult = insertCaseAnalysisSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid case analysis data", 
          errors: validationResult.error.format() 
        });
      }
      
      const caseAnalysisData = validationResult.data;
      
      // Ensure the user is only creating analyses for their own evidence
      for (const evidenceId of caseAnalysisData.evidenceIds) {
        const evidence = await storage.getEvidenceFile(evidenceId);
        if (!evidence) {
          return res.status(404).json({ message: `Evidence file with ID ${evidenceId} not found` });
        }
        
        if (req.user.id !== evidence.userId) {
          const userRole = await storage.getUserRole(req.user.id);
          if (!userRole || userRole.role !== 'admin') {
            return res.status(403).json({ message: "You can only create analyses for your own evidence" });
          }
        }
      }
      
      // Override userId to ensure it matches the authenticated user
      caseAnalysisData.userId = req.user.id;
      
      // Gather evidence analyses to generate better recommendations
      const evidenceFiles = [];
      for (const evidenceId of caseAnalysisData.evidenceIds) {
        const evidence = await storage.getEvidenceFile(evidenceId);
        if (evidence) {
          evidenceFiles.push(evidence);
        }
      }
      
      // If we have evidence files with analysis, use OpenAI to generate recommendations
      if (evidenceFiles.length > 0 && evidenceFiles.some(file => file.analyzedContent)) {
        try {
          // Combine all evidence analyses
          const evidenceAnalyses = evidenceFiles
            .filter(file => file.analyzedContent)
            .map(file => file.analyzedContent)
            .join("\n\n");
          
          // Get document templates for recommendations
          const allTemplates = await storage.getDocumentTemplates();
          
          const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });
          
          const prompt = `
            I need to analyze the evidence for a legal case and recommend relevant document templates.
            
            EVIDENCE ANALYSIS:
            ${evidenceAnalyses}
            
            AVAILABLE DOCUMENT TEMPLATES:
            ${allTemplates.map(t => `ID: ${t.id}, Name: ${t.name}, Category: ${t.category}, Province: ${t.province || 'All'}, Description: ${t.description}`).join('\n')}
            
            Based on this evidence, please identify the top 3-5 most relevant document templates from the above list.
            Return a JSON array of document template IDs, like this: [1, 5, 10]
            Only include the IDs in the array, nothing else.
          `;
          
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a legal assistant specializing in Canadian law. Your job is to match evidence to appropriate legal document templates." },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 150,
          });
          
          // Extract recommended form IDs from the AI response
          let recommendedForms: number[] = [];
          try {
            const content = response.choices[0].message.content?.trim() || '';
            // Extract just the JSON array part using regex
            const jsonMatch = content.match(/\[.*?\]/);
            if (jsonMatch) {
              recommendedForms = JSON.parse(jsonMatch[0]);
            }
          } catch (parseError) {
            console.error("Error parsing AI recommendations:", parseError);
            // Fallback: Recommend a few forms based on simple matching
            recommendedForms = allTemplates
              .filter(t => evidenceAnalyses.toLowerCase().includes(t.category.toLowerCase()))
              .slice(0, 3)
              .map(t => t.id);
          }
          
          // Generate a case summary based on the evidence
          const summaryResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a legal assistant specializing in Canadian law. Your job is to analyze evidence and summarize legal cases." },
              { role: "user", content: `Based on the following evidence analysis, provide a concise summary of the legal case:\n\n${evidenceAnalyses}` }
            ],
            temperature: 0.5,
            max_tokens: 250,
          });
          
          const caseSummary = summaryResponse.choices[0].message.content || "Case analysis based on uploaded evidence.";
          
          // Update the case analysis data with AI-generated recommendations
          caseAnalysisData.recommendedForms = recommendedForms;
          caseAnalysisData.caseSummary = caseSummary;
          
        } catch (aiError) {
          console.error("Error generating AI recommendations:", aiError);
          // Proceed without AI recommendations if there's an error
        }
      }
      
      const newCaseAnalysis = await storage.createCaseAnalysis(caseAnalysisData);
      
      res.status(201).json(newCaseAnalysis);
    } catch (error: any) {
      console.error("Error creating case analysis:", error);
      res.status(500).json({ message: `Error creating case analysis: ${error.message}` });
    }
  });
  
  // Update a case analysis
  app.patch("/api/case-analyses/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case analysis ID" });
      }
      
      const caseAnalysis = await storage.getCaseAnalysis(id);
      if (!caseAnalysis) {
        return res.status(404).json({ message: "Case analysis not found" });
      }
      
      // Validate user permissions (users can only update their own analyses)
      if (req.user.id !== caseAnalysis.userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only update your own case analyses" });
        }
      }
      
      // Extract only valid update fields
      const {
        caseSummary,
        recommendedForms,
        isPremiumAssessment,
        evidenceIds
      } = req.body;
      
      const updateData: Partial<typeof caseAnalysis> = {};
      
      if (caseSummary !== undefined) {
        updateData.caseSummary = caseSummary;
      }
      
      if (recommendedForms !== undefined) {
        updateData.recommendedForms = recommendedForms;
      }
      
      if (isPremiumAssessment !== undefined) {
        updateData.isPremiumAssessment = isPremiumAssessment;
      }
      
      if (evidenceIds !== undefined && Array.isArray(evidenceIds)) {
        // Verify all evidence belongs to this user
        for (const evidenceId of evidenceIds) {
          const evidence = await storage.getEvidenceFile(evidenceId);
          if (!evidence) {
            return res.status(404).json({ message: `Evidence file with ID ${evidenceId} not found` });
          }
          
          if (req.user.id !== evidence.userId) {
            const userRole = await storage.getUserRole(req.user.id);
            if (!userRole || userRole.role !== 'admin') {
              return res.status(403).json({ message: "You can only reference your own evidence files" });
            }
          }
        }
        
        updateData.evidenceIds = evidenceIds;
      }
      
      const updatedAnalysis = await storage.updateCaseAnalysis(id, updateData);
      res.json(updatedAnalysis);
    } catch (error: any) {
      console.error("Error updating case analysis:", error);
      res.status(500).json({ message: `Error updating case analysis: ${error.message}` });
    }
  });
  
  // Add merit assessment to a case analysis
  app.post("/api/case-analyses/:id/merit-assessment", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case analysis ID" });
      }
      
      const caseAnalysis = await storage.getCaseAnalysis(id);
      if (!caseAnalysis) {
        return res.status(404).json({ message: "Case analysis not found" });
      }
      
      // Validate user permissions (users can only update their own analyses)
      if (req.user.id !== caseAnalysis.userId) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only update your own case analyses" });
        }
      }
      
      // Validate that this is a premium assessment
      if (!caseAnalysis.isPremiumAssessment) {
        return res.status(400).json({ message: "Merit assessment is only available for premium case analyses" });
      }
      
      const { meritScore, meritWeight, meritAssessment, predictedOutcome, meritFactors } = req.body;
      
      if (
        meritScore === undefined || 
        meritWeight === undefined ||
        meritAssessment === undefined || 
        predictedOutcome === undefined ||
        meritFactors === undefined
      ) {
        return res.status(400).json({ 
          message: "Missing required fields",
          required: ["meritScore", "meritWeight", "meritAssessment", "predictedOutcome", "meritFactors"]
        });
      }
      
      if (typeof meritScore !== 'number' || meritScore < 0 || meritScore > 100) {
        return res.status(400).json({ message: "Merit score must be a number between 0 and 100" });
      }
      
      if (typeof meritWeight !== 'number' || meritWeight < 0 || meritWeight > 100) {
        return res.status(400).json({ message: "Merit weight must be a number between 0 and 100" });
      }
      
      if (typeof meritAssessment !== 'string' || meritAssessment.trim() === '') {
        return res.status(400).json({ message: "Merit assessment must be a non-empty string" });
      }
      
      if (typeof predictedOutcome !== 'string' || predictedOutcome.trim() === '') {
        return res.status(400).json({ message: "Predicted outcome must be a non-empty string" });
      }
      
      // Add the merit assessment
      const updatedAnalysis = await storage.addMeritAssessment(
        id, 
        meritScore,
        meritWeight,
        meritAssessment,
        predictedOutcome,
        meritFactors
      );
      
      if (updatedAnalysis) {
        res.json(updatedAnalysis);
      } else {
        res.status(500).json({ message: "Error adding merit assessment" });
      }
    } catch (error: any) {
      console.error("Error adding merit assessment:", error);
      res.status(500).json({ message: `Error adding merit assessment: ${error.message}` });
    }
  });
  
  // CHAT ROUTES
  // ===========
  
  // Helper function to generate system responses based on user messages
  const generateSystemResponse = async (userMessage: string, isPremiumSupport: boolean = false): Promise<string> => {
    // This is a simplified response logic. In a real application, you'd integrate with 
    // an actual AI service or use more sophisticated logic based on message content
    const supportMessages = [
      "I understand this is a difficult situation. Let me help you navigate through this.",
      "You're doing the right thing by seeking help. Here's what you can do next...",
      "Many people face similar challenges. Here's what has worked for others...",
      "The legal system can be complex, but I'm here to help simplify it for you.",
      "You have rights in this situation. Let me explain what they are...",
      "It sounds like you're going through a tough time. Here are some resources that might help...",
      "I'm here to support you through this process. Let's take it one step at a time.",
      "Your situation is important, and there are options available to you."
    ];
    
    // Premium users get more detailed and personalized responses
    const premiumSupportMessages = [
      "As a premium member, I can offer you more detailed guidance. Let's analyze your situation step-by-step...",
      "Thank you for being a premium member. I've analyzed your situation and here's my personalized recommendation...",
      "Your premium status allows me to provide you with priority assistance. Here's a comprehensive approach to your situation...",
      "I've carefully considered your case details as a premium member. Here's my assessment and recommendation...",
      "Based on the specifics of your situation and our premium resources, I suggest the following detailed approach..."
    ];
    
    // Simulate response delay to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Choose a message based on whether this is premium support
    const availableMessages = isPremiumSupport ? 
      [...supportMessages, ...premiumSupportMessages] : 
      supportMessages;
    
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    let response = availableMessages[randomIndex];
    
    // Add a more specific response if certain keywords are detected
    if (userMessage.toLowerCase().includes("eviction")) {
      response += " For eviction matters, I recommend reviewing our T2 application templates and the Landlord-Tenant Board procedures specific to your province.";
    } else if (userMessage.toLowerCase().includes("rent increase")) {
      response += " For rent increase issues, check if the increase follows the provincial guidelines and consider using our T6 form templates.";
    } else if (userMessage.toLowerCase().includes("children's aid")) {
      response += " When dealing with Children's Aid matters, documentation is crucial. Consider organizing your evidence using our document management system.";
    }
    
    return response;
  };
  
  // Get all chat conversations for a user
  app.get("/api/chat/conversations", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const conversations = await storage.getChatConversations(req.user.id);
      res.json(conversations);
    } catch (error: any) {
      console.error("Error getting chat conversations:", error);
      res.status(500).json({ message: `Error getting chat conversations: ${error.message}` });
    }
  });
  
  // Get a specific chat conversation
  app.get("/api/chat/conversations/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getChatConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Verify user has access to this conversation
      if (conversation.userId !== req.user.id) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only access your own conversations" });
        }
      }
      
      res.json(conversation);
    } catch (error: any) {
      console.error("Error getting chat conversation:", error);
      res.status(500).json({ message: `Error getting chat conversation: ${error.message}` });
    }
  });
  
  // Create a new chat conversation
  app.post("/api/chat/conversations", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { title, isPremiumSupport = false } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Conversation title is required" });
      }
      
      // For premium support, check if user has premium subscription
      if (isPremiumSupport) {
        const user = await storage.getUser(req.user.id);
        if (!user || !user.stripeSubscriptionId) {
          return res.status(403).json({ message: "Premium support requires a premium subscription" });
        }
      }
      
      const conversation = await storage.createChatConversation({
        userId: req.user.id,
        title,
        isPremiumSupport
      });
      
      res.status(201).json(conversation);
    } catch (error: any) {
      console.error("Error creating chat conversation:", error);
      res.status(500).json({ message: `Error creating chat conversation: ${error.message}` });
    }
  });
  
  // Get messages for a conversation
  app.get("/api/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getChatConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Verify user has access to this conversation
      if (conversation.userId !== req.user.id) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only access your own conversations" });
        }
      }
      
      const messages = await storage.getChatMessages(id);
      res.json(messages);
    } catch (error: any) {
      console.error("Error getting chat messages:", error);
      res.status(500).json({ message: `Error getting chat messages: ${error.message}` });
    }
  });
  
  // Send a message in a conversation
  app.post("/api/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getChatConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Verify user has access to this conversation
      if (conversation.userId !== req.user.id) {
        const userRole = await storage.getUserRole(req.user.id);
        if (!userRole || userRole.role !== 'admin') {
          return res.status(403).json({ message: "You can only send messages in your own conversations" });
        }
      }
      
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Create the user message
      const userMessage = await storage.createChatMessage({
        conversationId: id,
        senderId: req.user.id,
        isUserMessage: true,
        content
      });
      
      // Generate and create a system response
      const systemResponse = await generateSystemResponse(content, conversation.isPremiumSupport);
      const systemMessage = await storage.createChatMessage({
        conversationId: id,
        senderId: 999, // System user ID (demo user)
        isUserMessage: false,
        content: systemResponse
      });
      
      res.status(201).json({
        userMessage,
        systemMessage
      });
    } catch (error: any) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: `Error sending chat message: ${error.message}` });
    }
  });
  
  // ==================== Resource routes ====================
  
  // Get all resource categories
  app.get("/api/resource-categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getResourceCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching resource categories: ${error.message}` });
    }
  });
  
  // Get a single resource category
  app.get("/api/resource-categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID format" });
      }
      
      const category = await storage.getResourceCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Resource category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching resource category: ${error.message}` });
    }
  });
  
  // Create a resource category (admin only)
  app.post("/api/resource-categories", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      // For now, we'll just allow any authenticated user to create categories
      
      const validationResult = insertResourceCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: validationResult.error.format() });
      }
      
      const newCategory = await storage.createResourceCategory(validationResult.data);
      res.status(201).json(newCategory);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating resource category: ${error.message}` });
    }
  });
  
  // Update a resource category (admin only)
  app.put("/api/resource-categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID format" });
      }
      
      const validationResult = insertResourceCategorySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: validationResult.error.format() });
      }
      
      const updatedCategory = await storage.updateResourceCategory(id, validationResult.data);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Resource category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error: any) {
      res.status(500).json({ message: `Error updating resource category: ${error.message}` });
    }
  });
  
  // Delete a resource category (admin only)
  app.delete("/api/resource-categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID format" });
      }
      
      const result = await storage.deleteResourceCategory(id);
      if (!result) {
        return res.status(400).json({ message: "Cannot delete category that has subcategories or resources" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: `Error deleting resource category: ${error.message}` });
    }
  });
  
  // Get all resource subcategories (optionally filtered by category)
  app.get("/api/resource-subcategories", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      // If categoryId was provided but is not a valid number
      if (req.query.categoryId && isNaN(categoryId as number)) {
        return res.status(400).json({ message: "Invalid category ID format" });
      }
      
      const subcategories = await storage.getResourceSubcategories(categoryId);
      res.json(subcategories);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching resource subcategories: ${error.message}` });
    }
  });
  
  // Get a single resource subcategory
  app.get("/api/resource-subcategories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subcategory ID format" });
      }
      
      const subcategory = await storage.getResourceSubcategory(id);
      if (!subcategory) {
        return res.status(404).json({ message: "Resource subcategory not found" });
      }
      
      res.json(subcategory);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching resource subcategory: ${error.message}` });
    }
  });
  
  // Create a resource subcategory (admin only)
  app.post("/api/resource-subcategories", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const validationResult = insertResourceSubcategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid subcategory data", errors: validationResult.error.format() });
      }
      
      const newSubcategory = await storage.createResourceSubcategory(validationResult.data);
      res.status(201).json(newSubcategory);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating resource subcategory: ${error.message}` });
    }
  });
  
  // Update a resource subcategory (admin only)
  app.put("/api/resource-subcategories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subcategory ID format" });
      }
      
      const validationResult = insertResourceSubcategorySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid subcategory data", errors: validationResult.error.format() });
      }
      
      const updatedSubcategory = await storage.updateResourceSubcategory(id, validationResult.data);
      if (!updatedSubcategory) {
        return res.status(404).json({ message: "Resource subcategory not found" });
      }
      
      res.json(updatedSubcategory);
    } catch (error: any) {
      res.status(500).json({ message: `Error updating resource subcategory: ${error.message}` });
    }
  });
  
  // Delete a resource subcategory (admin only)
  app.delete("/api/resource-subcategories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subcategory ID format" });
      }
      
      const result = await storage.deleteResourceSubcategory(id);
      if (!result) {
        return res.status(400).json({ message: "Cannot delete subcategory that has resources assigned to it" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: `Error deleting resource subcategory: ${error.message}` });
    }
  });
  
  // Get resources with filtering
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const options: { province?: string; categoryId?: number; subcategoryId?: number; isPremium?: boolean } = {};
      
      if (req.query.province) {
        options.province = req.query.province as string;
      }
      
      if (req.query.categoryId) {
        const categoryId = parseInt(req.query.categoryId as string);
        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid category ID format" });
        }
        options.categoryId = categoryId;
      }
      
      if (req.query.subcategoryId) {
        const subcategoryId = parseInt(req.query.subcategoryId as string);
        if (isNaN(subcategoryId)) {
          return res.status(400).json({ message: "Invalid subcategory ID format" });
        }
        options.subcategoryId = subcategoryId;
      }
      
      if (req.query.isPremium !== undefined) {
        options.isPremium = req.query.isPremium === 'true';
      }
      
      // Handle search functionality
      if (req.query.search) {
        const searchTerm = req.query.search as string;
        const resources = await storage.searchResources(searchTerm, options);
        res.json(resources);
      } else {
        const resources = await storage.getResources(options);
        res.json(resources);
      }
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching resources: ${error.message}` });
    }
  });
  
  // Get a single resource
  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const resource = await storage.getResource(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Increment view count
      await storage.updateResource(id, { 
        viewCount: (resource.viewCount || 0) + 1 
      });
      
      // Check if premium content should be visible to this user
      if (resource.isPremium) {
        if (!req.isAuthenticated()) {
          // Hide sensitive fields for non-authenticated users
          return res.json({
            ...resource,
            content: "This is premium content. Please sign in to view.",
            contactInfo: null
          });
        }
        
        // TODO: Add subscription check here when subscription system is implemented
        // For now, we'll show premium content to all authenticated users
      }
      
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching resource: ${error.message}` });
    }
  });
  
  // Get community resources with filtering for the Community Resource Sharing Network
  app.get("/api/community/resources", async (req: Request, res: Response) => {
    try {
      const options: { 
        province?: string; 
        resourceType?: string; 
        isVerified?: boolean;
        userId?: number;
      } = {};
      
      if (req.query.province) {
        options.province = req.query.province as string;
      }
      
      if (req.query.type) {
        options.resourceType = req.query.type as string;
      }
      
      if (req.query.verified !== undefined) {
        options.isVerified = req.query.verified === 'true';
      }
      
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        options.userId = userId;
      }
      
      // Get all resources
      const allResources = await storage.getResources();
      
      // Filter resources based on options
      let filteredResources = allResources;
      
      if (options.province) {
        filteredResources = filteredResources.filter(resource => 
          resource.province === options.province
        );
      }
      
      if (options.resourceType) {
        filteredResources = filteredResources.filter(resource => 
          resource.resourceType === options.resourceType
        );
      }
      
      if (options.isVerified !== undefined) {
        filteredResources = filteredResources.filter(resource => 
          resource.isVerified === options.isVerified
        );
      }
      
      if (options.userId) {
        filteredResources = filteredResources.filter(resource => 
          resource.userId === options.userId
        );
      }
      
      // Handle search functionality
      if (req.query.search) {
        const searchTerm = (req.query.search as string).toLowerCase();
        filteredResources = filteredResources.filter(resource => 
          resource.title.toLowerCase().includes(searchTerm) || 
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.content.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(filteredResources);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching community resources: ${error.message}` });
    }
  });
  
  // Get a single community resource
  app.get("/api/community/resources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const resource = await storage.getResource(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Increment view count
      await storage.updateResource(id, { 
        viewCount: (resource.viewCount || 0) + 1 
      });
      
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching community resource: ${error.message}` });
    }
  });
  
  // Create a community resource
  app.post("/api/community/resources", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Extract data from form
      const { title, description, resourceType, province, tags } = req.body;
      let resourceUrl = req.body.resourceUrl || null;
      let fileUrl = null;
      
      // Handle file upload
      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
      }
      
      // Validate required fields
      if (!title || !description || !resourceType || !province) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Convert tags string to array
      const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];
      
      // Create resource
      const newResource = await storage.createResource({
        userId: req.user.id,
        title,
        description,
        content: description, // Use description as content for now
        resourceType,
        province,
        resourceUrl,
        fileUrl,
        tags: tagsArray,
        isVerified: false,
        isPremium: false,
      });
      
      res.status(201).json(newResource);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating community resource: ${error.message}` });
    }
  });
  
  // Like a community resource
  app.post("/api/community/resources/:id/like", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const resource = await storage.getResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Check if user already liked this resource
      const existingLike = await storage.getResourceLikeByUserAndResource(req.user.id, resourceId);
      
      if (existingLike) {
        // Unlike the resource
        await storage.deleteResourceLike(existingLike.id);
        
        // Decrement like count
        await storage.updateResource(resourceId, {
          likeCount: Math.max(0, (resource.likeCount || 0) - 1)
        });
        
        return res.json({ 
          liked: false, 
          likeCount: Math.max(0, (resource.likeCount || 0) - 1)
        });
      } else {
        // Like the resource
        await storage.createResourceLike({
          resourceId,
          userId: req.user.id
        });
        
        // Increment like count
        await storage.updateResource(resourceId, {
          likeCount: (resource.likeCount || 0) + 1
        });
        
        return res.json({ 
          liked: true, 
          likeCount: (resource.likeCount || 0) + 1
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: `Error liking resource: ${error.message}` });
    }
  });
  
  // Bookmark a community resource
  app.post("/api/community/resources/:id/bookmark", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const resource = await storage.getResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Check if user already bookmarked this resource
      const existingBookmark = await storage.getResourceBookmarkByUserAndResource(req.user.id, resourceId);
      
      if (existingBookmark) {
        // Remove bookmark
        await storage.deleteResourceBookmark(existingBookmark.id);
        return res.json({ bookmarked: false });
      } else {
        // Add bookmark
        await storage.createResourceBookmark({
          resourceId,
          userId: req.user.id
        });
        return res.json({ bookmarked: true });
      }
    } catch (error: any) {
      res.status(500).json({ message: `Error bookmarking resource: ${error.message}` });
    }
  });
  
  // Get user's bookmarked resources
  app.get("/api/community/resources/bookmarks", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get all resource bookmarks for the user
      const bookmarks = await storage.getResourceBookmarksByUser(req.user.id);
      
      // Fetch the complete resource data for each bookmarked resource
      const bookmarkedResources = [];
      for (const bookmark of bookmarks) {
        const resource = await storage.getResource(bookmark.resourceId);
        if (resource) {
          bookmarkedResources.push(resource);
        }
      }
      res.json(bookmarkedResources);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching bookmarked resources: ${error.message}` });
    }
  });
  
  // Admin endpoints for managing resources
  
  // Create a resource (admin only)
  app.post("/api/resources", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const validationResult = insertResourceSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid resource data", errors: validationResult.error.format() });
      }
      
      const newResource = await storage.createResource(validationResult.data);
      res.status(201).json(newResource);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating resource: ${error.message}` });
    }
  });
  
  // Update a resource (admin only)
  app.put("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const validationResult = insertResourceSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid resource data", errors: validationResult.error.format() });
      }
      
      const updatedResource = await storage.updateResource(id, validationResult.data);
      if (!updatedResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(updatedResource);
    } catch (error: any) {
      res.status(500).json({ message: `Error updating resource: ${error.message}` });
    }
  });
  
  // Delete a resource (admin only)
  app.delete("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // TODO: Add proper admin check here
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const result = await storage.deleteResource(id);
      if (!result) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: `Error deleting resource: ${error.message}` });
    }
  });
  
  // === Contributor Reputation System Endpoints ===
  
  // Get a user's reputation
  app.get("/api/reputation/users/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const reputation = await storage.getContributorReputation(userId);
      if (!reputation) {
        return res.status(404).json({ message: "User reputation not found" });
      }
      
      res.json(reputation);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching user reputation: ${error.message}` });
    }
  });
  
  // Get top contributors
  app.get("/api/reputation/top-contributors", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topContributors = await storage.getTopContributors(limit);
      
      res.json(topContributors);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching top contributors: ${error.message}` });
    }
  });
  
  // Vote on a resource (upvote or downvote)
  app.post("/api/reputation/resources/:id/vote", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const { vote, reason } = req.body;
      if (vote !== 1 && vote !== -1) {
        return res.status(400).json({ message: "Vote must be either 1 (upvote) or -1 (downvote)" });
      }
      
      const resource = await storage.getResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Check if user already voted for this resource
      const existingVote = await storage.getUserResourceVote(req.user.id, resourceId);
      
      if (existingVote) {
        // If the vote is the same as before, remove the vote
        if (existingVote.vote === vote) {
          await storage.deleteResourceVote(existingVote.id);
          
          // Create reputation history entry for removed vote
          await storage.createReputationHistoryEntry({
            userId: resource.userId,
            action: vote === 1 ? "upvote_removed" : "downvote_removed",
            points: vote === 1 ? -5 : 2, // -5 points for removed upvote, +2 for removed downvote
            resourceId,
            description: `User removed their ${vote === 1 ? "upvote" : "downvote"} on your resource "${resource.title}"`
          });
          
          res.json({ message: "Vote removed", voteStatus: "none" });
        } else {
          // Update the vote
          const updatedVote = await storage.updateResourceVote(existingVote.id, {
            vote,
            reason,
            updatedAt: new Date()
          });
          
          // Create reputation history entries
          await storage.createReputationHistoryEntry({
            userId: resource.userId,
            action: "vote_changed",
            points: vote === 1 ? 10 : -10, // +10 for upvote, -10 for downvote
            resourceId,
            description: `Vote changed from ${existingVote.vote === 1 ? "upvote" : "downvote"} to ${vote === 1 ? "upvote" : "downvote"} on your resource "${resource.title}"`
          });
          
          res.json({ message: "Vote updated", vote: updatedVote, voteStatus: vote === 1 ? "upvote" : "downvote" });
        }
      } else {
        // Create new vote
        const newVote = await storage.createResourceVote({
          resourceId,
          userId: req.user.id,
          vote,
          reason
        });
        
        // Create reputation history entry
        await storage.createReputationHistoryEntry({
          userId: resource.userId,
          action: vote === 1 ? "upvote_received" : "downvote_received",
          points: vote === 1 ? 5 : -3, // +5 points for upvote, -3 for downvote
          resourceId,
          description: `Your resource "${resource.title}" received a ${vote === 1 ? "upvote" : "downvote"}`
        });
        
        res.json({ message: "Vote recorded", vote: newVote, voteStatus: vote === 1 ? "upvote" : "downvote" });
      }
    } catch (error: any) {
      res.status(500).json({ message: `Error voting on resource: ${error.message}` });
    }
  });
  
  // Get current user's vote status for a resource
  app.get("/api/reputation/resources/:id/vote/me", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID format" });
      }
      
      const vote = await storage.getUserResourceVote(req.user.id, resourceId);
      
      if (!vote) {
        return res.status(404).json({ message: "Vote not found", voteStatus: "none" });
      }
      
      // Convert numeric vote to string status for frontend
      const voteStatus = vote.vote === 1 ? "upvote" : vote.vote === -1 ? "downvote" : "none";
      
      res.json({
        vote,
        voteStatus
      });
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching vote status: ${error.message}` });
    }
  });
  
  // Get a user's reputation history
  app.get("/api/reputation/users/:userId/history", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if requesting own history or if admin
      if (!req.isAuthenticated() || (req.user.id !== userId && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Unauthorized to view this reputation history" });
      }
      
      const history = await storage.getReputationHistory(userId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching reputation history: ${error.message}` });
    }
  });
  
  // Get provinces list
  app.get("/api/provinces", (req: Request, res: Response) => {
    res.json(provinces);
  });

  // Register direct evidence routes
  app.use("/api/direct-evidence", registerDirectEvidenceRoutes(storage));

  return httpServer;
}
