/**
 * Client-side service for interacting with the Anthropic Claude API via our backend
 */

import { apiRequest } from "@lib/queryClient";

/**
 * Analyze text content using Anthropic Claude
 * 
 * @param text Text to analyze
 * @param prompt Specific instructions for the analysis
 * @param options Additional options for the API request
 * @returns Analysis results as a string
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
  try {
    const response = await apiRequest('/api/claude/analyze-text', {
      method: 'POST',
      body: JSON.stringify({
        text,
        prompt,
        options
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to analyze text with Claude');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error: any) {
    console.error('Claude text analysis error:', error);
    throw new Error(`Failed to analyze text: ${error.message}`);
  }
}

/**
 * Analyze an image using Anthropic Claude
 * 
 * @param imageFile File object representing the image
 * @param prompt Specific instructions for the analysis
 * @param options Additional options for the API request
 * @returns Analysis results as a string
 */
export async function analyzeImage(
  imageFile: File,
  prompt: string = 'Analyze this document and identify all important information, focusing on legal relevance.',
  options: {
    maxTokens?: number,
    temperature?: number,
    system?: string
  } = {}
): Promise<string> {
  try {
    // Convert the image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const response = await apiRequest('/api/claude/analyze-image', {
      method: 'POST',
      body: JSON.stringify({
        image: base64Image,
        prompt,
        options
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to analyze image with Claude');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error: any) {
    console.error('Claude image analysis error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Analyze a legal situation using Anthropic Claude
 * 
 * @param situation Description of the legal situation
 * @param options Additional options for the API request
 * @returns Analysis results as a string or JSON object
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
): Promise<string | any> {
  try {
    const response = await apiRequest('/api/claude/analyze-legal-situation', {
      method: 'POST',
      body: JSON.stringify({
        situation,
        options
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to analyze legal situation with Claude');
    }

    const data = await response.json();
    
    // If the response format is JSON and it's a string, try to parse it
    if (options.responseFormat === 'json' && typeof data.analysis === 'string') {
      try {
        return JSON.parse(data.analysis);
      } catch (parseError) {
        console.warn('Failed to parse JSON response from Claude:', parseError);
        return data.analysis;
      }
    }
    
    return data.analysis;
  } catch (error: any) {
    console.error('Claude legal situation analysis error:', error);
    throw new Error(`Failed to analyze legal situation: ${error.message}`);
  }
}

/**
 * Helper function to convert a file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

export default {
  analyzeText,
  analyzeImage,
  analyzeLegalSituation
};