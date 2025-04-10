/**
 * OpenAI API Service for SmartDispute.ai
 * 
 * This module provides direct API integration with OpenAI for document
 * analysis and response generation when needed.
 */

import OpenAI from 'openai';
import 'dotenv/config';

// Initialize OpenAI client
let openai = null;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
}

// Configuration
const config = {
  model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  maxTokens: 2000,
  temperature: 0.7,
  retries: 2
};

/**
 * Test connection to OpenAI API
 */
export async function testConnection() {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }
  
  try {
    // Simple test message to check if the API is working
    const response = await openai.chat.completions.create({
      model: config.model,
      max_tokens: 10,
      messages: [
        { role: "user", content: "Hello, are you operational?" }
      ],
    });
    
    return response.choices[0].message.content.includes("operational") || 
           response.choices[0].message.content.includes("working") || 
           response.choices[0].message.content.includes("available");
  } catch (error) {
    console.error('OpenAI API test failed:', error.message);
    throw error;
  }
}

/**
 * Analyze text using OpenAI
 * 
 * @param {string} text - The text to analyze
 * @param {string} province - The province code (e.g., 'ON' for Ontario)
 * @returns {object} Analysis results
 */
export async function analyzeText(text, province = 'ON') {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
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
    
    const response = await openai.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON from the response
    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError.message);
      return {
        error: 'Failed to parse analysis results',
        rawResponse: response.choices[0].message.content
      };
    }
  } catch (error) {
    console.error('Error analyzing text with OpenAI:', error.message);
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
  if (!openai) {
    throw new Error('OpenAI client not initialized');
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
    
    const response = await openai.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens * 2,
      temperature: config.temperature,
      messages: [
        { role: "user", content: prompt }
      ],
    });
    
    // Extract HTML content from response
    const htmlMatch = response.choices[0].message.content.match(/<html[\s\S]*<\/html>/i) || 
                      response.choices[0].message.content.match(/<body[\s\S]*<\/body>/i) ||
                      response.choices[0].message.content.match(/<div[\s\S]*<\/div>/i);
                      
    if (htmlMatch && htmlMatch[0]) {
      return htmlMatch[0];
    } else {
      // If no HTML tags found, wrap the response in basic HTML
      return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                ${response.choices[0].message.content.replace(/\n/g, '<br>')}
              </div>`;
    }
  } catch (error) {
    console.error('Error generating response with OpenAI:', error.message);
    throw error;
  }
}

/**
 * Simple chat interface with OpenAI
 * 
 * @param {string} message - User message
 * @returns {string} AI response
 */
export async function chat(message) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      max_tokens: 500,
      temperature: config.temperature,
      messages: [
        { role: "user", content: message }
      ],
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in chat with OpenAI:', error.message);
    throw error;
  }
}

/**
 * Analyze an image using OpenAI's vision capabilities
 * 
 * @param {string} base64Image - Base64-encoded image data
 * @returns {object} Analysis results
 */
export async function analyzeImage(base64Image) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this document image in detail. Extract all relevant legal information, including parties, dates, clauses, and legal language. Format your response as JSON with the following structure: { 'documentType': string, 'parties': array, 'dates': array, 'mainClauses': array, 'legalIssues': array, 'extractedText': string }"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON from the response
    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI vision response:', parseError.message);
      return {
        error: 'Failed to parse image analysis results',
        rawResponse: response.choices[0].message.content
      };
    }
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error.message);
    throw error;
  }
}

export default {
  testConnection,
  analyzeText,
  generateResponse,
  chat,
  analyzeImage
};