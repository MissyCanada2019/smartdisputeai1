import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

/**
 * Analyzes text with Anthropic Claude
 * @param text Text to analyze
 * @param prompt Specific prompt instructions for Claude
 * @param options Additional options for the API request
 * @returns Analysis results
 */
export async function analyzeText(
  text: string, 
  prompt: string,
  options: {
    maxTokens?: number,
    temperature?: number,
    system?: string
  } = {}
): Promise<string> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text content is required for analysis');
  }

  try {
    // Ensure we have an API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }

    const { maxTokens = 2048, temperature = 0.7, system } = options;
    
    const systemPrompt = system || 
      'You are a legal analysis assistant helping analyze documents for self-represented litigants. ' +
      'Provide accurate, clear, and concise analysis. Focus on identifying key legal issues, ' +
      'relevant facts, and potential strategies. Avoid making definitive legal conclusions, ' +
      'and always note that this is not legal advice.';

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: `${prompt}\n\nHere is the document to analyze:\n\n${text}`
        }
      ],
    });

    return message.content[0].text;
  } catch (error: any) {
    // Handle API errors with descriptive messages
    if (error.status === 401) {
      throw new Error('Authentication error: Invalid Anthropic API key');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded: Too many requests to Anthropic API');
    } else if (error.status >= 500) {
      throw new Error('Anthropic service error: Try again later');
    }
    
    throw new Error(`Anthropic analysis error: ${error.message}`);
  }
}

/**
 * Analyzes an image with Anthropic Claude
 * @param base64Image Base64-encoded image data
 * @param prompt Instructions for analyzing the image
 * @param options Additional options for the API request
 * @returns Analysis results
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string = 'Analyze this document and identify all important information, focusing on legal relevance.',
  options: {
    maxTokens?: number,
    temperature?: number,
    system?: string
  } = {}
): Promise<string> {
  if (!base64Image || base64Image.trim().length === 0) {
    throw new Error('Image data is required for analysis');
  }

  try {
    // Ensure we have an API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }

    const { maxTokens = 2048, temperature = 0.7, system } = options;
    
    // Default system prompt focused on document analysis
    const systemPrompt = system || 
      'You are a legal document analysis assistant. Analyze images of documents to extract key information. ' +
      'Focus on identifying document type, key dates, parties involved, obligations, and legal implications. ' +
      'Be thorough but concise. This is not legal advice.';

    // Determine media type
    let mediaType = 'image/jpeg';
    if (base64Image.startsWith('data:image/png;base64,')) {
      mediaType = 'image/png';
      base64Image = base64Image.replace('data:image/png;base64,', '');
    } else if (base64Image.startsWith('data:image/jpeg;base64,')) {
      base64Image = base64Image.replace('data:image/jpeg;base64,', '');
    }

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image
            }
          }
        ]
      }]
    });

    return response.content[0].text;
  } catch (error: any) {
    // Handle image-specific errors
    if (error.message?.includes('image')) {
      if (error.message.includes('size')) {
        throw new Error('Image too large: Please resize the image or use a smaller file');
      } else if (error.message.includes('format') || error.message.includes('invalid')) {
        throw new Error('Invalid image format: Please use a JPG or PNG image');
      }
    }
    
    // Handle API errors with descriptive messages
    if (error.status === 401) {
      throw new Error('Authentication error: Invalid Anthropic API key');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded: Too many requests to Anthropic API');
    } else if (error.status >= 500) {
      throw new Error('Anthropic service error: Try again later');
    }
    
    throw new Error(`Anthropic image analysis error: ${error.message}`);
  }
}

/**
 * Analyzes a legal situation and provides guidance
 * @param situation The legal situation to analyze
 * @param options Additional options for the API request
 * @returns Analysis and guidance
 */
export async function analyzeLegalSituation(
  situation: string,
  options: {
    province?: string,
    caseType?: string,
    maxTokens?: number,
    temperature?: number,
    responseFormat?: 'text' | 'json'
  } = {}
): Promise<string> {
  if (!situation || situation.trim().length === 0) {
    throw new Error('Situation description is required for analysis');
  }

  try {
    // Ensure we have an API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }

    const { 
      province = 'Ontario',
      caseType = 'general',
      maxTokens = 2048, 
      temperature = 0.7,
      responseFormat = 'text'
    } = options;
    
    // Build a system prompt based on the request details
    const systemPrompt = 
      `You are a legal research assistant for self-represented litigants in Canada, focusing on ${province} provincial law. ` +
      `You provide information specifically about ${caseType} cases. ` +
      'Offer accurate information about legal processes, potential strategies, and resources. ' +
      'IMPORTANT: Always clarify that you are not providing legal advice and recommend consulting with a legal professional. ' +
      'Focus on being educational, informative, and practical.';
    
    // Build appropriate response format instruction
    let formatInstruction = '';
    if (responseFormat === 'json') {
      formatInstruction = 'Provide your response in JSON format with these keys: "summary", "keyPoints", "possibleApproaches", "resourcesNeeded", "nextSteps", and "additionalResources".';
    }

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: `Please analyze this legal situation in ${province}, Canada and provide guidance. ${formatInstruction}\n\nSITUATION:\n${situation}`
        }
      ],
    });

    return message.content[0].text;
  } catch (error: any) {
    // Handle API errors
    if (error.status === 401) {
      throw new Error('Authentication error: Invalid Anthropic API key');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded: Too many requests to Anthropic API');
    } else if (error.status >= 500) {
      throw new Error('Anthropic service error: Try again later');
    }
    
    throw new Error(`Anthropic analysis error: ${error.message}`);
  }
}

export default {
  analyzeText,
  analyzeImage,
  analyzeLegalSituation
};