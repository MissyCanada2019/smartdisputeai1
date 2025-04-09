/**
 * Alternative Anthropic Claude service implementation for SmartDispute.ai
 * Provides functions for AI-powered document and image analysis
 */

import Anthropic from '@anthropic-ai/sdk';
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
import * as fs from 'fs';
import { promisify } from 'util';

// Helper for file operations
const readFile = promisify(fs.readFile);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Constants
const DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';
const MAX_TOKENS = 4096;

// Error handling wrapper
async function safeAnthropicCall<T>(requestFn: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await requestFn();
  } catch (error: any) {
    console.error(`Anthropic API error: ${error.message}`);
    throw new Error(`${errorMessage}: ${error.message}`);
  }
}

/**
 * Extracts text from a Claude API response
 */
function extractTextFromResponse(response: any): string {
  if (!response || !response.content || !Array.isArray(response.content)) {
    return '';
  }
  
  return response.content
    .filter((item: any) => item.type === 'text')
    .map((item: any) => item.text)
    .join('\n');
}

/**
 * Analyzes an image using Claude Vision capabilities
 */
export async function analyzeImageWithClaude(base64Image: string, prompt?: string): Promise<string> {
  return safeAnthropicCall(async () => {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Please analyze this image thoroughly and extract all important information.'
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
      ],
      temperature: 0.3,
    });

    return extractTextFromResponse(response);
  }, 'Failed to analyze image with Claude');
}

/**
 * Generates a comprehensive legal analysis of a case situation
 */
export async function generateLegalAnalysisWithClaude(options: {
  caseType: string;
  jurisdiction: string;
  requestedAnalysis: string;
  caseBackground: string;
  evidence: string[];
}): Promise<string> {
  const { caseType, jurisdiction, requestedAnalysis, caseBackground, evidence } = options;
  
  const evidenceText = evidence.map((item, index) => 
    `Evidence Item #${index + 1}:\n${item}`
  ).join('\n\n');
  
  const prompt = `
Case Type: ${caseType}
Jurisdiction: ${jurisdiction}
Requested Analysis: ${requestedAnalysis}

Case Background:
${caseBackground}

Evidence:
${evidenceText}
`;

  return safeAnthropicCall(async () => {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: `You are a specialized legal analysis assistant for SmartDispute.ai. 
Your task is to analyze legal situations and provide helpful insights and strategies.
Focus on being accurate, thorough, and balanced in your analysis.
For ${jurisdiction} jurisdiction, incorporate relevant laws and precedents.
Be clear that you are providing information, not legal advice, and recommend consulting with a lawyer for specific legal advice.`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
    });
    
    return extractTextFromResponse(response);
  }, 'Failed to generate legal analysis with Claude');
}

/**
 * For compatibility with existing code, these are mock implementations
 * that will be replaced with proper functionality as needed
 */

export function analyzeText(text: string): Promise<string> {
  return Promise.resolve("Mock text analysis: " + text.substring(0, 100) + "...");
}

export default {
  analyzeImageWithClaude,
  generateLegalAnalysisWithClaude,
  analyzeText
};