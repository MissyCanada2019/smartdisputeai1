import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. do not change this unless explicitly requested by the user
const MODEL = 'claude-3-7-sonnet-20250219';

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY environment variable is not set. Claude AI services will not function.');
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder_key_for_initialization',
});

/**
 * Helper function to determine if an error is related to API credentials
 * @param error The error object to check
 * @returns True if the error is likely related to an API key issue
 */
function isApiKeyError(error: unknown): boolean {
  if (!error) return false;
  
  // Convert error to string for checking
  const errorStr = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message
      : JSON.stringify(error);
  
  // Check for common API key error patterns
  const keyErrorPatterns = [
    'api key',
    'apikey', 
    'authentication',
    'auth',
    'credential',
    'unauthorized',
    'permission denied',
    'forbidden',
    'invalid key',
    'not authorized',
    'expired key',
    '401',
    '403'
  ];
  
  return keyErrorPatterns.some(pattern => 
    errorStr.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Format API-related errors with more user-friendly messages
 * @param error The original error
 * @returns A formatted error message
 */
function formatApiError(error: unknown): string {
  // If it's an API key error, provide a specific message
  if (isApiKeyError(error)) {
    return 'Claude API authentication failed. Please check the ANTHROPIC_API_KEY environment variable.';
  }
  
  // Extract error message based on type
  const errorMsg = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message
      : 'Unknown Claude API error';
      
  // Check for rate limiting
  if (errorMsg.toLowerCase().includes('rate limit') || 
      errorMsg.toLowerCase().includes('too many requests') ||
      errorMsg.includes('429')) {
    return 'Claude API rate limit exceeded. Please try again later.';
  }
  
  // Check for server errors
  if (errorMsg.toLowerCase().includes('server error') || 
      errorMsg.includes('500') || 
      errorMsg.includes('502') || 
      errorMsg.includes('503')) {
    return 'Claude API service error. The service may be temporarily unavailable.';
  }
  
  // For other errors, return the original message
  return `Claude API error: ${errorMsg}`;
}

/**
 * Analyzes document text using Anthropic Claude
 * @param text The document text to analyze
 * @param query Specific question or analysis request for the AI
 * @returns Promise resolving to the AI's analysis response
 */
export async function analyzeDocumentWithClaude(
  text: string, 
  query: string = "Analyze this document and extract key information"
): Promise<string> {
  try {
    console.log(`Analyzing document with Claude (${text.length} characters)`);
    
    // Validate API key is available
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder_key_for_initialization') {
      throw new Error('API key not configured. Please set the ANTHROPIC_API_KEY environment variable.');
    }
    
    // Format the prompt for document analysis
    const prompt = `
I need you to analyze the following document text, focusing on the request below:

REQUEST: ${query}

DOCUMENT:
${text}

Please provide a comprehensive analysis that covers the key aspects requested.
`;

    // Send request to Anthropic API
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract and return the response
    if (!message.content || message.content.length === 0) {
      throw new Error('Empty response from Claude API');
    }
    
    // For Claude 3, content is an array of message content chunks
    // We're only expecting text content, so we extract that from each chunk
    const responseText = message.content
      .filter(chunk => chunk.type === 'text')
      .map(chunk => chunk.text)
      .join('\n');
    
    return responseText;
  } catch (error: unknown) {
    console.error('Error analyzing document with Claude:', error);
    
    // Use our error formatting helper functions
    if (isApiKeyError(error)) {
      throw new Error(formatApiError(error));
    }
    
    // For other errors, provide standard formatting
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Claude analysis failed: ${errorMessage}`);
  }
}

/**
 * Handles multi-modal document analysis with Anthropic Claude
 * @param base64Image The base64-encoded image to analyze
 * @param query Specific question or analysis request for the AI
 * @returns Promise resolving to the AI's analysis response
 */
export async function analyzeImageWithClaude(
  base64Image: string,
  query: string = "Analyze this document image and extract key information"
): Promise<string> {
  try {
    console.log('Analyzing document image with Claude');
    
    // Validate API key is available
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder_key_for_initialization') {
      throw new Error('API key not configured. Please set the ANTHROPIC_API_KEY environment variable.');
    }
    
    // Claude only supports specific media types for images
    // We need to use one of these types: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = 'image/jpeg'; // Default to JPEG
    
    // Check for data URL format or file extension hints
    if (base64Image.startsWith('data:')) {
      if (base64Image.startsWith('data:image/png')) {
        mediaType = 'image/png';
      } else if (base64Image.startsWith('data:image/gif')) {
        mediaType = 'image/gif';
      } else if (base64Image.startsWith('data:image/webp')) {
        mediaType = 'image/webp';
      }
      // If it's a PDF or other document format, we still use JPEG type but log the conversion
      else if (base64Image.startsWith('data:application/pdf') || 
               base64Image.startsWith('data:application/msword') || 
               base64Image.startsWith('data:application/vnd.openxmlformats')) {
        console.log('Document format detected, treating as image/jpeg for Claude compatibility');
      }
    } else if (query) {
      // Try to detect from filename hints in the query
      const queryLower = query.toLowerCase();
      if (queryLower.includes('.png')) {
        mediaType = 'image/png';
      } else if (queryLower.includes('.gif')) {
        mediaType = 'image/gif';
      } else if (queryLower.includes('.webp')) {
        mediaType = 'image/webp';
      }
      // For PDFs and other documents, we're still using image/jpeg
      else if (queryLower.includes('.pdf') || queryLower.includes('.doc') || queryLower.includes('.docx')) {
        console.log('Document format mentioned in query, treating as image/jpeg for Claude compatibility');
      }
    }
    
    console.log(`Using media type ${mediaType} for Claude image analysis`);
    
    // Clean the base64 string if it contains a data URL prefix
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Send multimodal request to Anthropic API
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${query}\n\nPlease provide a comprehensive analysis of this document image.`
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data
            }
          }
        ]
      }]
    });

    // Extract and return the response
    if (!message.content || message.content.length === 0) {
      throw new Error('Empty response from Claude API');
    }
    
    // Extract text content from the response
    const responseText = message.content
      .filter(chunk => chunk.type === 'text')
      .map(chunk => chunk.text)
      .join('\n');
    
    return responseText;
  } catch (error: unknown) {
    console.error('Error analyzing document image with Claude:', error);
    
    // Use our error formatting helper functions
    if (isApiKeyError(error)) {
      throw new Error(formatApiError(error));
    }
    
    // For other errors, provide standard formatting
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Claude image analysis failed: ${errorMessage}`);
  }
}

/**
 * Creates a legal analysis using Anthropic Claude
 * @param caseDetails Object containing case details and evidence
 * @returns Promise resolving to the AI's analysis
 */
export async function generateLegalAnalysisWithClaude(
  caseDetails: {
    caseType: string;
    jurisdiction: string;
    requestedAnalysis: string;
    caseBackground: string;
    evidence: string[];
  }
): Promise<string> {
  try {
    const { caseType, jurisdiction, requestedAnalysis, caseBackground, evidence } = caseDetails;
    
    console.log(`Generating legal analysis with Claude for case type: ${caseType}`);
    
    // Validate API key is available
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder_key_for_initialization') {
      throw new Error('API key not configured. Please set the ANTHROPIC_API_KEY environment variable.');
    }
    
    // Format the prompt for legal analysis
    const prompt = `
I need you to provide a professional legal analysis for the following case:

CASE TYPE: ${caseType}
JURISDICTION: ${jurisdiction}
REQUESTED ANALYSIS: ${requestedAnalysis}

CASE BACKGROUND:
${caseBackground}

EVIDENCE:
${evidence.map((item, index) => `[${index + 1}] ${item}`).join('\n')}

Please provide a comprehensive legal analysis that includes:
1. Summary of key facts
2. Potential legal issues
3. Applicable laws and precedents in ${jurisdiction}
4. Analysis of strengths and weaknesses of the case
5. Potential legal strategies or next steps
`;

    // Send request to Anthropic API
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract and return the response
    if (!message.content || message.content.length === 0) {
      throw new Error('Empty response from Claude API');
    }
    
    const responseText = message.content
      .filter(chunk => chunk.type === 'text')
      .map(chunk => chunk.text)
      .join('\n');
    
    return responseText;
  } catch (error: unknown) {
    console.error('Error generating legal analysis with Claude:', error);
    
    // Use our error formatting helper functions
    if (isApiKeyError(error)) {
      throw new Error(formatApiError(error));
    }
    
    // For other errors, provide standard formatting
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Claude legal analysis failed: ${errorMessage}`);
  }
}

export default {
  analyzeDocumentWithClaude,
  analyzeImageWithClaude,
  generateLegalAnalysisWithClaude
};