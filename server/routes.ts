import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { userInfoFormSchema, insertUserSchema, insertUserDocumentSchema } from "@shared/schema";
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

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY. Payment processing will not work properly.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any, // Specify the API version
    })
  : undefined;
  
// Initialize OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY. AI chatbot will not work properly.');
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : undefined;

export async function registerRoutes(app: Express): Promise<Server> {
  // Output directory for generated PDFs
  const documentsDir = path.join(__dirname, "../docs");
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
  
  // Set up upload directory for supporting documents
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
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
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX are allowed."));
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
      
      const documents = await storage.getUserDocuments(userId);
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
  
  // Create subscription payment intent
  app.post("/api/create-subscription", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { plan, amount } = req.body;
      
      if (!plan || !amount) {
        return res.status(400).json({ message: "Invalid subscription data" });
      }
      
      // Set the subscription price based on the plan
      // Monthly = $30, Weekly = $10, or the provided amount
      let finalAmount = amount;
      if (plan === 'monthly') {
        finalAmount = 30;
      } else if (plan === 'weekly') {
        finalAmount = 10;
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: "cad",
        metadata: {
          plan,
          type: 'subscription'
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
  app.post("/api/income-verification", async (req: Request, res: Response) => {
    try {
      const { userId, notes } = req.body;
      
      if (!userId || typeof userId !== 'number') {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Create verification request
      const verification = await storage.createIncomeVerification({
        userId,
        verificationDocumentPath: undefined,
        notes: notes || undefined
      });
      
      res.status(201).json(verification);
    } catch (error: any) {
      res.status(500).json({ message: `Error creating verification request: ${error.message}` });
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
  
  // Chatbot API endpoint
  app.post("/api/chatbot", async (req: Request, res: Response) => {
    try {
      if (!openai) {
        return res.status(500).json({ message: "OpenAI is not configured" });
      }
      
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Missing message content" });
      }
      
      // Fetch all document templates for reference
      const templates = await storage.getDocumentTemplates();
      
      // Format the prompt with context about available document types
      const systemPrompt = `You are an AI assistant for SmartDisputesAICanada, a platform that helps low-income and marginalized Canadians with legal documents for disputes against government agencies and organizations.
      
Available document categories include:
- Children's Aid Societies disputes
- Landlord-Tenant disputes
- Equifax disputes
- Transition services disputes

For Children's Aid Society scenarios:
- If they mention CAS visiting a child's school, recommend the "CAS School Visit Response Guide"
- For cases where a child has been apprehended, recommend the "Post-Apprehension Child Return Request"
- For court proceedings, recommend the "CAS Court Hearing Preparation Guide"
- For disputing CAS decisions or records, recommend the relevant dispute letter or record correction templates

For Landlord-Tenant disputes:
- Recommend province-specific templates where available (Ontario, BC, Alberta, Quebec)
- For maintenance issues, recommend the "Maintenance/Repair Demand Letter"
- For illegal rent increases, recommend the "Illegal Rent Increase Dispute" template
- For ending tenancy in Ontario, recommend the "Ontario N9 Notice to End Tenancy"

Based on the user's situation, recommend the most appropriate document template from this list:
${templates.map(t => `- ${t.name}: ${t.description} (Category: ${t.category}, Provinces: ${t.applicableProvinces.join(', ')})`).join('\n')}

Focus on SELF-ADVOCACY: The core mission of SmartDisputesAICanada is to empower users to advocate for themselves when facing systemic challenges. Emphasize that they have the right to dispute decisions and challenge unjust treatment by government agencies.

When responding:
1. Acknowledge the user's situation with empathy
2. Emphasize their RIGHT to dispute decisions and advocate for themselves
3. Recommend the appropriate document template or templates (up to 3 most relevant ones)
4. Explain how the document will help them in their self-advocacy journey
5. Mention relevant provincial resources or advocacy groups if applicable
6. Use simple, non-legal language that's accessible to everyone

After you make your recommendation, also include the IDs of the most relevant templates in your reasoning (but don't show this to the user). Format like this at the end of your response: [TEMPLATE_IDS: 1, 5, 10] where the numbers are the template IDs that best match their scenario.

If you're not sure which template is most appropriate, ask clarifying questions. Remember that users are likely facing difficult circumstances and need support that focuses on empowerment and self-advocacy.`;

      // Get the completion from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...(context && Array.isArray(context) ? context : []),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const response = completion.choices[0].message.content;
      
      // Extract any template IDs from the response
      const templateIdMatch = response.match(/\[TEMPLATE_IDS:\s*([\d,\s]+)\]/);
      let recommendedTemplateIds: number[] = [];
      let cleanResponse = response;
      
      if (templateIdMatch && templateIdMatch[1]) {
        // Extract and clean up the template IDs
        recommendedTemplateIds = templateIdMatch[1]
          .split(',')
          .map((id: string) => parseInt(id.trim()))
          .filter((id: number) => !isNaN(id));
          
        // Remove the template IDs from the visible response
        cleanResponse = response.replace(/\[TEMPLATE_IDS:\s*[\d,\s]+\]/, '').trim();
      }
      
      // If a userId was provided, send a WebSocket notification
      const userId = req.body.userId;
      if (app.locals.broadcastMessage && userId) {
        app.locals.broadcastMessage({
          type: 'chatbot_response',
          message: cleanResponse,
          recommendedTemplateIds,
          timestamp: new Date()
        }, { userId });
      }
      
      // Return the chatbot response
      res.json({ 
        response: cleanResponse,
        templates: templates.map(t => ({ id: t.id, name: t.name })),
        recommendedTemplateIds: recommendedTemplateIds
      });
    } catch (error: any) {
      res.status(500).json({ message: `Chatbot error: ${error.message}` });
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
      const { documentId, userId } = req.body;
      
      if (!documentId && !userId) {
        return res.status(400).json({ message: "Either documentId or userId is required" });
      }
      
      // Create response with file information
      const uploadedFiles = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
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
      
      // If userId is provided (for income verification), update the income verification record
      if (userId) {
        const uId = parseInt(userId);
        if (!isNaN(uId)) {
          // Get the most recent income verification request for this user
          const verifications = await storage.getIncomeVerifications(uId);
          if (verifications.length > 0) {
            const mostRecent = verifications[0]; // Assuming sorted by date descending
            // Update income verification with file attachments
            await storage.updateIncomeVerification(mostRecent.id, {
              verificationDocumentPath: uploadedFiles[0].path // Using first file
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

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
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
  
  return httpServer;
}
