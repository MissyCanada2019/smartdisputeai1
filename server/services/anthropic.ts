/**
 * Anthropic Claude service for SmartDispute.ai
 * Provides integration with Anthropic Claude API for advanced AI capabilities
 * 
 * This service handles document analysis, image analysis, and legal assistance
 * using the latest Claude 3.7 Sonnet model
 */

import Anthropic from '@anthropic-ai/sdk';
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
import { ContentBlock, Message } from '@anthropic-ai/sdk/resources/messages';
import * as fs from 'fs';
import { promisify } from 'util';
import path from 'path';

// Load environment variables
const readFile = promisify(fs.readFile);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Get from environment variable
});

// Constants
const DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';
const MAX_TOKENS = 4096;
const DEFAULT_TEMP = 0.7;

/**
 * Helper function to safely extract text from Claude's response
 */
function getTextFromContent(content: any): string {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return '';
  }
  
  const textBlocks = content.filter(block => block.type === 'text');
  if (textBlocks.length === 0) {
    return '';
  }
  
  return textBlocks.map(block => block.text).join('\n');
}

/**
 * Error handling wrapper for all Anthropic API calls
 * Provides consistent error response format and retry logic
 */
async function safeAnthropicRequest<T>(requestFn: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await requestFn();
  } catch (error: any) {
    console.error(`Anthropic API error: ${error.message}`);
    
    // Handle rate limits with exponential backoff
    if (error.status === 429) {
      const delay = 2000; // Start with 2 seconds
      console.log(`Rate limited. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeAnthropicRequest(requestFn, errorMessage);
    }
    
    // For other errors, provide a clear error message
    throw new Error(`${errorMessage}: ${error.message}`);
  }
}

/**
 * Analyzes text with Claude to extract key information and provide legal insights
 */
export async function analyzeDocument(text: string, context?: string): Promise<any> {
  const systemPrompt = `You are a specialized legal assistant for SmartDispute.ai, analyzing documents to help users with legal challenges. 
Your task is to analyze the provided document text and extract key information.

${context || ''}

Output your analysis in the following JSON format:
{
  "classification": "Document type or dispute classification",
  "confidence": "Confidence score (0.0-1.0)",
  "summary": "Brief summary of the document",
  "keyPoints": ["List of key points"],
  "recommendations": ["List of recommended actions"],
  "legalReferences": ["Relevant laws or regulations"],
  "risks": ["Potential risks or concerns"],
  "pricing": {
    "basicAnalysis": "Price for basic analysis",
    "fullAnalysis": "Price for full analysis with recommendations"
  }
}`;

  return safeAnthropicRequest(async () => {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
      temperature: 0.2,
    });

    // Parse the JSON response
    try {
      const content = getTextFromContent(response.content);
      return JSON.parse(content);
    } catch (error) {
      return {
        classification: "Unknown",
        confidence: 0.5,
        summary: getTextFromContent(response.content),
        keyPoints: [],
        recommendations: [],
        legalReferences: [],
        risks: ["Could not parse structured data"],
        pricing: {
          basicAnalysis: 4.99,
          fullAnalysis: 14.99
        }
      };
    }
  }, "Failed to analyze document");
}

/**
 * Analyzes an image (base64 encoded) with Claude Vision capabilities
 */
export async function analyzeImage(base64Image: string, prompt?: string): Promise<any> {
  const imageContent: ContentBlock[] = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: prompt?.includes('pdf') ? 'application/pdf' : 'image/jpeg',
        data: base64Image,
      },
    },
  ];

  const requestPrompt = prompt || 'Analyze this document image and extract all relevant information.';
  
  return safeAnthropicRequest(async () => {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user', 
          content: [
            { type: 'text', text: requestPrompt },
            ...imageContent
          ]
        }
      ],
      temperature: 0.3,
    });

    return {
      extractedText: getTextFromContent(response.content),
      analysis: getTextFromContent(response.content)
    };
  }, "Failed to analyze image");
}

/**
 * Generates a legal advice response based on the user's situation and evidence
 */
export async function generateLegalAdvice(situation: string, documents: any[], province: string): Promise<any> {
  const documentTexts = documents.map(doc => 
    `Document: ${doc.title || 'Untitled'}
Description: ${doc.description || 'No description'}
Content: ${doc.content || 'No content'}`
  ).join('\n\n');

  const prompt = `Legal Situation: ${situation}
Province: ${province}

Evidence Documents:
${documentTexts}`;

  const systemPrompt = `You are a legal assistant helping users understand their legal options.
You are not a lawyer and should make that clear.
Provide practical advice based on the legal situation and evidence provided.
Focus on next steps, relevant laws in ${province}, and potential strategies.
Your response should be balanced, practical, and empathetic.`;

  return safeAnthropicRequest(async () => {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      temperature: DEFAULT_TEMP,
    });

    return {
      advice: getTextFromContent(response.content),
      relevantLaws: [],
      nextSteps: []
    };
  }, "Failed to generate legal advice");
}

/**
 * Compares a user's case with similar legal precedents to develop potential strategies
 */
export async function analyzeLegalStrategy(situation: string, evidence: any[], jurisdiction: string): Promise<any> {
  const evidenceTexts = evidence.map(doc => 
    `Evidence: ${doc.title || 'Untitled'}
Description: ${doc.description || 'No description'}
Content: ${doc.content || 'No content'}`
  ).join('\n\n');

  const prompt = `Legal Situation: ${situation}
Jurisdiction: ${jurisdiction}

Evidence:
${evidenceTexts}

Analyze the legal situation and evidence to develop strategic options.
Compare with similar cases and precedents if relevant.
Provide an assessment of different strategies and their potential effectiveness.
Output your analysis in JSON format with the following structure:
{
  "strategies": ["List of potential strategies"],
  "precedents": ["Relevant legal precedents"],
  "strength": "Case strength assessment on scale of 1-10",
  "risks": ["Potential risks"],
  "recommendedApproach": "Most promising strategy"
}`;

  return safeAnthropicRequest(async () => {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    try {
      const content = getTextFromContent(response.content);
      return JSON.parse(content);
    } catch (error) {
      // If JSON parsing fails, return a structured response from the text
      const content = getTextFromContent(response.content);
      return {
        strategies: ["Could not parse structured strategies"],
        precedents: [],
        strength: 5,
        risks: ["Could not parse structured risks"],
        recommendedApproach: content.substring(0, 500)
      };
    }
  }, "Failed to analyze legal strategy");
}

/**
 * Generate a letter or document based on user inputs and templates
 */
export async function generateLegalDocument(templateType: string, userInputs: any, jurisdiction: string): Promise<any> {
  const inputFields = Object.entries(userInputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `Document Type: ${templateType}
Jurisdiction: ${jurisdiction}

User Inputs:
${inputFields}

Generate a professional legal document based on the template type and user inputs.
The document should be formatted properly and include all relevant legal language.
Customize the content based on the jurisdiction's specific laws and regulations.`;

  return safeAnthropicRequest(async () => {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const document = getTextFromContent(response.content);
    
    // Calculate some basic metrics
    const wordCount = document.split(/\s+/).length;
    const paragraphCount = document.split(/\n\s*\n/).length;
    const readabilityScore = calculateReadabilityScore(document);
    
    return {
      document,
      wordCount,
      paragraphCount,
      readabilityScore
    };
  }, "Failed to generate legal document");
}

// Utility function to calculate a simple readability score
function calculateReadabilityScore(text: string): number {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const complexWords = text.split(/\s+/).filter(word => word.length > 7).length;
  
  if (sentences === 0) return 50; // Default for very short text
  
  // Simple readability calculation
  const wordsPerSentence = words / sentences;
  const complexWordPercentage = (complexWords / words) * 100;
  
  // Scale from 0-100 (higher is more readable)
  const readabilityScore = Math.max(0, Math.min(100, 
    100 - (wordsPerSentence * 2) - (complexWordPercentage / 2)
  ));
  
  return Math.round(readabilityScore);
}

/**
 * For compatibility with directEvidence.ts
 */
export async function analyzeImageDocument(base64Image: string, prompt?: string): Promise<any> {
  return analyzeImage(base64Image, prompt);
}

/**
 * For compatibility with directEvidence.ts
 */
export async function analyzeLegalDocument(text: string, context?: string): Promise<any> {
  return analyzeDocument(text, context);
}

/**
 * For compatibility with directEvidence.ts
 */
export async function compareEvidenceStrategies(situation: string, evidence: any[], jurisdiction: string): Promise<any> {
  return analyzeLegalStrategy(situation, evidence, jurisdiction);
}

export default {
  analyzeDocument,
  analyzeImage,
  generateLegalAdvice,
  analyzeLegalStrategy,
  generateLegalDocument,
  analyzeImageDocument,
  analyzeLegalDocument,
  compareEvidenceStrategies
};