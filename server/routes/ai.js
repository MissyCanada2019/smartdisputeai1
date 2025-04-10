/**
 * AI Service Routes for SmartDispute.ai
 * 
 * This module provides routes for document analysis and response generation
 * with automatic fallback between direct Anthropic API and alternatives.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import AI service providers
import * as anthropicService from '../services/anthropic.js';
import * as fallbackService from '../services/puter.js';
import * as openaiService from '../services/openai.js';

// File paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
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
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
    }
  }
});

// Create router
const router = express.Router();

// Status variables for services
let primaryApiStatus = {
  available: false,
  checkedAt: null,
  lastError: null
};

let fallbackApiStatus = {
  available: false,
  checkedAt: null,
  lastError: null
};

// Service configuration
const config = {
  defaultModel: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  useOpenAI: true,
  defaultOpenAIModel: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  maxRetries: 3,
  timeoutMs: 60000,
};

/**
 * Get text from different file formats
 */
async function extractTextFromFile(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      // Extract text from PDF
      // This would typically use a PDF extraction library
      return "Text extracted from PDF";
    } else if (ext === '.doc' || ext === '.docx') {
      // Extract text from Word document
      // This would typically use a DOCX extraction library
      return "Text extracted from DOCX";
    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      // For images, we'd typically use OCR or vision models
      return "Text extracted from image";
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

/**
 * Attempt to use primary API with fallback to alternative
 */
async function withFallback(primaryFn, fallbackFn, params) {
  let usingFallback = false;
  let result = null;
  let error = null;
  
  // First try the primary service (direct Anthropic API)
  try {
    if (!primaryApiStatus.available && primaryApiStatus.checkedAt && 
        (new Date().getTime() - primaryApiStatus.checkedAt.getTime() < 5 * 60 * 1000)) {
      // If we checked in the last 5 minutes and it was down, skip to fallback
      throw new Error("Primary API was recently unavailable");
    }
    
    console.log("Attempting to use primary API...");
    result = await primaryFn(...params);
    primaryApiStatus = {
      available: true,
      checkedAt: new Date(),
      lastError: null
    };
    return { result, usingFallback, error: null };
  } catch (primaryError) {
    console.warn("Primary API error:", primaryError.message);
    error = primaryError.message;
    primaryApiStatus = {
      available: false,
      checkedAt: new Date(),
      lastError: primaryError.message
    };
    
    // Try the fallback service (Puter-based alternative)
    try {
      console.log("Attempting to use fallback API...");
      result = await fallbackFn(...params);
      usingFallback = true;
      fallbackApiStatus = {
        available: true,
        checkedAt: new Date(),
        lastError: null
      };
      return { result, usingFallback, error: null };
    } catch (fallbackError) {
      console.error("Fallback API error:", fallbackError.message);
      fallbackApiStatus = {
        available: false,
        checkedAt: new Date(),
        lastError: fallbackError.message
      };
      
      // Both failed, throw an error
      throw new Error(`Both primary and fallback APIs failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`);
    }
  }
}

/**
 * GET /api/ai/status
 * Returns the current status of the AI service
 */
router.get('/status', async (req, res) => {
  try {
    // Check services on demand
    if (!primaryApiStatus.checkedAt || (new Date().getTime() - primaryApiStatus.checkedAt.getTime() > 5 * 60 * 1000)) {
      try {
        // Quick test of primary API
        await anthropicService.testConnection();
        primaryApiStatus = {
          available: true,
          checkedAt: new Date(),
          lastError: null
        };
      } catch (error) {
        primaryApiStatus = {
          available: false,
          checkedAt: new Date(),
          lastError: error.message
        };
      }
    }
    
    if (!fallbackApiStatus.checkedAt || (new Date().getTime() - fallbackApiStatus.checkedAt.getTime() > 5 * 60 * 1000)) {
      try {
        // Quick test of fallback API
        await fallbackService.testConnection();
        fallbackApiStatus = {
          available: true,
          checkedAt: new Date(),
          lastError: null
        };
      } catch (error) {
        fallbackApiStatus = {
          available: false,
          checkedAt: new Date(),
          lastError: error.message
        };
      }
    }
    
    res.json({
      service: "SmartDispute.ai AI Service",
      primaryAvailable: primaryApiStatus.available,
      fallbackAvailable: fallbackApiStatus.available,
      usingFallback: !primaryApiStatus.available && fallbackApiStatus.available,
      defaultModel: config.defaultModel,
      primaryLastChecked: primaryApiStatus.checkedAt,
      fallbackLastChecked: fallbackApiStatus.checkedAt,
      lastError: primaryApiStatus.lastError || fallbackApiStatus.lastError,
      systemStatus: primaryApiStatus.available || fallbackApiStatus.available ? "operational" : "down"
    });
  } catch (error) {
    console.error('Error checking AI status:', error);
    res.status(500).json({
      error: 'Failed to check AI service status',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/analyze
 * Analyzes text directly provided in the request body
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text, province = 'ON' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided for analysis' });
    }
    
    const { result, usingFallback, error } = await withFallback(
      anthropicService.analyzeText,
      fallbackService.analyzeText,
      [text, province]
    );
    
    res.json({
      usingFallback,
      useModelName: usingFallback ? 'alternative-ai' : config.defaultModel,
      originalError: error,
      analysis: result
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({
      error: 'Failed to analyze text',
      message: error.message
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
      return res.status(400).json({ error: 'No document uploaded' });
    }
    
    const province = req.body.province || 'ON';
    const filePath = req.file.path;
    
    // Extract text from file
    const text = await extractTextFromFile(filePath);
    
    // Analyze the extracted text
    const { result, usingFallback, error } = await withFallback(
      anthropicService.analyzeText,
      fallbackService.analyzeText,
      [text, province]
    );
    
    res.json({
      usingFallback,
      useModelName: usingFallback ? 'alternative-ai' : config.defaultModel,
      originalError: error,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      analysis: result
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({
      error: 'Failed to analyze document',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/generate-response
 * Generates a response letter based on analysis and original text
 */
router.post('/generate-response', async (req, res) => {
  try {
    const { analysisResult, originalText, userInfo, province = 'ON' } = req.body;
    
    if (!analysisResult || !originalText) {
      return res.status(400).json({ error: 'Analysis result and original text are required' });
    }
    
    const { result, usingFallback, error } = await withFallback(
      anthropicService.generateResponse,
      fallbackService.generateResponse,
      [analysisResult, originalText, userInfo, province]
    );
    
    res.json({
      usingFallback,
      useModelName: usingFallback ? 'alternative-ai' : config.defaultModel,
      originalError: error,
      response: result
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/chat
 * Simple chat interface with the AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
    
    const { result, usingFallback, error } = await withFallback(
      anthropicService.chat,
      fallbackService.chat,
      [message]
    );
    
    res.json({
      usingFallback,
      useModelName: usingFallback ? 'alternative-ai' : config.defaultModel,
      originalError: error,
      response: result
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message
    });
  }
});

export default router;