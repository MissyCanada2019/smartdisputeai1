/**
 * Claude AI Integration Routes
 * Provides endpoints for checking status and analyzing documents with Claude
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Anthropic } = require('@anthropic-ai/sdk');

// Configure file upload with multer
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only these file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported types: PDF, DOCX, TXT, JPG, PNG'));
    }
  }
});

// Initialize Anthropic client if API key exists
let anthropic = null;
try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log('Anthropic client initialized successfully');
  } else {
    console.log('No Anthropic API key found in environment variables');
  }
} catch (error) {
  console.error('Error initializing Anthropic client:', error);
}

// Check Claude API status
router.get('/check-anthropic-status', async (req, res) => {
  try {
    // If client isn't initialized, we know it's unavailable
    if (!anthropic) {
      return res.json({
        available: false,
        error: 'API client not initialized. Check your API key.'
      });
    }
    
    // Try a simple request to verify the API is working
    try {
      // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 20,
        messages: [
          { role: 'user', content: 'Say hello' }
        ]
      });
      
      return res.json({
        available: true,
        model: 'claude-3-7-sonnet-20250219'
      });
    } catch (apiError) {
      console.error('API error when checking status:', apiError);
      return res.json({
        available: false,
        error: apiError.message || 'Error communicating with Claude API'
      });
    }
  } catch (error) {
    console.error('Error checking API status:', error);
    res.status(500).json({
      available: false,
      error: 'Server error when checking API status'
    });
  }
});

// Analyze document from text
router.post('/analyze-document', async (req, res) => {
  try {
    const { text, province = 'ON' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No document text provided' });
    }
    
    // Check if API is available
    if (!anthropic) {
      return res.status(503).json({
        error: 'Claude API is not available. Please check your API key.',
        mockData: true,
        // Return mock data for testing UI
        ...generateMockAnalysis()
      });
    }
    
    // Define system prompt for the analysis
    const systemPrompt = `You are a legal assistant for SmartDispute.ai, specialized in Canadian legal matters.
    Analyze this document from ${province} and identify:
    
    1. Type of issue (housing, employment, consumer, CAS/child services, etc.)
    2. Specific classification (e.g., "T2 - Interference with reasonable enjoyment" for housing)
    3. Recommended legal forms or responses
    4. Relevant legal references from ${province}
    5. Suggested response strategy
    6. Document complexity (basic, standard, premium, or urgent)
    
    Respond in valid JSON format with these fields:
    {
        "issue_type": string,
        "classification": string,
        "recommended_forms": string,
        "legal_references": string,
        "response_strategy": string,
        "complexity": string,
        "confidence": number (0-1)
    }
    Include detailed explanations for each field based on the document content.`;
    
    try {
      // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        system: systemPrompt,
        max_tokens: 1500,
        messages: [
          { role: 'user', content: text }
        ]
      });
      
      // Parse the JSON response from Claude
      const responseText = response.content[0].text;
      
      try {
        // Extract JSON from the response by finding the first { and the last }
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = responseText[jsonStart:jsonEnd];
          const analysis = JSON.parse(jsonStr);
          
          // Add pricing based on complexity
          const pricing = {
            'basic': 4.99,
            'standard': 14.99,
            'premium': 29.99,
            'urgent': 49.99
          };
          
          if (analysis.complexity && pricing[analysis.complexity.toLowerCase()]) {
            analysis.price = pricing[analysis.complexity.toLowerCase()];
          } else {
            analysis.price = pricing.standard;
          }
          
          return res.json(analysis);
        } else {
          // If JSON parsing fails, try to send the raw response
          console.warn('Failed to extract JSON from Claude response');
          return res.status(500).json({
            error: 'Failed to parse Claude response',
            raw_response: responseText,
            mockData: true,
            ...generateMockAnalysis()
          });
        }
      } catch (jsonError) {
        console.error('Error parsing Claude response:', jsonError);
        return res.status(500).json({
          error: 'Error parsing Claude response',
          raw_response: responseText,
          mockData: true,
          ...generateMockAnalysis()
        });
      }
    } catch (apiError) {
      console.error('Error calling Claude API:', apiError);
      return res.status(503).json({
        error: `Error calling Claude API: ${apiError.message}`,
        mockData: true,
        ...generateMockAnalysis()
      });
    }
  } catch (error) {
    console.error('Server error analyzing document:', error);
    res.status(500).json({
      error: 'Server error analyzing document',
      mockData: true,
      ...generateMockAnalysis()
    });
  }
});

// Analyze document from file upload
router.post('/analyze-document-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const province = req.body.province || 'ON';
    
    // Extract text from file based on file type
    let text = '';
    try {
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      
      if (fileExt === '.pdf') {
        // For PDF files - this would use a PDF extraction library in production
        text = await extractTextFromPdf(filePath);
      } else if (fileExt === '.docx' || fileExt === '.doc') {
        // For Word documents - this would use a document extraction library in production
        text = await extractTextFromDoc(filePath);
      } else if (fileExt === '.txt') {
        // For text files - read directly
        text = fs.readFileSync(filePath, 'utf-8');
      } else if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
        // For images - would use OCR or Claude's vision capabilities
        text = await extractTextFromImage(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
      
      // Clean up the file
      fs.unlinkSync(filePath);
      
      // Now process the extracted text through the same analysis endpoint
      const mockRequest = { body: { text, province } };
      const mockResponse = {
        json: data => res.json(data),
        status: code => ({
          json: data => res.status(code).json(data)
        })
      };
      
      // Call the text analysis logic (this could be refactored to avoid duplication)
      return await analyzeDocumentText(mockRequest, mockResponse);
      
    } catch (extractError) {
      console.error('Error extracting text from file:', extractError);
      
      // Clean up the file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(500).json({
        error: `Error extracting text from file: ${extractError.message}`,
        mockData: true,
        ...generateMockAnalysis()
      });
    }
  } catch (error) {
    console.error('Server error analyzing file:', error);
    
    // Clean up any uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Server error analyzing file',
      mockData: true,
      ...generateMockAnalysis()
    });
  }
});

// Helper function to extract text from PDF
async function extractTextFromPdf(filePath) {
  // In production, this would use a PDF library
  console.log('Extracting text from PDF:', filePath);
  return `[PDF Content Extraction Placeholder]
  
  This is a mockup of text extracted from a PDF file.
  For testing purposes, this simulates a legal document.`;
}

// Helper function to extract text from Word documents
async function extractTextFromDoc(filePath) {
  // In production, this would use a DOCX library
  console.log('Extracting text from Word document:', filePath);
  return `[Word Document Content Extraction Placeholder]
  
  This is a mockup of text extracted from a Word document.
  For testing purposes, this simulates a legal document.`;
}

// Helper function to extract text from images
async function extractTextFromImage(filePath) {
  // In production, this would use OCR or Claude's vision capabilities
  console.log('Extracting text from image:', filePath);
  return `[Image OCR Placeholder]
  
  This is a mockup of text extracted via OCR from an image.
  For testing purposes, this simulates a legal document.`;
}

// Generate mock analysis data for testing when API is unavailable
function generateMockAnalysis() {
  return {
    issue_type: "Housing Dispute",
    classification: "Eviction Notice",
    recommended_forms: "T2 - Application About Tenant Rights",
    legal_references: "Ontario Residential Tenancies Act, 2006, Sections 59-60",
    response_strategy: "Challenge the eviction notice based on improper notice period and procedural errors.",
    complexity: "standard",
    confidence: 0.85,
    price: 14.99
  };
}

module.exports = router;