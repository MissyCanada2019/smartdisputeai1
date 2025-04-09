import { Router, Request as ExpressRequest, Response } from "express";
import * as anthropicService from "../services/anthropic";

// Create a router for Claude API routes
const router = Router();

/**
 * @route POST /api/claude/analyze-text
 * @desc Analyze text content using Claude 3.7 Sonnet
 * @access Public
 */
router.post("/analyze-text", async (req: ExpressRequest, res: Response) => {
  try {
    // Validate request body
    if (!req.body.text) {
      return res.status(400).json({ 
        success: false,
        message: "Text content is required" 
      });
    }

    const { text, prompt, options } = req.body;

    // Call the Anthropic service
    const analysis = await anthropicService.analyzeText(
      text, 
      prompt || 'Analyze this text thoroughly.', 
      options
    );
    
    res.json({ 
      success: true,
      analysis 
    });
  } catch (error: any) {
    console.error("Claude text analysis error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "An error occurred during text analysis"
    });
  }
});

/**
 * @route POST /api/claude/analyze-image
 * @desc Analyze image content using Claude 3.7 Sonnet vision capabilities
 * @access Public
 */
router.post("/analyze-image", async (req: ExpressRequest, res: Response) => {
  try {
    // Validate request body
    if (!req.body.image) {
      return res.status(400).json({ 
        success: false,
        message: "Image data is required" 
      });
    }

    const { image, prompt, options } = req.body;

    // Call the Anthropic service
    const analysis = await anthropicService.analyzeImage(
      image, 
      prompt || 'Analyze and describe this image in detail.', 
      options
    );
    
    res.json({ 
      success: true,
      analysis 
    });
  } catch (error: any) {
    console.error("Claude image analysis error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "An error occurred during image analysis"
    });
  }
});

/**
 * @route POST /api/claude/analyze-legal-situation
 * @desc Analyze a legal situation using Claude 3.7 Sonnet
 * @access Public
 */
router.post("/analyze-legal-situation", async (req: ExpressRequest, res: Response) => {
  try {
    // Validate request body
    if (!req.body.situation) {
      return res.status(400).json({ 
        success: false,
        message: "Legal situation description is required" 
      });
    }

    const { situation, province, options } = req.body;

    // Call the Anthropic service
    const analysis = await anthropicService.analyzeLegalSituation(
      situation, 
      options,
      province
    );
    
    res.json({ 
      success: true,
      analysis 
    });
  } catch (error: any) {
    console.error("Claude legal situation analysis error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "An error occurred during legal situation analysis"
    });
  }
});

/**
 * @route POST /api/claude/generate-response
 * @desc Generate a response to a legal document using Claude 3.7 Sonnet
 * @access Public
 */
router.post("/generate-response", async (req: ExpressRequest, res: Response) => {
  try {
    // Validate request body
    if (!req.body.documentText) {
      return res.status(400).json({ 
        success: false,
        message: "Document text is required" 
      });
    }

    const { documentText, analysis, userInfo, options } = req.body;

    // Call the Anthropic service
    const response = await anthropicService.generateResponse(
      documentText,
      analysis,
      userInfo || {},
      options
    );
    
    res.json({ 
      success: true,
      response 
    });
  } catch (error: any) {
    console.error("Claude response generation error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "An error occurred during response generation"
    });
  }
});

/**
 * @route POST /api/claude/extract-document-info
 * @desc Extract key information from a document using Claude 3.7 Sonnet
 * @access Public
 */
router.post("/extract-document-info", async (req: ExpressRequest, res: Response) => {
  try {
    // Validate request body
    if (!req.body.documentText) {
      return res.status(400).json({ 
        success: false,
        message: "Document text is required" 
      });
    }

    const { documentText, documentType, options } = req.body;

    // Call the Anthropic service
    const info = await anthropicService.extractDocumentInfo(
      documentText,
      documentType || 'legal document',
      options
    );
    
    res.json({ 
      success: true,
      info 
    });
  } catch (error: any) {
    console.error("Claude document info extraction error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "An error occurred during document info extraction"
    });
  }
});

export default router;