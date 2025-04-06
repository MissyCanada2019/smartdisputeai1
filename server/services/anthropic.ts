import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// Initialize Anthropic client
// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AnalysisResult {
  summary: string;
  strength: string;
  weaknesses: string;
  recommendations: string[];
  relevantLaws: string[];
  sentiment: string;
  confidenceScore: number;
}

/**
 * Helper function to determine if an error is related to API credentials
 * @param error The error object to check
 * @returns True if the error is likely related to an API key issue
 */
function isApiKeyError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('API key') || 
           error.includes('authentication') || 
           error.includes('unauthorized') ||
           error.includes('auth') || 
           error.includes('credential') || 
           error.toLowerCase().includes('api key');
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('api key') || 
           message.includes('authentication') || 
           message.includes('unauthorized') ||
           message.includes('auth') || 
           message.includes('credential');
  }
  
  return false;
}

/**
 * Format API-related errors with more user-friendly messages
 * @param error The original error
 * @returns A formatted error message
 */
function formatApiError(error: unknown): string {
  // Default message if we can't extract specific details
  let message = 'Anthropic API error: Please check your API key or try again later.';
  
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      message = 'Anthropic API authorization failed: Your API key appears to be invalid. Please check your credentials.';
    } else if (error.message.includes('429')) {
      message = 'Anthropic API rate limit exceeded: Please try again later or adjust your request frequency.';
    } else if (error.message.includes('500')) {
      message = 'Anthropic API server error: The service is experiencing issues. Please try again later.';
    } else {
      message = `Anthropic API error: ${error.message}`;
    }
  }
  
  return message;
}

/**
 * Extracts JSON from Claude's response content
 * @param content The content blocks from Claude's response
 * @returns Parsed JSON object
 */
function extractJsonFromResponse(content: any[]): any {
  if (content.length === 0) {
    throw new Error("Empty response from Claude");
  }
  
  const firstBlock = content[0];
  if (firstBlock.type !== 'text') {
    throw new Error("Unexpected response type from Claude");
  }
  
  const textContent = firstBlock.text;
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from Claude's response");
  }
  
  const jsonStr = jsonMatch[0];
  return JSON.parse(jsonStr);
}

/**
 * Analyzes a text document using Claude to extract legal insights
 * @param text The content of the document to analyze
 * @param caseContext Additional context about the case
 * @returns Analysis of the document
 */
export async function analyzeLegalDocument(text: string, caseContext: string): Promise<AnalysisResult> {
  try {
    // Validate API key before making the request
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing Anthropic API key. Please set the ANTHROPIC_API_KEY environment variable.");
    }
    
    const prompt = `
    As a legal expert, please analyze this evidence document in the context of the following case:
    
    CASE CONTEXT: ${caseContext}
    
    DOCUMENT CONTENT:
    ${text}
    
    Please provide a comprehensive analysis including:
    1. A summary of the document's content (2-3 sentences)
    2. The strengths of this evidence for the case
    3. Any weaknesses or limitations of this evidence
    4. Specific recommendations for how to use this evidence effectively
    5. Relevant laws, regulations, or legal precedents that apply to this evidence
    6. An overall sentiment assessment (positive, neutral, or negative for the case)
    7. A confidence score (1-10) on how beneficial this evidence is for the case
    
    Format your response as JSON with the following structure:
    {
      "summary": "...",
      "strength": "...",
      "weaknesses": "...",
      "recommendations": ["rec1", "rec2", ...],
      "relevantLaws": ["law1", "law2", ...],
      "sentiment": "positive|neutral|negative",
      "confidenceScore": number
    }
    `;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      system: "You are a Canadian legal assistant specializing in tenant disputes and Children's Aid Society cases. Analyze evidence documents objectively and provide structured, actionable feedback in JSON format.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });
    
    // Parse the response to get the JSON object
    const result = extractJsonFromResponse(response.content);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing document with Claude:", error);
    
    // Check if it's an API key related error and format it
    if (isApiKeyError(error)) {
      throw new Error(formatApiError(error));
    }
    
    // For other errors, wrap with more contextual information
    if (error instanceof Error) {
      throw new Error(`Failed to analyze document with Claude: ${error.message}`);
    } else {
      throw new Error(`Failed to analyze document with Claude: Unknown error`);
    }
  }
}

/**
 * Analyzes an image document (PDF, scanned document) using Claude Vision
 * @param imagePath Path to the image file
 * @param caseContext Additional context about the case
 * @returns Analysis of the document
 */
export async function analyzeImageDocument(imagePath: string, caseContext: string): Promise<AnalysisResult> {
  try {
    // Validate API key before making the request
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing Anthropic API key. Please set the ANTHROPIC_API_KEY environment variable.");
    }
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }
    
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      system: "You are a Canadian legal assistant specializing in tenant disputes and Children's Aid Society cases. Analyze evidence documents objectively and provide structured, actionable feedback in JSON format.",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `As a legal expert, please analyze this evidence document in the context of the following case:
            
            CASE CONTEXT: ${caseContext}
            
            Please provide a comprehensive analysis including:
            1. A summary of the document's content (2-3 sentences)
            2. The strengths of this evidence for the case
            3. Any weaknesses or limitations of this evidence
            4. Specific recommendations for how to use this evidence effectively
            5. Relevant laws, regulations, or legal precedents that apply to this evidence
            6. An overall sentiment assessment (positive, neutral, or negative for the case)
            7. A confidence score (1-10) on how beneficial this evidence is for the case
            
            Format your response as JSON with the following structure:
            {
              "summary": "...",
              "strength": "...",
              "weaknesses": "...",
              "recommendations": ["rec1", "rec2", ...],
              "relevantLaws": ["law1", "law2", ...],
              "sentiment": "positive|neutral|negative",
              "confidenceScore": number
            }`
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });
    
    // Parse the response to get the JSON object
    const result = extractJsonFromResponse(response.content);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing image document with Claude:", error);
    
    // Check if it's an API key related error and format it
    if (isApiKeyError(error)) {
      throw new Error(formatApiError(error));
    }
    
    // For file errors, provide a clear message
    if (error instanceof Error && error.message.includes('File not found')) {
      throw error;
    }
    
    // For other errors, wrap with more contextual information
    if (error instanceof Error) {
      throw new Error(`Failed to analyze image document with Claude: ${error.message}`);
    } else {
      throw new Error(`Failed to analyze image document with Claude: Unknown error`);
    }
  }
}

/**
 * Compares multiple evidence documents to determine the most effective legal strategy
 * @param analyses Array of analysis results
 * @param caseContext Additional context about the case
 * @returns Strategic recommendations based on all evidence
 */
export async function compareEvidenceStrategies(
  analyses: AnalysisResult[], 
  caseContext: string
): Promise<{ strategy: string, prioritizedEvidence: string[], nextSteps: string[] }> {
  try {
    // Validate API key before making the request
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing Anthropic API key. Please set the ANTHROPIC_API_KEY environment variable.");
    }
    
    // Validate input data
    if (!analyses || analyses.length === 0) {
      throw new Error("No analysis data provided. At least one document analysis is required.");
    }
    
    const analysesJson = JSON.stringify(analyses, null, 2);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      system: "You are a Canadian legal strategist specializing in tenant disputes and Children's Aid Society cases. Analyze multiple pieces of evidence objectively and provide a cohesive strategy.",
      messages: [
        { 
          role: 'user', 
          content: `
          As a legal strategist, review these analyses of different evidence documents for the following case:
          
          CASE CONTEXT: ${caseContext}
          
          EVIDENCE ANALYSES:
          ${analysesJson}
          
          Based on all the evidence, please provide:
          1. A comprehensive legal strategy that maximizes the strengths of the available evidence
          2. A prioritized list of evidence in order of importance/effectiveness
          3. Clear next steps for the person pursuing this case
          
          Format your response as JSON with the following structure:
          {
            "strategy": "...",
            "prioritizedEvidence": ["item1", "item2", ...],
            "nextSteps": ["step1", "step2", ...]
          }
          `
        }
      ],
    });
    
    // Parse the response to get the JSON object
    const result = extractJsonFromResponse(response.content);
    return result as { strategy: string, prioritizedEvidence: string[], nextSteps: string[] };
  } catch (error) {
    console.error("Error comparing evidence strategies with Claude:", error);
    
    // Check if it's an API key related error and format it
    if (isApiKeyError(error)) {
      throw new Error(formatApiError(error));
    }
    
    // For input validation errors, pass through the error
    if (error instanceof Error && error.message.includes("No analysis data provided")) {
      throw error;
    }
    
    // For other errors, wrap with more contextual information
    if (error instanceof Error) {
      throw new Error(`Failed to compare evidence strategies with Claude: ${error.message}`);
    } else {
      throw new Error(`Failed to compare evidence strategies with Claude: Unknown error`);
    }
  }
}

/**
 * Generate a plain language explanation of complex legal terminology
 * @param legalText The legal text to explain
 * @returns Simplified explanation
 */
export async function explainLegalTerminology(legalText: string): Promise<{ explanation: string }> {
  try {
    // Validate API key before making the request
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing Anthropic API key. Please set the ANTHROPIC_API_KEY environment variable.");
    }
    
    // Validate input data
    if (!legalText || legalText.trim() === '') {
      throw new Error("No legal text provided. Please provide text to explain.");
    }
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1000,
      system: "You are a legal translator who specializes in converting complex legal language into plain, accessible language that anyone can understand. Focus on clarity and simplicity without losing important meaning.",
      messages: [
        { 
          role: 'user', 
          content: `
          Please explain the following legal text in simple, plain language that someone without legal training could understand:
          
          "${legalText}"
          
          Format your response as JSON with the following structure:
          {
            "explanation": "..."
          }
          `
        }
      ],
    });
    
    // Parse the response to get the JSON object
    const result = extractJsonFromResponse(response.content);
    return result as { explanation: string };
  } catch (error) {
    console.error("Error explaining legal terminology with Claude:", error);
    
    // Check if it's an API key related error and format it
    if (isApiKeyError(error)) {
      throw new Error(formatApiError(error));
    }
    
    // For input validation errors, pass through the error
    if (error instanceof Error && error.message.includes("No legal text provided")) {
      throw error;
    }
    
    // For JSON parsing errors from extractJsonFromResponse
    if (error instanceof Error && error.message.includes("Failed to parse JSON")) {
      throw new Error(`Failed to parse Claude's response. The response may not be in the expected JSON format.`);
    }
    
    // For other errors, wrap with more contextual information
    if (error instanceof Error) {
      throw new Error(`Failed to explain legal terminology with Claude: ${error.message}`);
    } else {
      throw new Error(`Failed to explain legal terminology with Claude: Unknown error`);
    }
  }
}