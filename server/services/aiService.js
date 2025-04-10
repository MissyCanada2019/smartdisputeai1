/**
 * AI Service with Fallback Mechanism for SmartDispute.ai
 * 
 * This service attempts to use the Anthropic API directly first,
 * falling back to the Puter API if the Anthropic API fails.
 * This approach ensures maximum reliability for document analysis.
 */

import Anthropic from '@anthropic-ai/sdk';
import puterService from './puter.js';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022'; // The default model to use with Anthropic

/**
 * AI Service class with fallback mechanism
 */
class AIService {
  constructor() {
    // Initialize Anthropic client if API key is available
    this.anthropicClient = ANTHROPIC_API_KEY ? 
      new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
    
    // Track which service is being used
    this.usingFallback = false;
    this.lastError = null;
  }

  /**
   * Check if the Anthropic API is available and valid
   * 
   * @returns {Promise<boolean>} Whether the API is available
   */
  async isAnthropicAvailable() {
    if (!this.anthropicClient) return false;
    
    try {
      // Make a minimal API call to test connectivity
      await this.anthropicClient.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 10,
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      });
      return true;
    } catch (error) {
      console.error('Anthropic API test failed:', error.message);
      this.lastError = error.message;
      return false;
    }
  }

  /**
   * Send a message to the AI with fallback
   * 
   * @param {string} message - The message to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The AI's response
   */
  async sendMessage(message, options = {}) {
    // Try Anthropic first if available
    if (this.anthropicClient && !this.usingFallback) {
      try {
        const response = await this.anthropicClient.messages.create({
          model: options.model || DEFAULT_MODEL,
          max_tokens: options.maxTokens || 1000,
          messages: [
            { role: 'user', content: message }
          ]
        });
        
        // Reset fallback status if successful
        this.usingFallback = false;
        return response.content[0].text;
      } catch (error) {
        console.error('Anthropic API error:', error.message);
        this.lastError = error.message;
        this.usingFallback = true;
        console.log('Switching to fallback API (Puter)...');
      }
    }
    
    // Fallback to Puter API
    return await puterService.sendMessage(message, options);
  }

  /**
   * Analyze a document with fallback support
   * 
   * @param {string} documentText - The text content of the document
   * @param {string} province - Canadian province code
   * @returns {Promise<Object>} - Structured analysis results
   */
  async analyzeDocument(documentText, province = 'ON') {
    // Create a structured prompt for document analysis
    const prompt = `
    Please analyze this legal document from ${province}, Canada and provide the following information:
    1. Document type and category
    2. Main parties involved
    3. Key issues or claims
    4. Relevant legal statutes or references specific to ${province}
    5. Deadline dates mentioned
    6. Overall assessment of the strength of the case or claim
    
    Document:
    ${documentText}
    
    Format your response as JSON with this structure:
    {
      "documentType": "",
      "documentCategory": "",
      "parties": { 
        "from": "", 
        "to": "" 
      },
      "keyIssues": [""],
      "legalReferences": [{
        "name": "",
        "relevantSections": [""]
      }],
      "importantDates": [{
        "date": "",
        "description": ""
      }],
      "assessmentScore": 0-100,
      "confidenceScore": 0-1,
      "recommendedActions": [""]
    }
    
    Return only valid JSON.
    `;
    
    try {
      if (this.anthropicClient && !this.usingFallback) {
        try {
          // Try Anthropic first with system prompt for more structured output
          const response = await this.anthropicClient.messages.create({
            model: DEFAULT_MODEL,
            system: "You are a legal analysis assistant that specializes in Canadian provincial law. Always respond with properly formatted JSON according to the requested schema.",
            max_tokens: 2000,
            messages: [
              { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" }
          });
          
          const result = JSON.parse(response.content[0].text);
          this.usingFallback = false;
          return result;
        } catch (error) {
          console.error('Anthropic document analysis failed:', error.message);
          this.lastError = error.message;
          this.usingFallback = true;
          console.log('Switching to fallback API (Puter) for document analysis...');
        }
      }
      
      // Fallback to Puter
      return await puterService.analyzeDocument(documentText, province);
    } catch (error) {
      console.error('All document analysis methods failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate a response letter with fallback support
   * 
   * @param {Object} analysis - The analysis results
   * @param {string} originalText - The original document text
   * @param {Object} userInfo - User information
   * @returns {Promise<string>} - Generated HTML response
   */
  async generateResponseLetter(analysis, originalText, userInfo = null) {
    if (this.anthropicClient && !this.usingFallback) {
      try {
        // Try using Anthropic directly first
        const userContext = userInfo ? `
        The letter should be addressed from:
        Name: ${userInfo.name || 'N/A'}
        Address: ${userInfo.address || 'N/A'}
        Email: ${userInfo.email || 'N/A'}
        Phone: ${userInfo.phone || 'N/A'}
        ` : '';
        
        const prompt = `
        Based on the analysis of this document and the original text, create a professional
        response letter that addresses the key issues and provides a strong legal position.
        
        Document Analysis:
        ${JSON.stringify(analysis, null, 2)}
        
        Original Document:
        ${originalText}
        
        ${userContext}
        
        The response should:
        1. Use formal legal language appropriate for ${analysis.documentCategory || 'this type of document'}
        2. Reference relevant laws and statutes from the analysis
        3. Clearly state the recipient's position and requested actions
        4. Include proper formatting with date, address blocks, subject line, and signature
        
        Format the response as properly formatted HTML that can be directly used in a formal letter.
        `;
        
        const response = await this.anthropicClient.messages.create({
          model: DEFAULT_MODEL,
          system: "You are a legal letter drafting assistant for SmartDispute.ai that specializes in creating formal response letters to legal documents. Your responses should be in clean, properly formatted HTML suitable for rendering in a web browser.",
          max_tokens: 4000,
          messages: [
            { role: 'user', content: prompt }
          ]
        });
        
        this.usingFallback = false;
        return response.content[0].text;
      } catch (error) {
        console.error('Anthropic response generation failed:', error.message);
        this.lastError = error.message;
        this.usingFallback = true;
        console.log('Switching to fallback API (Puter) for response generation...');
      }
    }
    
    // Fallback to Puter
    return await puterService.generateResponseLetter(analysis, originalText, userInfo);
  }

  /**
   * Get the current AI service status
   * 
   * @returns {Object} Current status information
   */
  getStatus() {
    return {
      primaryAvailable: Boolean(this.anthropicClient) && !this.usingFallback,
      usingFallback: this.usingFallback,
      lastError: this.lastError,
      defaultModel: DEFAULT_MODEL
    };
  }
}

// Create and export a singleton instance
const aiService = new AIService();
export default aiService;