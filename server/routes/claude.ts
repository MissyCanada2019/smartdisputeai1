/**
 * Claude API endpoints for SmartDispute.ai
 * Exposes routes for Anthropic Claude AI capabilities
 */

import express, { Request, Response } from 'express';
import anthropicService from '../services/anthropic';
import alternativeAnthropicService from '../anthropicService';
import * as fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const router = express.Router();
const readFile = promisify(fs.readFile);

// Check if service configuration is available
function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Analyze text with Claude
 * POST /api/claude/analyze-text
 */
router.post('/analyze-text', async (req: Request, res: Response) => {
  try {
    if (!isClaudeConfigured()) {
      return res.status(503).json({ 
        error: "Claude AI service not available", 
        message: "The Anthropic Claude API is not configured. Please set up your ANTHROPIC_API_KEY environment variable."
      });
    }

    // Validate request body
    if (!req.body.text) {
      return res.status(400).json({ error: "Missing text content" });
    }

    const { text, context, options } = req.body;

    // Call the primary implementation first, fallback to alternative
    try {
      const analysis = await anthropicService.analyzeDocument(text, context);
      res.json({ success: true, analysis });
    } catch (error: any) {
      console.warn(`Primary Claude service failed: ${error.message}. Trying alternative implementation...`);
      
      // Fallback to alternative implementation
      const analysis = await alternativeAnthropicService.analyzeText(text);
      res.json({ 
        success: true, 
        analysis, 
        note: "Used alternative implementation due to primary service failure."
      });
    }
  } catch (error: any) {
    console.error("Claude text analysis error:", error);
    res.status(500).json({ 
      error: "Failed to analyze text", 
      message: error.message 
    });
  }
});

/**
 * Analyze image with Claude Vision
 * POST /api/claude/analyze-image
 */
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    if (!isClaudeConfigured()) {
      return res.status(503).json({ 
        error: "Claude AI service not available", 
        message: "The Anthropic Claude API is not configured. Please set up your ANTHROPIC_API_KEY environment variable."
      });
    }

    // Validate request body
    if (!req.body.image) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const { image, prompt, options } = req.body;

    // Call the primary implementation first, fallback to alternative
    try {
      const analysis = await anthropicService.analyzeImage(image, prompt);
      res.json({ success: true, analysis });
    } catch (error: any) {
      console.warn(`Primary Claude image service failed: ${error.message}. Trying alternative implementation...`);
      
      // Fallback to alternative implementation
      const analysis = await alternativeAnthropicService.analyzeImageWithClaude(image, prompt);
      res.json({ 
        success: true, 
        analysis: { extractedText: analysis, analysis },
        note: "Used alternative implementation due to primary service failure."
      });
    }
  } catch (error: any) {
    console.error("Claude image analysis error:", error);
    res.status(500).json({ 
      error: "Failed to analyze image", 
      message: error.message 
    });
  }
});

/**
 * Analyze legal situation with Claude
 * POST /api/claude/analyze-legal-situation
 */
router.post('/analyze-legal-situation', async (req: Request, res: Response) => {
  try {
    if (!isClaudeConfigured()) {
      return res.status(503).json({ 
        error: "Claude AI service not available", 
        message: "The Anthropic Claude API is not configured. Please set up your ANTHROPIC_API_KEY environment variable."
      });
    }

    // Validate request body
    if (!req.body.situation) {
      return res.status(400).json({ error: "Missing legal situation description" });
    }

    const { situation, evidence = [], jurisdiction = "Ontario", options = {} } = req.body;

    // Try primary implementation first
    try {
      const analysis = await anthropicService.analyzeLegalStrategy(situation, evidence, jurisdiction);
      res.json({ success: true, analysis });
    } catch (error: any) {
      console.warn(`Primary Claude legal service failed: ${error.message}. Trying alternative implementation...`);
      
      // Fallback to alternative implementation
      const analysis = await alternativeAnthropicService.generateLegalAnalysisWithClaude({
        caseType: options.caseType || "General Legal Issue",
        jurisdiction,
        requestedAnalysis: options.requestedAnalysis || "Analyze situation and provide recommendations",
        caseBackground: situation,
        evidence: evidence.map((ev: any) => ev.content || ev)
      });
      
      res.json({ 
        success: true, 
        analysis: {
          strategies: [],
          precedents: [],
          strength: 5,
          risks: [],
          recommendedApproach: analysis,
          fullAnalysis: analysis
        },
        note: "Used alternative implementation due to primary service failure."
      });
    }
  } catch (error: any) {
    console.error("Claude legal analysis error:", error);
    res.status(500).json({ 
      error: "Failed to analyze legal situation", 
      message: error.message 
    });
  }
});

/**
 * Generate a legal document with Claude
 * POST /api/claude/generate-document
 */
router.post('/generate-document', async (req: Request, res: Response) => {
  try {
    if (!isClaudeConfigured()) {
      return res.status(503).json({ 
        error: "Claude AI service not available", 
        message: "The Anthropic Claude API is not configured. Please set up your ANTHROPIC_API_KEY environment variable."
      });
    }

    // Validate request body
    if (!req.body.templateType || !req.body.userInputs) {
      return res.status(400).json({ error: "Missing template type or user inputs" });
    }

    const { templateType, userInputs, jurisdiction = "Ontario" } = req.body;

    // Generate document
    const document = await anthropicService.generateLegalDocument(templateType, userInputs, jurisdiction);
    res.json({ success: true, document });
  } catch (error: any) {
    console.error("Claude document generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate document", 
      message: error.message 
    });
  }
});

/**
 * Get health status for Claude service
 * GET /api/claude/health
 */
router.get('/health', async (_req: Request, res: Response) => {
  const isAvailable = isClaudeConfigured();
  
  res.json({
    service: 'Claude AI',
    available: isAvailable,
    configured: isAvailable,
    model: 'claude-3-7-sonnet-20250219', // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    message: isAvailable 
      ? 'Claude AI service is available and configured'
      : 'Claude AI service is not configured. Set ANTHROPIC_API_KEY environment variable.'
  });
});

export default router;