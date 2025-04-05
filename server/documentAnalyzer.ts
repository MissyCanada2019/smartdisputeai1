import express, { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { IStorage } from "./storage";
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

// Configure OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user

// Configure Anthropic client
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a safe filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit (increased from 200MB to match Express body-parser)
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.") as any);
    }
  },
});

export default function registerDocumentAnalyzerRoutes(storage: IStorage): Router {
  const router = express.Router();

  // Route to analyze uploaded document (using OpenAI by default)
  router.post('/analyze', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      // Extract AI model preference if specified
      const model = req.query.model as string || 'openai';
      console.log(`Document analysis requested using model: ${model}`);

      const filePath = req.file.path;
      let fileContent = "";

      // Extract text from document based on file type
      if (req.file.mimetype === "text/plain") {
        // For text files, just read the content
        fileContent = fs.readFileSync(filePath, "utf8");
      } else if (req.file.mimetype === "application/pdf") {
        // For PDF files, we'll extract text via OpenAI Vision
        const base64Data = fs.readFileSync(filePath).toString("base64");
        
        let analysis;
        if (model === 'claude') {
          analysis = await analyzeDocumentWithClaude(base64Data, req.file.originalname, "image");
        } else {
          analysis = await analyzeDocumentWithOpenAI(base64Data, req.file.originalname, "image");
        }
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        return res.json({
          success: true,
          analysis,
          filename: req.file.originalname,
          model
        });
      } else {
        // For DOC/DOCX files, we'll extract text using OpenAI Vision as well
        const base64Data = fs.readFileSync(filePath).toString("base64");
        
        let analysis;
        if (model === 'claude') {
          analysis = await analyzeDocumentWithClaude(base64Data, req.file.originalname, "image");
        } else {
          analysis = await analyzeDocumentWithOpenAI(base64Data, req.file.originalname, "image");
        }
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        return res.json({
          success: true,
          analysis,
          filename: req.file.originalname,
          model
        });
      }

      // If we have text content (for TXT files)
      if (fileContent) {
        let analysis;
        if (model === 'claude') {
          analysis = await analyzeDocumentWithClaude(fileContent, req.file.originalname, "text");
        } else {
          analysis = await analyzeDocumentWithOpenAI(fileContent, req.file.originalname, "text");
        }
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        return res.json({
          success: true,
          analysis,
          filename: req.file.originalname,
          model
        });
      }

    } catch (error: any) {
      console.error("Error analyzing document:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "An error occurred while analyzing the document" 
      });
    }
  });

  // Route to analyze text directly
  router.post('/analyze-text', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: "No text provided" });
      }

      // Extract AI model preference if specified
      const model = req.query.model as string || 'openai';
      console.log(`Text analysis requested using model: ${model}`);
      
      let analysis;
      if (model === 'claude') {
        analysis = await analyzeDocumentWithClaude(text, null, "text");
      } else {
        analysis = await analyzeDocumentWithOpenAI(text, null, "text");
      }
      
      return res.json({
        success: true,
        analysis,
        model
      });
      
    } catch (error: any) {
      console.error("Error analyzing text:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "An error occurred while analyzing the text" 
      });
    }
  });

  // Route to analyze documents using both AI models for comprehensive analysis
  router.post('/analyze-dual', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      console.log(`Dual AI model analysis requested for document: ${req.file.originalname}`);
      
      const filePath = req.file.path;
      let fileContent = "";
      let openaiAnalysis = "";
      let claudeAnalysis = "";

      // Extract text from document based on file type
      if (req.file.mimetype === "text/plain") {
        // For text files, just read the content
        fileContent = fs.readFileSync(filePath, "utf8");
        
        // Analyze with both models
        openaiAnalysis = await analyzeDocumentWithOpenAI(fileContent, req.file.originalname, "text");
        claudeAnalysis = await analyzeDocumentWithClaude(fileContent, req.file.originalname, "text");
      } else {
        // For PDF/DOC/DOCX files, use base64 content
        const base64Data = fs.readFileSync(filePath).toString("base64");
        
        // Analyze with both models
        openaiAnalysis = await analyzeDocumentWithOpenAI(base64Data, req.file.originalname, "image");
        claudeAnalysis = await analyzeDocumentWithClaude(base64Data, req.file.originalname, "image");
      }
      
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
      
      return res.json({
        success: true,
        openai: openaiAnalysis,
        claude: claudeAnalysis,
        filename: req.file.originalname
      });
      
    } catch (error: any) {
      console.error("Error performing dual analysis:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "An error occurred while performing dual analysis" 
      });
    }
  });

  return router;
}

// Helper function to analyze documents using OpenAI
async function analyzeDocumentWithOpenAI(
  content: string, 
  filename: string | null, 
  type: "text" | "image"
): Promise<string> {
  try {
    // Enhanced prompt instructions with merit weight analysis and legal strategy
    const systemPrompt = `
You are a legal document analyzer specialized in evaluating documents for complexity, case merit, and legal strategy. You have expertise in Canadian law, particularly in areas related to tenant rights, landlord disputes, and Children's Aid Society cases.

Analyze the provided content in depth and provide a comprehensive assessment that includes:

1. DOCUMENT ASSESSMENT:
   - A complexity score on a scale of 1-10, where 10 is extremely complex
   - An assessment of readability (easy, moderate, difficult)
   - Identification of any concerning legal jargon that might confuse non-lawyers
   - A plain-language explanation of any complex terms or concepts

2. MERIT WEIGHT ANALYSIS:
   - A numerical assessment (1-10) of the overall case merit based on the document
   - Identification of the strongest evidentiary elements in the document
   - Assessment of areas where the case may be vulnerable
   - Explanation of which facts carry the most weight from a legal perspective

3. COURT STRATEGY RECOMMENDATIONS:
   - Specific arguments that should be emphasized in court proceedings
   - Key points to prepare for cross-examination or questioning
   - Suggestions for additional evidence that could strengthen the case
   - Potential counter-arguments to anticipate from the opposing party
   - Strategic approaches for presenting the case (narratives, frameworks, etc.)

4. SUMMARY AND ACTION ITEMS:
   - A summary of the document's primary purpose and obligations
   - Bullet-point list of recommended next steps
   - Any red flags or concerning clauses that need immediate attention

Format your response with clear section headings and prioritize actionable advice that a self-represented litigant could understand and apply.`;

    let response: any;

    if (type === "text") {
      // For text content, use standard chat completion
      response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this legal document${filename ? ` (${filename})` : ''}: ${content}` }
        ],
        max_tokens: 2500,
      });
      
      return response.choices[0].message.content;
    } else {
      // For images (PDF, DOC, DOCX), use vision API
      response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: `Analyze this legal document${filename ? ` (${filename})` : ''}:`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${content}`
                }
              }
            ]
          }
        ],
        max_tokens: 2500,
      });
      
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error("Error in OpenAI document analysis:", error);
    throw new Error("Failed to analyze document with OpenAI");
  }
}

// Helper function to analyze documents using Claude
async function analyzeDocumentWithClaude(
  content: string, 
  filename: string | null, 
  type: "text" | "image"
): Promise<string> {
  try {
    // Enhanced prompt instructions with merit weight analysis and legal strategy
    const systemPrompt = `You are a legal document analyzer specialized in evaluating documents for complexity, case merit, and legal strategy. You have expertise in Canadian law, particularly in areas related to tenant rights, landlord disputes, and Children's Aid Society cases.

Analyze the provided content in depth and provide a comprehensive assessment that includes:

1. DOCUMENT ASSESSMENT:
   - A complexity score on a scale of 1-10, where 10 is extremely complex
   - An assessment of readability (easy, moderate, difficult)
   - Identification of any concerning legal jargon that might confuse non-lawyers
   - A plain-language explanation of any complex terms or concepts

2. MERIT WEIGHT ANALYSIS:
   - A numerical assessment (1-10) of the overall case merit based on the document
   - Identification of the strongest evidentiary elements in the document
   - Assessment of areas where the case may be vulnerable
   - Explanation of which facts carry the most weight from a legal perspective

3. COURT STRATEGY RECOMMENDATIONS:
   - Specific arguments that should be emphasized in court proceedings
   - Key points to prepare for cross-examination or questioning
   - Suggestions for additional evidence that could strengthen the case
   - Potential counter-arguments to anticipate from the opposing party
   - Strategic approaches for presenting the case (narratives, frameworks, etc.)

4. SUMMARY AND ACTION ITEMS:
   - A summary of the document's primary purpose and obligations
   - Bullet-point list of recommended next steps
   - Any red flags or concerning clauses that need immediate attention

Format your response with clear section headings and prioritize actionable advice that a self-represented litigant could understand and apply.`;

    if (type === "text") {
      // For text content, use standard chat completion
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 2500,
        system: systemPrompt,
        messages: [
          { 
            role: "user", 
            content: `Analyze this legal document${filename ? ` (${filename})` : ''}: ${content}` 
          }
        ],
      });
      
      if (response.content && response.content[0] && 'text' in response.content[0]) {
        return response.content[0].text;
      }
      return "Analysis not available.";
    } else {
      // For images (PDF, DOC, DOCX), use vision capabilities
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 2500,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this legal document${filename ? ` (${filename})` : ''}:`
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: content
                }
              }
            ]
          }
        ],
      });
      
      if (response.content && response.content[0] && 'text' in response.content[0]) {
        return response.content[0].text;
      }
      return "Analysis not available.";
    }
  } catch (error) {
    console.error("Error in Claude document analysis:", error);
    throw new Error("Failed to analyze document with Claude");
  }
}