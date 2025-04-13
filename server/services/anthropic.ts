/**
 * Anthropic Claude service for SmartDispute.ai
 */

import Anthropic from '@anthropic-ai/sdk';
import { ContentBlock } from '@anthropic-ai/sdk/resources/messages';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';
const MAX_TOKENS = 4096;
const DEFAULT_TEMP = 0.7;

/** Extracts text blocks from Claude responses */
function getTextFromContent(content: any): string {
  if (!Array.isArray(content)) return '';
  return content.filter((block: any) => block.type === 'text')
    .map((block: any) => block.text).join('\n');
}

/** Safe Claude API wrapper with retry logic */
async function safeAnthropicRequest<T>(fn: () => Promise<T>, msg: string): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error(`[Anthropic] ${msg}: ${error.message}`);
    if (error.status === 429) {
      await new Promise(res => setTimeout(res, 2000));
      return safeAnthropicRequest(fn, msg);
    }
    throw new Error(`${msg}: ${error.message}`);
  }
}

/** Analyzes legal document text */
export async function analyzeDocument(text: string, context?: string): Promise<any> {
  const systemPrompt = `You are a legal assistant. Analyze the document and extract legal insights.
Context: ${context || 'None'}

Respond in JSON format:
{
  "classification": "",
  "summary": "",
  "
