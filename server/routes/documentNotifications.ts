/**
 * Document Notification API Routes
 * Handles email and notification endpoints for documents
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { documentNotificationService } from '../services/documentNotificationService';
import { emailService } from '../services/emailService';

// Set up file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept .pdf, .doc, .docx, .txt files
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (.pdf, .doc, .docx, .txt)') as any, false);
    }
  }
});

/**
 * Registers document notification routes to the Express app
 * @param app Express application
 */
export function registerDocumentNotificationRoutes(app: express.Express) {
  /**
   * Route for sending a document to a user via email
   * POST /api/documents/send-email
   */
  app.post('/api/documents/send-email', upload.single('document'), async (req: Request, res: Response) => {
    try {
      // Extract request data
      const { email, name, documentType, documentId, userId } = req.body;
      
      // Validate required fields
      if (!email || !name || !documentType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: email, name, and documentType are required' 
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No document file uploaded' 
        });
      }
      
      // Send document email
      const emailSent = await documentNotificationService.sendDocumentToUser(
        email,
        name,
        req.file.path,
        documentType,
        documentId || 'unspecified',
        userId || 'guest'
      );
      
      if (emailSent) {
        return res.status(200).json({
          success: true,
          message: 'Document email sent successfully',
          fileDetails: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            path: req.file.path
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to send document email'
        });
      }
    } catch (error: any) {
      console.error('Error in document email sending:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while sending the document'
      });
    }
  });

  /**
   * Route for sending an analysis notification email
   * POST /api/analysis/notify
   */
  app.post('/api/analysis/notify', async (req: Request, res: Response) => {
    try {
      // Extract request data
      const { email, name, documentName, analysisId, userId } = req.body;
      
      // Validate required fields
      if (!email || !name || !documentName || !analysisId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: email, name, documentName, and analysisId are required' 
        });
      }
      
      // Send analysis completion email
      const emailSent = await emailService.sendAnalysisComplete(
        email,
        name,
        analysisId,
        documentName,
        userId || 'guest'
      );
      
      if (emailSent) {
        return res.status(200).json({
          success: true,
          message: 'Analysis notification email sent successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to send analysis notification email'
        });
      }
    } catch (error: any) {
      console.error('Error in analysis notification:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while sending the notification'
      });
    }
  });

  /**
   * Route for analyzing a document and sending notification in one step
   * POST /api/documents/analyze-and-notify
   */
  app.post('/api/documents/analyze-and-notify', upload.single('document'), async (req: Request, res: Response) => {
    try {
      // Extract request data
      const { email, name, documentType, jurisdiction, userId, analysisId } = req.body;
      
      // Validate required fields
      if (!email || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: email and name are required' 
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No document file uploaded' 
        });
      }
      
      // Analyze document and send notification
      const result = await documentNotificationService.analyzeDocumentAndNotify(
        email,
        name,
        req.file.path,
        documentType || null,
        jurisdiction || 'Ontario',
        userId || 'guest',
        analysisId || Date.now().toString()
      );
      
      return res.status(200).json({
        success: true,
        message: 'Document analyzed and notification sent',
        analysisResult: result.analysisResult,
        notificationSent: result.notificationSent,
        fileDetails: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          path: req.file.path
        }
      });
    } catch (error: any) {
      console.error('Error in document analysis and notification:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during document analysis and notification'
      });
    }
  });
}