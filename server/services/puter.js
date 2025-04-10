/**
 * Puter-based Alternative AI Service (EndlessClaude) for SmartDispute.ai
 * 
 * This module provides a fallback AI service when direct Anthropic API
 * integration is unavailable or fails.
 */

import fetch from 'node-fetch';
import 'dotenv/config';

// Configuration
const config = {
  apiUrl: 'https://api.puter.com/v2/ai/completions',
  fallbackModel: 'EndlessClaude-3.5',
  maxTokens: 2000,
  temperature: 0.7,
  retries: 3,
  timeoutMs: 30000
};

// Helper to retry failed API calls
async function withRetry(fn, retries = config.retries) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Attempt ${i + 1}/${retries} failed:`, error.message);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError;
}

/**
 * Test connection to Puter API
 */
export async function testConnection() {
  try {
    const apiKey = process.env.PUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('PUTER_API_KEY environment variable not set');
    }
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.fallbackModel,
        prompt: 'Hello, are you operational?',
        max_tokens: 10,
        temperature: 0.5
      }),
      timeout: config.timeoutMs
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data && data.choices && data.choices.length > 0;
  } catch (error) {
    console.error('Puter API test failed:', error.message);
    throw error;
  }
}

/**
 * Analyze text using the fallback service
 * 
 * @param {string} text - The text to analyze
 * @param {string} province - The province code (e.g., 'ON' for Ontario)
 * @returns {object} Analysis results
 */
export async function analyzeText(text, province = 'ON') {
  return await withRetry(async () => {
    const apiKey = process.env.PUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('PUTER_API_KEY environment variable not set');
    }
    
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
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.fallbackModel,
        prompt,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      }),
      timeout: config.timeoutMs
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    const generatedText = data.choices[0].text;
    
    // Parse the JSON from the response
    const jsonMatch = generatedText.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.error('Error parsing JSON from response:', parseError.message);
        return {
          error: 'Failed to parse analysis results',
          rawResponse: generatedText
        };
      }
    } else {
      return {
        error: 'No valid JSON found in response',
        rawResponse: generatedText
      };
    }
  });
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
  return await withRetry(async () => {
    const apiKey = process.env.PUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('PUTER_API_KEY environment variable not set');
    }
    
    const userName = userInfo.name || 'Client';
    const userAddress = userInfo.address || '[CLIENT ADDRESS]';
    
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
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.fallbackModel,
        prompt,
        max_tokens: config.maxTokens * 2,
        temperature: config.temperature
      }),
      timeout: config.timeoutMs * 2
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    const generatedText = data.choices[0].text;
    
    // Extract HTML content from response
    const htmlMatch = generatedText.match(/<html[\s\S]*<\/html>/i) || 
                      generatedText.match(/<body[\s\S]*<\/body>/i) ||
                      generatedText.match(/<div[\s\S]*<\/div>/i);
                      
    if (htmlMatch && htmlMatch[0]) {
      return htmlMatch[0];
    } else {
      // If no HTML tags found, wrap the response in basic HTML
      return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                ${generatedText.replace(/\n/g, '<br>')}
              </div>`;
    }
  });
}

/**
 * Simple chat interface
 * 
 * @param {string} message - User message
 * @returns {string} AI response
 */
export async function chat(message) {
  return await withRetry(async () => {
    const apiKey = process.env.PUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('PUTER_API_KEY environment variable not set');
    }
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.fallbackModel,
        prompt: message,
        max_tokens: 500,
        temperature: config.temperature
      }),
      timeout: config.timeoutMs
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].text;
  });
}

export default {
  testConnection,
  analyzeText,
  generateResponse,
  chat
};