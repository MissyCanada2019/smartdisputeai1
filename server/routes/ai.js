/**
 * AI Service Routes for SmartDispute.ai
 * 
 * These routes handle API endpoints for the unified AI service,
 * providing access to AI-powered document analysis and response generation.
 */

import express from 'express';
import * as aiService from '../services/aiService';

const router = express.Router();

/**
 * GET /api/ai/status
 * Check the status of all AI services
 */
router.get('/status', async (req, res) => {
  try {
    const status = await aiService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error checking AI service status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/analyze
 * Analyze text using the best available AI service
 * 
 * Request Body:
 * - text: String - The text to analyze
 * - province: String (optional) - The province code (e.g., 'ON')
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text, province = 'ON' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await aiService.analyzeText(text, province);
    
    res.json({
      analysis: result.result,
      serviceName: result.serviceName,
      useModelName: result.modelName
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/generate-response
 * Generate a response based on analysis data
 * 
 * Request Body:
 * - analysisResult: Object - The analysis results
 * - originalText: String - The original document text
 * - userInfo: Object (optional) - User information for personalization
 * - province: String (optional) - The province code
 */
router.post('/generate-response', async (req, res) => {
  try {
    const { 
      analysisResult, 
      originalText, 
      userInfo = {}, 
      province = 'ON' 
    } = req.body;
    
    if (!analysisResult || !originalText) {
      return res.status(400).json({ 
        error: 'Analysis result and original text are required' 
      });
    }
    
    const result = await aiService.generateResponse(
      analysisResult, 
      originalText, 
      userInfo, 
      province
    );
    
    res.json({
      response: result.result,
      serviceName: result.serviceName,
      useModelName: result.modelName
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/chat
 * Simple chat interface with AI
 * 
 * Request Body:
 * - message: String - The user's message
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const result = await aiService.chat(message);
    
    res.json({
      response: result.result,
      serviceName: result.serviceName,
      useModelName: result.modelName
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/analyze-image
 * Analyze an image using vision capabilities
 * 
 * Request Body:
 * - base64Image: String - Base64-encoded image data
 */
router.post('/analyze-image', async (req, res) => {
  try {
    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'Base64 image data is required' });
    }
    
    const result = await aiService.analyzeImage(base64Image);
    
    res.json({
      analysis: result.result,
      serviceName: result.serviceName,
      useModelName: result.modelName
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;