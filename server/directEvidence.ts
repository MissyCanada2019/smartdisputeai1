import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { IStorage } from './storage';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a local variable to store court rules analysis
let lastCourtRulesAnalysis: any[] = [];

// Initialize router
const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up upload directory
const uploadsDir = path.join(__dirname, "../uploads");
// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
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

// Configure multer upload middleware
const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check accepted file types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

// Schema for analyzing evidence
const analyzeEvidenceSchema = z.object({
  evidenceIds: z.array(z.number()),
  description: z.string().optional(),
  useCanLII: z.boolean().optional().default(false)
});

export default function registerDirectEvidenceRoutes(storage: IStorage): Router {
  // Upload evidence files without requiring authentication
  router.post("/upload", upload.array("evidence", 10), async (req: Request, res: Response) => {
    try {
      console.log("POST /direct-evidence/upload - Request received");
      console.log("Files received:", req.files ? (req.files as Express.Multer.File[]).length : 0);
      console.log("Request body keys:", Object.keys(req.body || {}));
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          message: "No files uploaded",
          details: "Please upload at least one evidence file"
        });
      }
      
      const files = req.files as Express.Multer.File[];
      console.log("Processing upload for", files.length, "files");
      
      // Extract metadata
      const { description } = req.body;
      
      // Generate a session ID for these uploads (since we don't have a user ID)
      const sessionId = Date.now().toString();
      console.log("Generated session ID:", sessionId);
      
      // Process and store each file
      const uploadedFiles = [];
      
      for (const file of files) {
        console.log("Processing file:", {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        });
        
        try {
          // Create a temporary evidence record
          const evidenceFileData = {
            // We'll use a pseudo-user approach (temporary user with special ID)
            userId: 1, // Special user ID for anonymous uploads (will use admin user or create one if needed)
            fileName: file.filename,
            originalName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
            description: description || null,
            tags: ["direct-upload", sessionId]
          };
          
          console.log("Saving file to database:", {
            fileName: evidenceFileData.fileName,
            description: evidenceFileData.description
          });
          
          // Store the file in the evidence file table
          const newFile = await storage.createEvidenceFile(evidenceFileData);
          
          console.log("File saved successfully:", newFile.id);
          uploadedFiles.push(newFile);
        } catch (fileError: any) {
          console.error("Error storing file:", file.originalname, fileError);
          // Continue with other files instead of failing completely
        }
      }
      
      // Handle case where no files were successfully processed
      if (uploadedFiles.length === 0) {
        return res.status(500).json({
          message: "Failed to process any of the uploaded files",
          details: "Please try again or contact support"
        });
      }
      
      // Return successful response
      res.status(201).json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
        sessionId: sessionId,
        count: uploadedFiles.length
      });
      
    } catch (error: any) {
      console.error("Error in direct evidence upload:", error);
      res.status(500).json({
        message: `Error uploading files: ${error.message}`,
        details: error.stack
      });
    }
  });
  
  // Analyze evidence files and search CanLII for similar cases
  router.post("/analyze", async (req: Request, res: Response) => {
    try {
      console.log("POST /direct-evidence/analyze - Request received");
      console.log("Request body:", req.body);
      
      // Validate request
      const validationResult = analyzeEvidenceSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid analysis request data",
          errors: validationResult.error.format()
        });
      }
      
      const { evidenceIds, description, useCanLII } = validationResult.data;
      
      // Load all the evidence files
      const evidenceFiles = [];
      for (const evidenceId of evidenceIds) {
        const evidence = await storage.getEvidenceFile(evidenceId);
        if (evidence) {
          evidenceFiles.push(evidence);
        }
      }
      
      if (evidenceFiles.length === 0 && !description) {
        return res.status(400).json({
          message: "No valid evidence provided",
          details: "Please provide either valid evidence files or a case description"
        });
      }
      
      console.log(`Found ${evidenceFiles.length} evidence files for analysis`);
      
      // Analyze the evidence content
      const evidenceContent = evidenceFiles.map(file => {
        return `File: ${file.originalName} (${file.fileType})\nContent: ${file.analyzedContent || "No content analysis available"}`;
      }).join("\n\n");
      
      const fullCaseContext = `
        Case Description: ${description || "No description provided"}
        
        Evidence Files:
        ${evidenceContent || "No evidence files"}
      `;
      
      console.log("Analyzing case with context length:", fullCaseContext.length);
      
      // First, analyze the evidence to determine the legal issues
      let legalIssueAnalysis;
      try {
        const legalIssueResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: "You are a legal assistant specializing in Canadian law. Analyze the provided evidence and case details to identify the specific legal issues and the relevant jurisdiction."
            },
            { role: "user", content: fullCaseContext }
          ],
          temperature: 0.3,
          max_tokens: 500,
        });
        
        legalIssueAnalysis = legalIssueResponse.choices[0].message.content;
        console.log("Completed legal issue analysis");
      } catch (aiError) {
        console.error("Error analyzing legal issues:", aiError);
        legalIssueAnalysis = "Unable to determine specific legal issues due to an error.";
      }
      
      // Formulate search queries for CanLII based on the legal issue analysis
      let relevantCases = [];
      if (useCanLII) {
        try {
          console.log("Generating CanLII search queries");
          const searchQueryResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { 
                role: "system", 
                content: "Based on the legal analysis, create 2-3 specific search queries that would be effective for searching CanLII (Canadian Legal Information Institute) for relevant case law. Format your response as JSON array of strings."
              },
              { role: "user", content: legalIssueAnalysis || "Analyze Canadian legal issues" }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
            max_tokens: 300,
          });
          
          const searchQueryResult = JSON.parse(searchQueryResponse.choices[0].message.content || "{}");
          const searchQueries = searchQueryResult.queries || [];
          
          console.log("Generated search queries for CanLII:", searchQueries);
          
          // Use the search terms to find relevant cases
          // Note: In a real implementation, this would connect to CanLII's API
          // Since we don't have actual CanLII API access, we'll simulate the results
          // In production, replace this with actual CanLII API calls
          
          // Simulate CanLII search results
          relevantCases = await simulateCanLIISearch(searchQueries, legalIssueAnalysis || "Canadian legal case analysis");
          console.log(`Found ${relevantCases.length} relevant cases from CanLII`);
        } catch (canLIIError) {
          console.error("Error with CanLII search:", canLIIError);
          // Continue without CanLII results
        }
      }
      
      // Generate the final case analysis with recommendations
      let caseSummary;
      let meritAssessment;
      let recommendedForms = [];
      let meritScore = 50; // Default score
      
      try {
        console.log("Generating final case analysis");
        // Get document templates for recommendations
        const allTemplates = await storage.getDocumentTemplates();
        
        const caseAnalysisResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k",
          messages: [
            {
              role: "system",
              content: "You are a legal expert specializing in Canadian law. Analyze the case details, evidence, legal issues, and relevant case law to provide a comprehensive case assessment. Consider both substantive legal principles and procedural requirements from Canadian Court Rules that would impact the case."
            },
            {
              role: "user",
              content: `
                Please analyze this legal case:
                
                ${fullCaseContext}
                
                Legal Issue Analysis:
                ${legalIssueAnalysis}
                
                Relevant Case Law:
                ${relevantCases.map(c => `${c.title} (${c.citation}): ${c.summary}`).join("\n\n")}
                
                Please provide:
                1. A clear case summary (max 250 words)
                2. A merit assessment analyzing the strengths and weaknesses of the case (max 250 words)
                3. A numerical assessment of the case's merit on a scale of 1-100
                4. A list of recommended legal forms or actions in JSON format
              `
            }
          ],
          temperature: 0.5,
          max_tokens: 1500,
        });
        
        const analysisText = caseAnalysisResponse.choices[0].message.content || "";
        console.log("Received case analysis with length:", analysisText.length);
        
        // Extract the different parts of the analysis using simple string manipulation
        // First, convert to lowercase for case-insensitive search
        const lowerText = analysisText.toLowerCase();
        
        // Find case summary
        const caseSummaryIndex = lowerText.indexOf("case summary");
        const meritAssessmentIndex = lowerText.indexOf("merit assessment");
        
        if (caseSummaryIndex >= 0 && meritAssessmentIndex > caseSummaryIndex) {
          caseSummary = analysisText.substring(
            caseSummaryIndex + "case summary".length, 
            meritAssessmentIndex
          ).replace(/^[:\s]+/, '').trim();
        } else {
          caseSummary = "Case analysis based on provided evidence.";
        }
        
        // Find merit assessment
        const numericalIndex = lowerText.indexOf("numerical assessment");
        const recommendedIndex = lowerText.indexOf("recommended");
        
        let meritEndIndex = analysisText.length;
        if (numericalIndex > meritAssessmentIndex) {
          meritEndIndex = numericalIndex;
        } else if (recommendedIndex > meritAssessmentIndex) {
          meritEndIndex = recommendedIndex;
        }
        
        if (meritAssessmentIndex >= 0) {
          meritAssessment = analysisText.substring(
            meritAssessmentIndex + "merit assessment".length,
            meritEndIndex
          ).replace(/^[:\s]+/, '').trim();
        } else {
          meritAssessment = "Unable to assess case merit with the provided information.";
        }
        
        // Find merit score
        let meritScore = 50; // Default score
        if (numericalIndex >= 0) {
          const scoreText = analysisText.substring(numericalIndex + "numerical assessment".length).trim();
          const scoreMatch = scoreText.match(/\d+/);
          if (scoreMatch) {
            meritScore = parseInt(scoreMatch[0]);
          }
        }
        
        // Extract recommended forms from JSON block or text
        let jsonText = "";
        const jsonStartIndex = analysisText.indexOf("```json");
        if (jsonStartIndex >= 0) {
          const jsonEndIndex = analysisText.indexOf("```", jsonStartIndex + 6);
          if (jsonEndIndex > jsonStartIndex) {
            jsonText = analysisText.substring(jsonStartIndex + 6, jsonEndIndex).trim();
          }
        } else {
          // Try to find a JSON object in the text
          const openBraceIndex = analysisText.indexOf("{");
          if (openBraceIndex >= 0) {
            // Find matching closing brace (simple approach)
            let depth = 0;
            let closeBraceIndex = -1;
            
            for (let i = openBraceIndex; i < analysisText.length; i++) {
              if (analysisText[i] === '{') depth++;
              if (analysisText[i] === '}') depth--;
              
              if (depth === 0) {
                closeBraceIndex = i;
                break;
              }
            }
            
            if (closeBraceIndex > openBraceIndex) {
              jsonText = analysisText.substring(openBraceIndex, closeBraceIndex + 1);
            }
          }
        }
        
        // Try to parse JSON and extract recommended forms
        if (jsonText) {
          try {
            const cleanedJsonText = jsonText.replace(/```json|```/g, '').trim();
            const recommendedFormsData = JSON.parse(cleanedJsonText);
            recommendedForms = Array.isArray(recommendedFormsData) 
              ? recommendedFormsData 
              : recommendedFormsData.recommendedForms || [];
          } catch (jsonError) {
            console.error("Error parsing recommended forms JSON:", jsonError);
            // Find template recommendations in the text as fallback
            recommendedForms = allTemplates
              .filter(t => analysisText.toLowerCase().includes(t.name.toLowerCase()))
              .slice(0, 3)
              .map(t => t.id);
          }
        } else {
          // Find template recommendations in the text as fallback
          recommendedForms = allTemplates
            .filter(t => analysisText.toLowerCase().includes(t.name.toLowerCase()))
            .slice(0, 3)
            .map(t => t.id);
        }
        
        console.log("Extracted case summary and recommendations");
      } catch (analysisError) {
        console.error("Error generating final case analysis:", analysisError);
        caseSummary = "Unable to generate a complete case analysis due to an error.";
        meritAssessment = "Unable to assess the merit of this case.";
        recommendedForms = [];
      }
      
      // Prepare procedural assessment from court rules if available
      let proceduralAssessment = "";
      if (lastCourtRulesAnalysis && lastCourtRulesAnalysis.length > 0) {
        proceduralAssessment = "Based on Canadian Court Rules, the following procedural considerations apply:\n\n" + 
          lastCourtRulesAnalysis.map(rule => 
            `- ${rule.rule_name} (${rule.jurisdiction}): ${rule.description}`
          ).join("\n\n");
      }
      
      // Create a case analysis record
      const caseAnalysisData = {
        userId: 1, // Special user ID for anonymous analyses (admin user)
        evidenceIds: evidenceIds,
        caseSummary: caseSummary || "No case summary available.",
        recommendedForms: recommendedForms,
        isPremiumAssessment: false,
        meritScore: meritScore,
        meritWeight: 0,
        meritAssessment: meritAssessment || "No detailed merit assessment available.",
        predictedOutcome: "",
        meritFactors: { relevantCases },
        procedural_assessment: proceduralAssessment // Added for court rules integration
      };
      
      const newCaseAnalysis = await storage.createCaseAnalysis(caseAnalysisData);
      
      // Return the analysis results
      return res.status(200).json({
        message: "Case analysis complete",
        analysis: newCaseAnalysis,
        relevantCases: relevantCases,
        recommendations: {
          recommendedForms: recommendedForms,
          caseSummary: caseSummary,
          meritAssessment: meritAssessment,
          meritScore: meritScore,
          procedural_assessment: proceduralAssessment // Added for court rules integration
        }
      });
      
    } catch (error: any) {
      console.error("Error in direct evidence analysis:", error);
      res.status(500).json({
        message: `Error analyzing evidence: ${error.message}`,
        details: error.stack
      });
    }
  });
  
  return router;
}

/**
 * Simulate CanLII search results since we don't have direct API access
 * In a production environment, replace this with actual API calls to CanLII
 */
async function simulateCanLIISearch(searchQueries: string[], legalContext: string): Promise<any[]> {
  try {
    // In a real implementation, we'd make API calls to CanLII
    // For now, we'll generate simulated results based on the queries and context
    const simulatedResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert on Canadian legal cases and court rules. 
          
          Generate 3-5 relevant case law examples from CanLII that would be relevant to the legal issues described. 
          
          Format your response as a JSON object with:
          1. "cases": an array with each case having these fields: "title" (case name), "citation" (proper legal citation), "year", "court" (e.g., "Ontario Superior Court", "BC Court of Appeal"), "url" (simulated CanLII URL), "relevance" (score from 1-10), and "key_points" (array of 2-3 bullet points about the case's significance).
          2. "court_rules": an array of applicable court rules with: "rule_name", "jurisdiction", "description", and "relevance" (score from 1-10).`
        },
        {
          role: "user",
          content: `
            Legal Context: ${legalContext}
            
            Search Queries:
            ${searchQueries.join('\n')}
            
            Please provide relevant Canadian legal cases from CanLII and applicable court rules for these issues.
          `
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });
    
    const responseText = simulatedResponse.choices[0].message.content || "{}";
    const parsedResponse = JSON.parse(responseText);
    
    // Add court rules to the analysis for processing in the case analysis section
    if (parsedResponse.court_rules && Array.isArray(parsedResponse.court_rules)) {
      // We'll store this for later use in the case analysis
      lastCourtRulesAnalysis = parsedResponse.court_rules;
    }
    
    return parsedResponse.cases || [];
  } catch (error) {
    console.error("Error simulating CanLII search:", error);
    return [];
  }
}