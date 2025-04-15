import { analyzeDocument as analyzeTextWithOpenAI } from './openai';
import {
  analyzeDocument as analyzeTextWithAnthropic,
  analyzeImage as analyzeImageWithAnthropic
} from './anthropic';

export async function getStatus() {
  return {
    openai: 'available',
    anthropic: 'available'
  };
}

export async function analyzeText(text: string, province: string = 'ON') {
  const result = await analyzeTextWithOpenAI(text, province);
  return {
    result,
    serviceName: 'OpenAI',
    modelName: 'gpt-4o'
  };
}

export async function generateResponse(
  analysisResult: any,
  originalText: string,
  userInfo: any,
  province: string
) {
  const result = await analyzeTextWithAnthropic(originalText, province);
  return {
    result,
    serviceName: 'Anthropic',
    modelName: 'claude-3-7-sonnet'
  };
}

export async function chat(message: string) {
  const result = await analyzeTextWithOpenAI(message);
  return {
    result,
    serviceName: 'OpenAI',
    modelName: 'gpt-4o'
  };
}

export async function analyzeImage(base64Image: string) {
  const result = await analyzeImageWithAnthropic(base64Image, 'Analyze this image for legal insights');
  return {
    result,
    serviceName: 'Anthropic',
    modelName: 'claude-3-7-vision'
  };
}
