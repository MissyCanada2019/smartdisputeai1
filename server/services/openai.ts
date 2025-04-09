import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const GPT_MODEL = "gpt-4o";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Initialize the OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Error handling wrapper for all OpenAI API calls
 * Provides consistent error response format and retry logic
 */
async function safeOpenAIRequest<T>(requestFn: () => Promise<T>, errorMessage: string): Promise<T> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    try {
      // Check if API key is present
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.');
      }

      return await requestFn();
    } catch (error: any) {
      lastError = error;
      
      // Handle different error types
      if (error.message?.includes('API key') || error.message?.includes('auth')) {
        // Don't retry authentication errors
        throw new Error(`Authentication error: ${error.message}`);
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        // Retry with exponential backoff for rate limit errors
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      } else if (error.message?.includes('500') || error.message?.includes('503')) {
        // Retry for server errors
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        attempt++;
      } else {
        // Don't retry other errors
        throw new Error(`${errorMessage}: ${error.message}`);
      }
    }
  }

  // If we've exhausted our retries
  throw new Error(`${errorMessage} after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`);
}

/**
 * Analyzes text with GPT-4o to extract key information and provide legal insights
 */
export async function analyzeDocument(text: string, context?: string): Promise<any> {
  const systemPrompt = `You are a legal document analyzer for SmartDispute.ai, assisting Canadians with legal self-representation. 
  Analyze the provided document text and extract key information that would be relevant in a legal dispute.
  ${context ? `Consider this additional context: ${context}` : ''}`;

  return safeOpenAIRequest(async () => {
    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text.substring(0, 30000) } // Limit text to avoid token limits
      ],
      response_format: { type: "json_object" }
    });

    try {
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (e) {
      return {
        error: "Failed to parse GPT response as JSON",
        rawResponse: response.choices[0].message.content
      };
    }
  }, "Failed to analyze document with GPT");
}

/**
 * Analyzes an image (base64 encoded) with GPT-4o Vision capabilities
 */
export async function analyzeImage(base64Image: string, prompt?: string): Promise<any> {
  const userPrompt = prompt || 
    "Analyze this document image and extract all text content, legal details, key facts, and parties mentioned. If this is a legal document, identify its type and purpose.";

  return safeOpenAIRequest(async () => {
    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a legal document analyzer expert. Extract text and analyze legal documents from images with precision and accuracy."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
    });

    return {
      analysis: response.choices[0].message.content,
      success: true
    };
  }, "Failed to analyze image with GPT Vision");
}

/**
 * Generates a legal advice response based on the user's situation and evidence
 */
export async function generateLegalAdvice(situation: string, documents: any[], province: string): Promise<any> {
  const documentsText = documents.map(d => `Document: ${d.filename}\nContent: ${d.content || 'No text content available'}`).join('\n\n');
  
  const systemPrompt = `You are a legal assistant for SmartDispute.ai, helping Canadians with legal self-representation. 
  You are NOT a lawyer and should clarify this in your response. 
  Provide guidance on the user's legal situation based on the documents and description provided.
  Focus on ${province} provincial law where applicable.
  
  Format your response in markdown with these sections:
  1. Situation Summary - Brief neutral summary of the facts
  2. Legal Issues - Identify potential legal issues based on the situation and documents
  3. Relevant Laws - Applicable laws or regulations in ${province} 
  4. Suggested Steps - Practical next steps the user could consider
  5. Document Analysis - Brief analysis of the provided documents
  6. Important Disclaimers - Include that this is not legal advice and certain situations require consultation with a lawyer`;

  return safeOpenAIRequest(async () => {
    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `My situation: ${situation}\n\nMy documents:\n${documentsText}` }
      ]
    });

    return {
      advice: response.choices[0].message.content,
      success: true
    };
  }, "Failed to generate legal advice with GPT");
}

/**
 * Compares a user's case with similar legal precedents to develop potential strategies
 */
export async function analyzeLegalStrategy(situation: string, evidence: any[], jurisdiction: string): Promise<any> {
  const evidenceText = evidence.map(e => `Evidence: ${e.title || 'Untitled'}\nDescription: ${e.description || 'No description'}\nContent: ${e.content || 'No content available'}`).join('\n\n');
  
  const systemPrompt = `You are a legal strategy assistant for SmartDispute.ai, helping Canadians prepare legal strategies. 
  You are NOT a lawyer and should make this clear in your response.
  Based on the user's situation and evidence, suggest possible legal strategies they might consider.
  Focus on ${jurisdiction} jurisdictional considerations where applicable.`;

  return safeOpenAIRequest(async () => {
    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `My situation: ${situation}\n\nMy evidence:\n${evidenceText}` }
      ],
      response_format: { type: "json_object" }
    });

    try {
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (e) {
      return {
        error: "Failed to parse GPT response as JSON",
        rawResponse: response.choices[0].message.content
      };
    }
  }, "Failed to analyze legal strategy with GPT");
}

/**
 * Generate a letter or document based on user inputs and templates
 */
export async function generateLegalDocument(templateType: string, userInputs: any, jurisdiction: string): Promise<any> {
  const inputsText = Object.entries(userInputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  const systemPrompt = `You are a legal document generator for SmartDispute.ai, helping Canadians create ${templateType} documents.
  Create a professional, legally-appropriate ${templateType} based on the user inputs provided.
  Follow standard legal document format and conventions for ${jurisdiction}.
  Include all necessary sections typically found in a ${templateType}.
  
  Format your response as a complete, ready-to-use document in markdown format.
  Do not include explanations or instructions - return ONLY the document text.`;

  return safeOpenAIRequest(async () => {
    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please generate a ${templateType} document using the following information:\n\n${inputsText}` }
      ]
    });

    return {
      document: response.choices[0].message.content,
      success: true
    };
  }, `Failed to generate ${templateType} document with GPT`);
}

/**
 * Generate an image based on a description
 */
export async function generateImage(prompt: string, size: string = "1024x1024"): Promise<string> {
  return safeOpenAIRequest(async () => {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size as any,
      quality: "standard",
    });

    return response.data[0].url || "";
  }, "Failed to generate image");
}

export default {
  analyzeDocument,
  analyzeImage,
  generateLegalAdvice,
  analyzeLegalStrategy,
  generateLegalDocument,
  generateImage
};