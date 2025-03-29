import type { Express, Request, Response } from "express";
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

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { dirname } from "path";

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
            await storage.updatePaymentStatus(parseInt(documentId), "paid", paymentIntent.id);
          }
          break;
          
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          const failedDocumentId = failedPaymentIntent.metadata.documentId;
          
          if (failedDocumentId) {
            await storage.updatePaymentStatus(parseInt(failedDocumentId), "failed", failedPaymentIntent.id);
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

Based on the user's situation, recommend the most appropriate document template from this list:
${templates.map(t => `- ${t.name}: ${t.description}`).join('\n')}

You should provide helpful, compassionate advice and guide the user to the most relevant document template. If you're not sure which template is most appropriate, ask clarifying questions. Remember that users are likely facing difficult circumstances and need support.`;

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
      
      // Return the chatbot response
      res.json({ 
        response,
        templates: templates.map(t => ({ id: t.id, name: t.name }))
      });
    } catch (error: any) {
      res.status(500).json({ message: `Chatbot error: ${error.message}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
