import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. do not change this unless explicitly requested by the user
const MODEL = 'claude-3-7-sonnet-20250219';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  } catch (error) {
    console.error('Error analyzing document with Claude:', error);
    throw new Error(`Claude analysis failed: ${error.message || 'Unknown error'}`);
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
    
    // Format media type based on image encoding
    const mediaType = base64Image.startsWith('data:image/png') 
      ? 'image/png' 
      : base64Image.startsWith('data:image/jpeg') || base64Image.startsWith('data:image/jpg')
      ? 'image/jpeg'
      : 'image/jpeg'; // Default to JPEG if unknown
    
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
  } catch (error) {
    console.error('Error analyzing document image with Claude:', error);
    throw new Error(`Claude image analysis failed: ${error.message || 'Unknown error'}`);
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
  } catch (error) {
    console.error('Error generating legal analysis with Claude:', error);
    throw new Error(`Claude legal analysis failed: ${error.message || 'Unknown error'}`);
  }
}

export default {
  analyzeDocumentWithClaude,
  analyzeImageWithClaude,
  generateLegalAnalysisWithClaude
};