/**
 * Anthropic Claude Service for SmartDispute.ai
 * 
 * This module provides integration with the Anthropic Claude API for
 * AI-powered text analysis, response generation, and chat functionality.
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ANTHROPIC_API_KEY;
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';
const MAX_TOKENS = 4000;

// Create the Anthropic client if API key is available
let client = null;
if (API_KEY) {
  client = new Anthropic({
    apiKey: API_KEY,
  });
}

/**
 * Check if the Anthropic service is available
 * 
 * @returns {Promise<Object>} Status information
 */
export async function checkStatus() {
  if (!API_KEY) {
    return {
      available: false,
      error: 'API key not configured'
    };
  }
  
  if (!client) {
    return {
      available: false,
      error: 'Client initialization failed'
    };
  }
  
  try {
    // Simple test call to check if API is working
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Echo the word "available" if you can receive this message.'
        }
      ]
    });
    
    const isAvailable = response.content[0].text.toLowerCase().includes('available');
    
    return {
      available: isAvailable,
      error: isAvailable ? null : 'API response did not include expected confirmation'
    };
  } catch (error) {
    return {
      available: false,
      error: `API error: ${error.message}`
    };
  }
}

/**
 * Analyze text with Claude
 * 
 * @param {string} text - The text to analyze
 * @param {string} province - The province code (e.g., 'ON')
 * @param {string} model - Model to use
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeText(text, province = 'ON', model = DEFAULT_MODEL) {
  if (!client) {
    throw new Error('Anthropic client not initialized');
  }
  
  const systemPrompt = `You are an expert legal analyst specializing in Canadian law with focus on ${getProvinceName(province)}.
You are analyzing a document to classify the legal issue, assess its significance, and recommend appropriate responses.
`;

  const userPrompt = `Please analyze the following document text and provide a structured analysis with the following information:
1. Document Type: Identify what kind of document this is (letter, notice, court filing, etc.)
2. Issue Type: Classify the main legal issue (eviction, child services, discrimination, etc.)
3. Key Points: Extract 3-5 main claims or statements
4. Relevant Law: Identify applicable laws or regulations in ${getProvinceName(province)}
5. Urgency Level: Rate as Low, Medium, or High with justification
6. Next Steps: Recommend 2-3 concrete actions
7. Confidence Score: Rate your confidence in this analysis from 0.0 to 1.0

Format the response as a JSON object with these keys. Include a "meritWeight" field from 0 to 1 indicating the legal merit of any claims or defenses.

Document to analyze:
${text}`;

  const response = await client.messages.create({
    model: model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });
  
  try {
    // Try to parse the response as JSON
    return JSON.parse(response.content[0].text);
  } catch (error) {
    // If parsing fails, return the raw text
    return {
      rawAnalysis: response.content[0].text,
      error: 'Failed to parse JSON response'
    };
  }
}

/**
 * Generate a response based on analysis
 * 
 * @param {Object} analysisResult - The analysis results
 * @param {string} originalText - The original document text
 * @param {Object} userInfo - User information
 * @param {string} province - The province code (e.g., 'ON')
 * @param {string} model - Model to use
 * @returns {Promise<string>} Generated response HTML
 */
export async function generateResponse(
  analysisResult, 
  originalText, 
  userInfo = {}, 
  province = 'ON',
  model = DEFAULT_MODEL
) {
  if (!client) {
    throw new Error('Anthropic client not initialized');
  }
  
  const userName = userInfo.name || 'the user';
  const userAddress = userInfo.address || '[User Address]';
  
  const systemPrompt = `You are an expert legal assistant specializing in Canadian law for ${getProvinceName(province)}.
Your job is to craft professional response letters based on document analysis.
The response should be formal, cite relevant laws, and clearly address the issues identified.`;

  const userPrompt = `Based on the analysis and original document below, generate a professional response letter in HTML format.
The letter should:
1. Use proper business letter formatting with today's date
2. Address the recipient appropriately
3. Reference any case numbers or identifiers from the original
4. Respond to key points with clear arguments
5. Cite relevant laws or regulations
6. Include a specific request or next steps
7. Close professionally

User Information:
Name: ${userName}
Address: ${userAddress}
${userInfo.email ? `Email: ${userInfo.email}` : ''}
${userInfo.phone ? `Phone: ${userInfo.phone}` : ''}

Original Document:
${originalText}

Analysis:
${JSON.stringify(analysisResult, null, 2)}

Format the response as HTML with appropriate tags for a well-structured document.`;

  const response = await client.messages.create({
    model: model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });
  
  return response.content[0].text;
}

/**
 * Simple chat interface
 * 
 * @param {string} message - User's message
 * @param {string} model - Model to use
 * @returns {Promise<string>} AI response
 */
export async function chat(message, model = DEFAULT_MODEL) {
  if (!client) {
    throw new Error('Anthropic client not initialized');
  }
  
  const systemPrompt = `You are a helpful legal assistant providing information about Canadian law and helping users with legal questions.
Provide accurate, helpful answers but clearly state when legal advice should be sought from a qualified attorney.`;

  const response = await client.messages.create({
    model: model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      { role: 'user', content: message }
    ]
  });
  
  return response.content[0].text;
}

/**
 * Analyze an image with Claude Vision
 * 
 * @param {string} base64Image - Base64-encoded image data
 * @param {string} model - Model to use
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeImage(base64Image, model = DEFAULT_MODEL) {
  if (!client) {
    throw new Error('Anthropic client not initialized');
  }
  
  const systemPrompt = `You are an expert document and image analyst.
Extract all relevant information from the provided image, including text content, document type, and any notable elements.
If the image contains a legal document, identify key information like dates, names, case numbers, and main topics.`;

  const response = await client.messages.create({
    model: model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this image in detail, extracting all text and describing any notable elements.'
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    ]
  });
  
  return {
    analysis: response.content[0].text
  };
}

/**
 * Helper function to get full province name from code
 * 
 * @param {string} provinceCode - Two-letter province code
 * @returns {string} Full province name
 */
function getProvinceName(provinceCode) {
  const provinces = {
    'AB': 'Alberta',
    'BC': 'British Columbia',
    'MB': 'Manitoba',
    'NB': 'New Brunswick',
    'NL': 'Newfoundland and Labrador',
    'NS': 'Nova Scotia',
    'NT': 'Northwest Territories',
    'NU': 'Nunavut',
    'ON': 'Ontario',
    'PE': 'Prince Edward Island',
    'QC': 'Quebec',
    'SK': 'Saskatchewan',
    'YT': 'Yukon'
  };
  
  return provinces[provinceCode] || provinceCode;
}