/**
 * AI Service Routes for SmartDispute.ai
 * 
 * This module provides routes for document analysis and response generation
 * with automatic fallback between direct Anthropic API and alternatives.
 */

import express from 'express';
import aiService from '../services/aiService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Setup for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept PDFs, DOCs, images
    const allowedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.'));
    }
  }
});

const router = express.Router();

/**
 * GET /api/ai/status
 * Returns the current status of the AI service
 */
router.get('/status', (req, res) => {
  const status = aiService.getStatus();
  res.json({
    ...status,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/ai/analyze
 * Analyzes text directly provided in the request body
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text, province = 'ON' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required' });
    }
    
    const analysis = await aiService.analyzeDocument(text, province);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message,
      usingFallback: aiService.getStatus().usingFallback
    });
  }
});

/**
 * POST /api/ai/analyze-document
 * Analyzes a document uploaded as a file
 */
router.post('/analyze-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }
    
    const { province = 'ON' } = req.body;
    
    // For demonstration purposes - in a real implementation, we would:
    // 1. Extract text from the uploaded file based on file type (PDF, DOC, image)
    // 2. Then analyze the extracted text
    
    // Mock extraction for demo - replace with actual extraction logic
    const documentText = `This is a placeholder for text extracted from ${req.file.originalname}.
    In the actual implementation, we would use appropriate libraries:
    - PyMuPDF/fitz for PDFs
    - python-docx for Word documents
    - OCR/Vision APIs for images`;
    
    const analysis = await aiService.analyzeDocument(documentText, province);
    
    res.json({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      analysis: analysis,
      usingFallback: aiService.getStatus().usingFallback
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ 
      error: 'Document analysis failed', 
      message: error.message,
      usingFallback: aiService.getStatus().usingFallback
    });
  }
});

/**
 * POST /api/ai/generate-response
 * Generates a response letter based on analysis and original text
 */
router.post('/generate-response', async (req, res) => {
  try {
    const { analysis, originalText, userInfo } = req.body;
    
    if (!analysis || !originalText) {
      return res.status(400).json({ error: 'Analysis and original text are required' });
    }
    
    const responseHtml = await aiService.generateResponseLetter(
      analysis,
      originalText,
      userInfo
    );
    
    res.json({
      responseHtml,
      usingFallback: aiService.getStatus().usingFallback
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ 
      error: 'Response generation failed', 
      message: error.message,
      usingFallback: aiService.getStatus().usingFallback
    });
  }
});

/**
 * POST /api/ai/chat
 * Simple chat interface with the AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, options = {} } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await aiService.sendMessage(message, options);
    
    res.json({
      response,
      usingFallback: aiService.getStatus().usingFallback
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      error: 'Chat request failed', 
      message: error.message,
      usingFallback: aiService.getStatus().usingFallback
    });
  }
});

export default router;