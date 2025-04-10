/**
 * Anthropic Claude API Service for SmartDispute.ai
 * 
 * This module provides direct API integration with Anthropic Claude for document
 * analysis and response generation.
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

// Initialize Anthropic client
let anthropic = null;
try {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize Anthropic client:', error.message);
}

// Configuration
const config = {
  model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  maxTokens: 2000,
  temperature: 0.7,
  retries: 2
};

/**
 * Test connection to Anthropic API
 */
export async function testConnection() {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }
  
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }
  
  try {
    // Simple test message to check if the API is working
    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: 10,
      messages: [
        { role: "user", content: "Hello, are you operational?" }
      ],
    });
    
    return response.content[0].text.includes("operational") || 
           response.content[0].text.includes("working") || 
           response.content[0].text.includes("available");
  } catch (error) {
    console.error('Anthropic API test failed:', error.message);
    throw error;
  }
}

/**
 * Analyze text using Claude
 * 
 * @param {string} text - The text to analyze
 * @param {string} province - The province code (e.g., 'ON' for Ontario)
 * @returns {object} Analysis results
 */
export async function analyzeText(text, province = 'ON') {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }
  
  try {
    const prompt = `
      As an AI legal assistant for SmartDispute.ai, analyze this document in detail.
      
      Document text: """
      ${text}
      """
      
      Consider that this document is from ${province} province in Canada.
      
      Provide the following information in JSON format:
      1. documentType: The type of legal document
      2. issueCategory: The main legal issue category
      3. issueSubcategory: More specific categorization of the issue
      4. parties: Identified parties involved
      5. keyDates: Any important dates mentioned
      6. legalReferences: Any laws, acts, or legal precedents mentioned
      7. responseSuggestions: Recommended response points
      8. riskAssessment: Assessment of potential risks
      9. nextSteps: Recommended actions
      10. confidenceScore: A number between 0 and 1 indicating confidence in analysis
      
      Format your response as valid JSON with no explanations outside the JSON object.
    `;
    
    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [
        { role: "user", content: prompt }
      ],
    });
    
    // Parse the JSON from the response
    const jsonMatch = response.content[0].text.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.error('Error parsing JSON from Claude response:', parseError.message);
        return {
          error: 'Failed to parse analysis results',
          rawResponse: response.content[0].text
        };
      }
    } else {
      return {
        error: 'No valid JSON found in response',
        rawResponse: response.content[0].text
      };
    }
  } catch (error) {
    console.error('Error analyzing text with Claude:', error.message);
    throw error;
  }
}

/**
 * Generate a response letter based on analysis
 * 
 * @param {object} analysisResult - The results from analyzeText
 * @param {string} originalText - The original document text
 * @param {object} userInfo - Optional user information
 * @param {string} province - The province code
 * @returns {string} HTML formatted response letter
 */
export async function generateResponse(analysisResult, originalText, userInfo = {}, province = 'ON') {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }
  
  const userName = userInfo.name || 'Client';
  const userAddress = userInfo.address || '[CLIENT ADDRESS]';
  
  try {
    const prompt = `
      As an AI legal assistant for SmartDispute.ai, generate a formal response letter based on the analysis of a document.
      
      Original document: """
      ${originalText.substring(0, 2000)}... [truncated for brevity]
      """
      
      Analysis results: """
      ${JSON.stringify(analysisResult)}
      """
      
      Generate a professional response letter addressing the issues in the document. The letter should be from ${userName} at ${userAddress} in ${province} province.
      
      The response should:
      1. Be professionally formatted with proper letter structure
      2. Address the main issues identified in the analysis
      3. Include references to relevant laws and regulations
      4. Provide clear next steps
      5. Be factual, professional, and assertive
      6. Include proper headers, date (current date), and signature
      
      Format the letter as HTML with proper styling.
    `;
    
    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens * 2,
      temperature: config.temperature,
      messages: [
        { role: "user", content: prompt }
      ],
    });
    
    // Extract HTML content from response
    const htmlMatch = response.content[0].text.match(/<html[\s\S]*<\/html>/i) || 
                      response.content[0].text.match(/<body[\s\S]*<\/body>/i) ||
                      response.content[0].text.match(/<div[\s\S]*<\/div>/i);
                      
    if (htmlMatch && htmlMatch[0]) {
      return htmlMatch[0];
    } else {
      // If no HTML tags found, wrap the response in basic HTML
      return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                ${response.content[0].text.replace(/\n/g, '<br>')}
              </div>`;
    }
  } catch (error) {
    console.error('Error generating response with Claude:', error.message);
    throw error;
  }
}

/**
 * Simple chat interface with Claude
 * 
 * @param {string} message - User message
 * @returns {string} AI response
 */
export async function chat(message) {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }
  
  try {
    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: 500,
      temperature: config.temperature,
      messages: [
        { role: "user", content: message }
      ],
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error in chat with Claude:', error.message);
    throw error;
  }
}

export default {
  testConnection,
  analyzeText,
  generateResponse,
  chat
};