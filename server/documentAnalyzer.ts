import express, { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { IStorage } from "./storage";
import OpenAI from "openai";

// Configure OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user

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
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

  // Route to analyze uploaded document
  router.post('/analyze', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      const filePath = req.file.path;
      let fileContent = "";

      // Extract text from document based on file type
      if (req.file.mimetype === "text/plain") {
        // For text files, just read the content
        fileContent = fs.readFileSync(filePath, "utf8");
      } else if (req.file.mimetype === "application/pdf") {
        // For PDF files, we'll extract text via OpenAI Vision
        const base64Data = fs.readFileSync(filePath).toString("base64");
        const analysis = await analyzeDocumentWithAI(base64Data, req.file.originalname, "image");
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        return res.json({
          success: true,
          analysis,
          filename: req.file.originalname
        });
      } else {
        // For DOC/DOCX files, we'll extract text using OpenAI Vision as well
        const base64Data = fs.readFileSync(filePath).toString("base64");
        const analysis = await analyzeDocumentWithAI(base64Data, req.file.originalname, "image");
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        return res.json({
          success: true,
          analysis,
          filename: req.file.originalname
        });
      }

      // If we have text content (for TXT files)
      if (fileContent) {
        const analysis = await analyzeDocumentWithAI(fileContent, req.file.originalname, "text");
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        return res.json({
          success: true,
          analysis,
          filename: req.file.originalname
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

      const analysis = await analyzeDocumentWithAI(text, null, "text");
      
      return res.json({
        success: true,
        analysis
      });
      
    } catch (error: any) {
      console.error("Error analyzing text:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "An error occurred while analyzing the text" 
      });
    }
  });

  return router;
}

// Helper function to analyze documents using AI
async function analyzeDocumentWithAI(
  content: string, 
  filename: string | null, 
  type: "text" | "image"
): Promise<string> {
  try {
    // Common prompt instructions
    const systemPrompt = `
You are a legal document analyzer specialized in evaluating documents for complexity, readability, and identifying potential issues. 
Analyze the provided content in depth and provide a comprehensive assessment that includes:

1. A complexity score on a scale of 1-10, where 10 is extremely complex
2. An assessment of readability (easy, moderate, difficult)
3. Identification of any concerning legal jargon that might confuse non-lawyers
4. A plain-language explanation of any complex terms or concepts
5. Any red flags or concerning clauses that could disadvantage the reader
6. A summary of the document's primary purpose and obligations

Format your response to start with the complexity score and readability assessment, followed by your detailed analysis.`;

    let response: any;

    if (type === "text") {
      // For text content, use standard chat completion
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this legal document${filename ? ` (${filename})` : ''}: ${content}` }
        ],
        max_tokens: 1500,
      });
      
      return response.choices[0].message.content;
    } else {
      // For images (PDF, DOC, DOCX), use vision API
      response = await openai.chat.completions.create({
        model: "gpt-4o",
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
        max_tokens: 1500,
      });
      
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error("Error in AI document analysis:", error);
    throw new Error("Failed to analyze document with AI");
  }
}