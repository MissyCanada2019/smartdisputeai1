/**
 * Advanced Document Analysis API routes
 * Provides endpoints for analyzing legal documents with NLP
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as advancedNlpService from '../services/advancedNlpService';
import { DocumentAnalysisResult } from '../services/advancedNlpService';

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
      cb(new Error('Only document files are allowed (.pdf, .doc, .docx, .txt)'), false);
    }
  }
});

/**
 * Registers advanced document analysis routes to the Express app
 * @param app Express application
 */
export function registerAdvancedDocumentAnalysisRoutes(app: express.Express) {
  /**
   * Route for analyzing uploaded documents with advanced NLP
   * POST /api/advanced-analysis/upload
   */
  app.post('/api/advanced-analysis/upload', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No document file uploaded' });
      }

      const documentType = req.body.documentType || null;
      const jurisdiction = req.body.jurisdiction || 'Ontario';

      const analysisResult: DocumentAnalysisResult = await advancedNlpService.analyzeDocumentFile(
        req.file.path,
        documentType,
        jurisdiction
      );

      return res.status(200).json({
        success: true,
        result: analysisResult,
        originalFile: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error: any) {
      console.error('Error in document upload analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during document analysis',
      });
    }
  });

  /**
   * Route for analyzing documents by file path (for documents already on the server)
   * POST /api/advanced-analysis/analyze-file
   */
  app.post('/api/advanced-analysis/analyze-file', async (req: Request, res: Response) => {
    try {
      const { filePath, documentType, jurisdiction } = req.body;

      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }

      const analysisResult: DocumentAnalysisResult = await advancedNlpService.analyzeDocumentFile(
        filePath,
        documentType || null,
        jurisdiction || 'Ontario'
      );

      return res.status(200).json({
        success: true,
        result: analysisResult
      });
    } catch (error: any) {
      console.error('Error in file path analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during document analysis',
      });
    }
  });

  /**
   * Route for extracting entities from document text
   * POST /api/advanced-analysis/extract-entities
   */
  app.post('/api/advanced-analysis/extract-entities', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Document text is required' });
      }

      const entities = await advancedNlpService.extractEntities(text);

      return res.status(200).json({
        success: true,
        entities: entities
      });
    } catch (error: any) {
      console.error('Error in entity extraction:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during entity extraction',
      });
    }
  });

  /**
   * Route for extracting deadlines from document text
   * POST /api/advanced-analysis/extract-deadlines
   */
  app.post('/api/advanced-analysis/extract-deadlines', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Document text is required' });
      }

      const deadlines = await advancedNlpService.extractDeadlines(text);

      return res.status(200).json({
        success: true,
        deadlines: deadlines
      });
    } catch (error: any) {
      console.error('Error in deadline extraction:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during deadline extraction',
      });
    }
  });

  /**
   * Route for calculating document complexity
   * POST /api/advanced-analysis/calculate-complexity
   */
  app.post('/api/advanced-analysis/calculate-complexity', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Document text is required' });
      }

      const complexityScore = advancedNlpService.calculateComplexity(text);
      const interpretation = advancedNlpService.getComplexityInterpretation(complexityScore);

      return res.status(200).json({
        success: true,
        complexity: {
          score: complexityScore,
          interpretation: interpretation
        }
      });
    } catch (error: any) {
      console.error('Error in complexity calculation:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during complexity calculation',
      });
    }
  });

  /**
   * Route for analyzing text directly
   * POST /api/advanced-analysis/analyze-text
   */
  app.post('/api/advanced-analysis/analyze-text', async (req: Request, res: Response) => {
    try {
      const { text, documentType, jurisdiction } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Document text is required' });
      }

      const analysisResult: DocumentAnalysisResult = await advancedNlpService.analyzeDocument(
        text,
        documentType || null,
        jurisdiction || 'Ontario'
      );

      return res.status(200).json({
        success: true,
        result: analysisResult
      });
    } catch (error: any) {
      console.error('Error in text analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during document analysis',
      });
    }
  });
}