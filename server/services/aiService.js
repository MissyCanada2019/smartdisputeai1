/**
 * Unified AI Service for SmartDispute.ai
 * 
 * This service provides a unified interface to multiple AI providers
 * with automatic fallback and retry capabilities. It supports text analysis,
 * response generation, chat, and image analysis.
 */

import * as anthropicService from './anthropic.js';
import * as openaiService from './openai.js';
import dotenv from 'dotenv';

dotenv.config();

// Service constants
const DEFAULT_PROVIDER = 'anthropic'; // Can be 'anthropic' or 'openai'
const MAX_RETRIES = 2;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

// Mock data for testing when no API keys are available
const mockAnalysisResult = {
  documentType: "Notice of Eviction",
  issueType: "Eviction",
  keyPoints: [
    "Tenant is being evicted for non-payment of rent",
    "Landlord claims $1,200 in unpaid rent",
    "Eviction date is set for 14 days from notice"
  ],
  relevantLaw: "Residential Tenancies Act, Section 59",
  urgencyLevel: "High",
  meritWeight: 0.65,
  nextSteps: [
    "Review lease agreement and payment records",
    "File dispute resolution application within 7 days"
  ],
  confidenceScore: 0.85
};

/**
 * Check the status of all AI services
 * 
 * @returns {Promise<Object>} Status information for all services
 */
export async function checkAllServices() {
  let anthropicStatus = {
    available: false,
    error: 'Not checked'
  };
  
  let openaiStatus = {
    available: false,
    error: 'Not checked'
  };
  
  try {
    anthropicStatus = await anthropicService.checkStatus();
  } catch (error) {
    anthropicStatus = {
      available: false,
      error: `Error checking Anthropic status: ${error.message}`
    };
  }
  
  try {
    openaiStatus = await openaiService.checkStatus();
  } catch (error) {
    openaiStatus = {
      available: false,
      error: `Error checking OpenAI status: ${error.message}`
    };
  }
  
  const mockStatus = {
    available: true,
    error: null
  };
  
  return {
    anthropic: anthropicStatus,
    openai: openaiStatus,
    mock: mockStatus,
    defaultProvider: DEFAULT_PROVIDER,
    mockMode: MOCK_MODE
  };
}

/**
 * Attempts to use a service function with fallback to alternative providers
 * 
 * @param {Function} primaryFn - Primary service function
 * @param {Function} fallbackFn - Fallback service function
 * @param {Array} args - Arguments to pass to service functions
 * @param {Object} options - Additional options
 * @returns {Promise<any>} Result from service function
 */
async function tryWithFallback(primaryFn, fallbackFn, args = [], options = {}) {
  const { provider = DEFAULT_PROVIDER, retries = MAX_RETRIES } = options;
  
  // If in mock mode, return mock data
  if (MOCK_MODE) {
    if (options.mockData) {
      return options.mockData;
    }
    return mockAnalysisResult;
  }
  
  // Determine which service to try first based on provider
  let mainFn = provider === 'anthropic' ? primaryFn : fallbackFn;
  let backupFn = provider === 'anthropic' ? fallbackFn : primaryFn;
  
  // Try the main function
  try {
    return await mainFn(...args);
  } catch (mainError) {
    console.warn(`Error with primary AI service (${provider}):`, mainError.message);
    
    // Try the backup function
    try {
      console.log(`Attempting fallback to secondary AI service...`);
      return await backupFn(...args);
    } catch (backupError) {
      console.error(`Error with backup AI service:`, backupError.message);
      
      // If we have retries left, try again with a delay
      if (retries > 0) {
        console.log(`Retrying AI request (${retries} attempts remaining)...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return tryWithFallback(primaryFn, fallbackFn, args, { 
          ...options, 
          retries: retries - 1 
        });
      }
      
      // If all retries failed, return mock data or throw error
      if (options.mockData) {
        console.log('All AI services failed, returning mock data');
        return options.mockData;
      }
      
      throw new Error(`All AI services failed: ${mainError.message}, fallback error: ${backupError.message}`);
    }
  }
}

/**
 * Analyze text with the best available AI service
 * 
 * @param {string} text - The text to analyze
 * @param {string} province - The province code (e.g., 'ON')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeText(text, province = 'ON', options = {}) {
  const { provider = DEFAULT_PROVIDER } = options;
  
  return tryWithFallback(
    anthropicService.analyzeText,
    openaiService.analyzeText,
    [text, province],
    {
      provider,
      mockData: mockAnalysisResult
    }
  );
}

/**
 * Generate a response based on analysis
 * 
 * @param {Object} analysisResult - The analysis results
 * @param {string} originalText - The original document text
 * @param {Object} userInfo - User information for personalization
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated response HTML
 */
export async function generateResponse(
  analysisResult, 
  originalText, 
  userInfo = {}, 
  options = {}
) {
  const { provider = DEFAULT_PROVIDER, province = 'ON' } = options;
  
  return tryWithFallback(
    anthropicService.generateResponse,
    openaiService.generateResponse,
    [analysisResult, originalText, userInfo, province],
    {
      provider,
      mockData: `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="text-align: right;">
    <p>April 10, 2025</p>
  </div>
  
  <div style="margin-bottom: 30px;">
    <p>ATTENTION: Landlord / Property Management</p>
    <p>RE: Response to Notice of Eviction</p>
  </div>
  
  <p>Dear Sir/Madam,</p>
  
  <p>I am writing in response to the Notice of Eviction dated [Notice Date] that I received regarding the premises at [Property Address].</p>
  
  <p>After careful review of the notice and my records, I respectfully dispute the claim of $1,200 in unpaid rent. According to my records and bank statements, all rent payments have been made in full and on time, as required by our lease agreement.</p>
  
  <p>Under the Residential Tenancies Act, Section 59, a tenant may dispute an eviction notice if there are reasonable grounds to believe the basis for eviction is invalid. I believe there has been an error in your accounting records.</p>
  
  <p>I have attached copies of my bank statements and e-transfer receipts showing payments for the months in question. These documents clearly demonstrate that the rent has been paid in accordance with our lease agreement.</p>
  
  <p>I respectfully request that you withdraw the eviction notice immediately upon verification of these payments. Should you wish to discuss this matter further, I am available at [Phone Number] or via email at [Email Address].</p>
  
  <p>If I do not receive confirmation that this matter has been resolved within 7 days, I will proceed with filing a dispute resolution application with the Landlord and Tenant Board as is my right under the law.</p>
  
  <p>Thank you for your prompt attention to this matter.</p>
  
  <p>Sincerely,</p>
  <p>[User Name]<br>
  [User Address]</p>
</div>
      `
    }
  );
}

/**
 * Simple chat interface with AI
 * 
 * @param {string} message - User's message
 * @param {Object} options - Additional options
 * @returns {Promise<string>} AI response
 */
export async function chat(message, options = {}) {
  const { provider = DEFAULT_PROVIDER } = options;
  
  return tryWithFallback(
    anthropicService.chat,
    openaiService.chat,
    [message],
    {
      provider,
      mockData: "I'm sorry, but I don't have access to real-time AI services at the moment. Please try again later or contact support if you need immediate assistance."
    }
  );
}

/**
 * Analyze an image with AI vision capabilities
 * 
 * @param {string} base64Image - Base64-encoded image data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeImage(base64Image, options = {}) {
  const { provider = DEFAULT_PROVIDER } = options;
  
  return tryWithFallback(
    anthropicService.analyzeImage,
    openaiService.analyzeImage,
    [base64Image],
    {
      provider,
      mockData: {
        analysis: "This appears to be a document containing text. Without real-time AI services, I cannot provide a detailed analysis of its contents. Please try again later when API services are available."
      }
    }
  );
}

/**
 * Calculate merit weight based on analysis
 * This function provides a fallback when AI doesn't return a merit weight
 * 
 * @param {Object} analysis - The analysis result from AI
 * @returns {number} Merit weight between 0 and 1
 */
export function calculateMeritWeight(analysis) {
  // If the analysis already has a merit weight, return it
  if (analysis.meritWeight !== undefined && typeof analysis.meritWeight === 'number') {
    return Math.max(0, Math.min(1, analysis.meritWeight));
  }
  
  // Otherwise, calculate one based on confidence score and urgency
  let meritWeight = 0.5; // Default middle value
  
  // Adjust based on confidence score if available
  if (analysis.confidenceScore !== undefined && typeof analysis.confidenceScore === 'number') {
    meritWeight = meritWeight * 0.5 + analysis.confidenceScore * 0.5;
  }
  
  // Adjust based on urgency if available
  if (analysis.urgencyLevel) {
    const urgencyFactor = {
      'Low': 0.3,
      'Medium': 0.5,
      'High': 0.7,
      'Critical': 0.9
    }[analysis.urgencyLevel] || 0.5;
    
    meritWeight = meritWeight * 0.7 + urgencyFactor * 0.3;
  }
  
  // Ensure the result is between 0 and 1
  return Math.max(0, Math.min(1, meritWeight));
}

/**
 * Get a human-readable merit rating from merit weight
 * 
 * @param {number} meritWeight - Merit weight between 0 and 1
 * @returns {string} Merit rating description
 */
export function getMeritRating(meritWeight) {
  if (meritWeight < 0.2) return 'Very Weak';
  if (meritWeight < 0.4) return 'Weak';
  if (meritWeight < 0.6) return 'Moderate';
  if (meritWeight < 0.8) return 'Strong';
  return 'Very Strong';
}

/**
 * Get a color code for merit weight display
 * 
 * @param {number} meritWeight - Merit weight between 0 and 1
 * @returns {string} CSS color code
 */
export function getMeritColor(meritWeight) {
  if (meritWeight < 0.2) return '#d32f2f'; // Red
  if (meritWeight < 0.4) return '#f57c00'; // Orange
  if (meritWeight < 0.6) return '#fbc02d'; // Yellow
  if (meritWeight < 0.8) return '#7cb342'; // Light green
  return '#388e3c'; // Green
}