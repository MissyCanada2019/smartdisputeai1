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
    fileSize: 10 * 1024 * 1024, // 10MB limit for analysis
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

  // Route to get a list of user's documents
  router.get('/user-documents', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId || 'guest';
      const userDocumentsDir = path.join(process.cwd(), "uploads", userId.toString());
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(userDocumentsDir)) {
        return res.json({ success: true, documents: [] });
      }
      
      // Read the documents in the user's directory
      const files = fs.readdirSync(userDocumentsDir);
      const documents = files.map(file => {
        const filePath = path.join(userDocumentsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime
        };
      });
      
      return res.json({
        success: true,
        documents
      });
    } catch (error: any) {
      console.error("Error getting user documents:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "An error occurred while retrieving documents" 
      });
    }
  });

  // Route to analyze uploaded document (using OpenAI by default)
  router.post('/analyze', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      // Extract AI model preference if specified
      const model = req.query.model as string || 'openai';
      console.log(`Document analysis requested using model: ${model}`);

      // Get user ID from query parameter or default to 'guest'
      const userId = req.query.userId || 'guest';
      console.log(`User ID for document storage: ${userId}`);
      
      // Create user-specific directory for document storage
      const userDocumentsDir = path.join(process.cwd(), "uploads", userId.toString());
      if (!fs.existsSync(userDocumentsDir)) {
        fs.mkdirSync(userDocumentsDir, { recursive: true });
      }
      
      // Save a copy of the file to the user's directory
      const savedFilePath = path.join(userDocumentsDir, req.file.originalname);
      fs.copyFileSync(req.file.path, savedFilePath);
      
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
        try {
          if (model === 'claude') {
            analysis = await analyzeDocumentWithClaude(base64Data, req.file.originalname, "image");
          } else {
            analysis = await analyzeDocumentWithOpenAI(base64Data, req.file.originalname, "image");
          }
          
          // Clean up only the temporary uploaded file, not the saved copy
          fs.unlinkSync(filePath);
          
          return res.json({
            success: true,
            analysis,
            filename: req.file.originalname,
            model,
            saved: true,
            path: savedFilePath
          });
        } catch (analysisError) {
          console.error("Error analyzing PDF:", analysisError);
          
          // Clean up only the temporary uploaded file
          fs.unlinkSync(filePath);
          
          return res.status(500).json({
            success: false,
            error: "Failed to analyze document. The document has been saved and can be analyzed later.",
            filename: req.file.originalname,
            saved: true,
            path: savedFilePath
          });
        }
      } else {
        // For DOC/DOCX files, we'll extract text using OpenAI Vision as well
        const base64Data = fs.readFileSync(filePath).toString("base64");
        
        let analysis;
        try {
          if (model === 'claude') {
            analysis = await analyzeDocumentWithClaude(base64Data, req.file.originalname, "image");
          } else {
            analysis = await analyzeDocumentWithOpenAI(base64Data, req.file.originalname, "image");
          }
          
          // Clean up only the temporary uploaded file
          fs.unlinkSync(filePath);
          
          return res.json({
            success: true,
            analysis,
            filename: req.file.originalname,
            model,
            saved: true,
            path: savedFilePath
          });
        } catch (analysisError) {
          console.error("Error analyzing DOC/DOCX:", analysisError);
          
          // Clean up only the temporary uploaded file
          fs.unlinkSync(filePath);
          
          return res.status(500).json({
            success: false,
            error: "Failed to analyze document. The document has been saved and can be analyzed later.",
            filename: req.file.originalname,
            saved: true,
            path: savedFilePath
          });
        }
      }

      // If we have text content (for TXT files)
      if (fileContent) {
        let analysis;
        try {
          if (model === 'claude') {
            analysis = await analyzeDocumentWithClaude(fileContent, req.file.originalname, "text");
          } else {
            analysis = await analyzeDocumentWithOpenAI(fileContent, req.file.originalname, "text");
          }
          
          // Clean up only the temporary uploaded file
          fs.unlinkSync(filePath);
          
          return res.json({
            success: true,
            analysis,
            filename: req.file.originalname,
            model,
            saved: true,
            path: savedFilePath
          });
        } catch (analysisError) {
          console.error("Error analyzing text file:", analysisError);
          
          // Clean up only the temporary uploaded file
          fs.unlinkSync(filePath);
          
          return res.status(500).json({
            success: false,
            error: "Failed to analyze document. The document has been saved and can be analyzed later.",
            filename: req.file.originalname,
            saved: true,
            path: savedFilePath
          });
        }
      }

    } catch (error: unknown) {
      console.error("Error analyzing document:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while analyzing the document";
      return res.status(500).json({ 
        success: false, 
        error: errorMessage
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
      
    } catch (error: unknown) {
      console.error("Error analyzing text:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while analyzing the text";
      return res.status(500).json({ 
        success: false, 
        error: errorMessage
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
      
      // Get user ID from query parameter or default to 'guest'
      const userId = req.query.userId || 'guest';
      console.log(`User ID for document storage: ${userId}`);
      
      // Create user-specific directory for document storage
      const userDocumentsDir = path.join(process.cwd(), "uploads", userId.toString());
      if (!fs.existsSync(userDocumentsDir)) {
        fs.mkdirSync(userDocumentsDir, { recursive: true });
      }
      
      // Save a copy of the file to the user's directory
      const savedFilePath = path.join(userDocumentsDir, req.file.originalname);
      fs.copyFileSync(req.file.path, savedFilePath);
      
      const filePath = req.file.path;
      let fileContent = "";
      let openaiAnalysis = "";
      let claudeAnalysis = "";
      let analysisSuccess = true;

      try {
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
      } catch (analysisError) {
        console.error("Error during dual analysis:", analysisError);
        analysisSuccess = false;
        openaiAnalysis = "Analysis failed. Please try again later.";
        claudeAnalysis = "Analysis failed. Please try again later.";
      }
      
      // Clean up only the temporary uploaded file
      fs.unlinkSync(filePath);
      
      return res.json({
        success: analysisSuccess,
        openai: openaiAnalysis,
        claude: claudeAnalysis,
        filename: req.file.originalname,
        saved: true,
        path: savedFilePath
      });
      
    } catch (error: unknown) {
      console.error("Error performing dual analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while performing dual analysis";
      return res.status(500).json({ 
        success: false, 
        error: errorMessage
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

    console.log(`Analyzing document with OpenAI: ${filename || 'unnamed document'}`);
    let response: any;

    if (type === "text") {
      // For text content, use standard chat completion
      try {
        response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Analyze this legal document${filename ? ` (${filename})` : ''}: ${content}` }
          ],
          max_tokens: 2500,
        });
        
        if (response?.choices?.[0]?.message?.content) {
          return response.choices[0].message.content;
        } else {
          console.warn("Empty or invalid response from OpenAI text analysis");
          return "Unable to generate analysis. Please try using Claude instead.";
        }
      } catch (textError) {
        console.error("Error in OpenAI text analysis:", textError);
        // Try with Claude as a fallback
        console.log("Falling back to Claude for text analysis");
        try {
          const claudeResponse = await analyzeDocumentWithClaude(content, filename, "text");
          return "⚠️ OpenAI analysis failed, using Claude analysis instead:\n\n" + claudeResponse;
        } catch (claudeError) {
          console.error("Claude fallback also failed:", claudeError);
          return "Analysis failed. Please try again later or upload a different format.";
        }
      }
    } else {
      // For images (PDF, DOC, DOCX), use vision API
      try {
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
        
        if (response?.choices?.[0]?.message?.content) {
          return response.choices[0].message.content;
        } else {
          console.warn("Empty or invalid response from OpenAI vision analysis");
          return "Unable to generate analysis. Please try using Claude instead.";
        }
      } catch (visionError) {
        console.error("Error in OpenAI vision analysis:", visionError);
        // Try with Claude as a fallback
        console.log("Falling back to Claude for document analysis");
        try {
          const claudeResponse = await analyzeDocumentWithClaude(content, filename, "image");
          return "⚠️ OpenAI analysis failed, using Claude analysis instead:\n\n" + claudeResponse;
        } catch (claudeError) {
          console.error("Claude fallback also failed:", claudeError);
          return "Analysis failed. Please try again later or upload a different format.";
        }
      }
    }
  } catch (error: unknown) {
    console.error("Error in OpenAI document analysis:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      
      // Check if it's an API error with response data
      const apiError = error as any;
      if (apiError.response) {
        console.error("API response status:", apiError.response.status);
        console.error("API response data:", apiError.response.data);
      }
    }
    
    return "Failed to analyze document. Please try again with a different model or format.";
  }
}

// Helper function to analyze documents using Claude
async function analyzeDocumentWithClaude(
  content: string, 
  filename: string | null, 
  type: "text" | "image"
): Promise<string> {
  try {
    // Validate API key before making the request
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing Anthropic API key. Please set the ANTHROPIC_API_KEY environment variable.");
    }
    
    // Validate input data
    if (!content || content.trim() === '') {
      throw new Error("No content provided for analysis. Please provide valid document content.");
    }
    
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

    console.log(`Analyzing document with Claude: ${filename || 'unnamed document'}`);

    if (type === "text") {
      // For text content, use standard chat completion
      try {
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
        
        if (response.content && response.content.length > 0) {
          const contentBlock = response.content[0];
          if (typeof contentBlock === 'object' && contentBlock !== null && 'text' in contentBlock) {
            return contentBlock.text;
          }
        }
        
        throw new Error("Invalid response format from Claude API");
      } catch (textError) {
        console.error("Error in Claude text analysis:", textError);
        
        // Check if it's an API key related error
        if (textError instanceof Error && 
            (textError.message.includes("API key") || 
             textError.message.includes("authentication") || 
             textError.message.includes("unauthorized"))) {
          throw new Error("Claude API authentication failed. Please check your API key configuration.");
        }
        
        throw new Error(`Claude text analysis failed: ${textError instanceof Error ? textError.message : "Unknown error"}`);
      }
    } else {
      // For images (PDF, DOC, DOCX), use vision capabilities
      try {
        // Validate image data
        if (type === "image" && (!content || content.length < 100)) {
          throw new Error("Invalid image data provided. The image may be corrupted or empty.");
        }
        
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
        
        if (response.content && response.content.length > 0) {
          const contentBlock = response.content[0];
          if (typeof contentBlock === 'object' && contentBlock !== null && 'text' in contentBlock) {
            return contentBlock.text;
          }
        }
        
        throw new Error("Invalid response format from Claude API");
      } catch (visionError) {
        console.error("Error in Claude vision analysis:", visionError);
        
        // Check if it's an API key related error
        if (visionError instanceof Error && 
            (visionError.message.includes("API key") || 
             visionError.message.includes("authentication") || 
             visionError.message.includes("unauthorized"))) {
          throw new Error("Claude API authentication failed. Please check your API key configuration.");
        }
        
        // Check for image-specific errors
        if (visionError instanceof Error && 
            (visionError.message.includes("image") || 
             visionError.message.includes("base64") || 
             visionError.message.includes("media") ||
             visionError.message.includes("invalid format"))) {
          throw new Error("Claude couldn't process the image. The document may be in an unsupported format or corrupted.");
        }
        
        throw new Error(`Claude vision analysis failed: ${visionError instanceof Error ? visionError.message : "Unknown error"}`);
      }
    }
  } catch (error: unknown) {
    console.error("Error in Claude document analysis:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      
      // Pass through formatted errors from the inner try-catch blocks
      if (error.message.includes("Claude API authentication") ||
          error.message.includes("Invalid image data") ||
          error.message.includes("Missing Anthropic API key") ||
          error.message.includes("No content provided") ||
          error.message.includes("Claude couldn't process")) {
        throw error;
      }
    }
    
    // For unhandled errors
    throw new Error("Failed to analyze document with Claude. Please try again with a different model or format.");
  }
}