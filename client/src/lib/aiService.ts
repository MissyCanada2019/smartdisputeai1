import { apiRequest } from "@/lib/queryClient";
import { analyzeText as claudeAnalyze } from './claude';

// Types for AI analysis responses
/**
 * Interface representing an AI analysis response
 * Expanded with better type definitions for clearer error handling
 */
export interface AIAnalysisResponse {
  success: boolean;
  analysis?: string;
  openai?: string;
  claude?: string;
  filename?: string;
  model?: string;
  error?: string;
  errors?: Array<{
    model?: string;
    message?: string;
    error?: string;
    code?: string;
    type?: string;
  }>;
  source?: string;
  status?: 'completed' | 'failed' | 'processing';
  message?: string;
}

/**
 * Check if an error is related to API keys
 * @param error Error message or object
 * @returns True if the error is related to API keys
 */
/**
 * Check if an error is related to API keys
 * This function safely extracts error messages from different error formats
 * and checks them against common API key error phrases
 * 
 * @param error Error message or object
 * @returns True if the error is related to API keys
 */
function isApiKeyError(error: unknown): boolean {
  if (!error) return false;

  // Handle array of errors
  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const errorsArray = Array.isArray((error as any).errors) ? (error as any).errors : [];

    if (errorsArray.length > 0) {
      // Check if any error in the array is an API key error
      return errorsArray.some((e: any) => {
        const errMsg = typeof e === 'string'
          ? e
          : (typeof e === 'object' && e !== null)
            ? (e.message || e.error || '')
            : '';

        return isApiKeyErrorMessage(errMsg);
      });
    }
  }

  // Extract error message from different possible formats
  const errorMsg = typeof error === 'string'
    ? error
    : (typeof error === 'object' && error !== null)
      ? ((error as any).message || (error as any).error || '')
      : '';

  return isApiKeyErrorMessage(errorMsg);
}

/**
 * Helper function to check if a string contains API key related phrases
 * @param errorMsg The error message to check
 * @returns True if the message contains API key related phrases
 */
function isApiKeyErrorMessage(errorMsg: string): boolean {
  const apiKeyPhrases = [
    'api key',
    'authentication',
    'unauthorized',
    'invalid key',
    'expired key',
    'credential',
    'token',
    'permission denied',
    'access denied',
    'forbidden',
    'not authorized'
  ];

  return apiKeyPhrases.some(phrase =>
    errorMsg.toLowerCase().includes(phrase.toLowerCase())
  );
}

/**
 * Format API key related errors with a more user-friendly message
 * @param error The original error
 * @returns User-friendly error message
 */
function formatApiKeyError(error: unknown): string {
  const baseMessage = 'AI service unavailable.';

  // Handle array of errors from multiple AI services
  if (error && typeof error === 'object' && 'errors' in error) {
    const errorsArray = Array.isArray((error as any).errors) ? (error as any).errors : [];

    if (errorsArray.length > 0) {
      // Multiple errors from different AI services
      const models = errorsArray
        .filter((e: { model?: string, message?: string }) => e.model && e.message)
        .map((e: { model: string }) => e.model)
        .join(' and ');

      if (models) {
        return `${baseMessage} Unable to connect to ${models}. API credentials may be missing or invalid. Please try another model or contact support.`;
      }
    }
  }

  // Extract error message from different possible formats
  const errorMsg = typeof error === 'string'
    ? error
    : (typeof error === 'object' && error !== null)
      ? ((error as any).message || (error as any).error || '')
      : '';

  // Check for specific API key errors
  if (errorMsg.toLowerCase().includes('api key')) {
    return `${baseMessage} API key validation failed. Please contact support to verify the API configuration.`;
  }

  if (errorMsg.toLowerCase().includes('rate limit')) {
    return `${baseMessage} API rate limit exceeded. Please try again later or contact support.`;
  }

  if (errorMsg.toLowerCase().includes('token') ||
    errorMsg.toLowerCase().includes('unauthorized') ||
    errorMsg.toLowerCase().includes('authentication')) {
    return `${baseMessage} API authorization failed. Please contact support to check the API credentials.`;
  }

  // Default message
  return `${baseMessage} The AI service credentials may be missing or invalid. Please try another model or contact support.`;
}

/**
 * Analyze a document using AI
 * @param file The file to analyze
 * @param model The AI model to use ('openai', 'claude', or 'dual')
 * @returns Analysis response
 */
export async function analyzeDocument(
  file: File,
  model: 'openai' | 'claude' | 'dual' = 'openai'
): Promise<AIAnalysisResponse> {
  try {
    const formData = new FormData();
    formData.append('document', file);

    let endpoint = '/api/document-analyzer/analyze';

    if (model === 'dual') {
      endpoint = '/api/document-analyzer/analyze-dual';
    } else {
      endpoint = `/api/document-analyzer/analyze?model=${model}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (isApiKeyError(data)) {
        throw new Error(formatApiKeyError(data));
      }
      throw new Error(data.error || 'Failed to analyze document');
    }

    return data;
  } catch (error: unknown) {
    console.error('Error analyzing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while analyzing the document';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Analyze text using AI
 * @param text The text to analyze
 * @param model The AI model to use ('openai' or 'claude')
 * @returns Analysis response
 */
export async function analyzeExistingDocument(
  documentPath: string,
  model: 'openai' | 'claude' | 'dual' = 'openai'
): Promise<AIAnalysisResponse> {
  try {
    let endpoint = '/api/document-analyzer/analyze-existing';

    if (model === 'dual') {
      endpoint = '/api/document-analyzer/analyze-existing-dual';
    } else {
      endpoint = `/api/document-analyzer/analyze-existing?model=${model}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentPath }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isApiKeyError(data)) {
        throw new Error(formatApiKeyError(data));
      }
      throw new Error(data.error || 'Failed to analyze document');
    }

    return data;
  } catch (error: unknown) {
    console.error('Error analyzing existing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while analyzing the document';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Analyze text content using AI
 * @param text The text to analyze
 * @param model The AI model to use ('openai' or 'claude')
 * @returns Analysis response
 */
export async function analyzeText(
  text: string,
  model: 'openai' | 'claude' = 'openai'
): Promise<AIAnalysisResponse> {
  try {
    const response = await fetch(`/api/document-analyzer/analyze-text?model=${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isApiKeyError(data)) {
        throw new Error(formatApiKeyError(data));
      }
      throw new Error(data.error || 'Failed to analyze text');
    }

    return data;
  } catch (error: unknown) {
    console.error('Error analyzing text:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while analyzing the text';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Analyze evidence file using our enhanced API endpoint
 * @param fileId Evidence file ID
 * @param query Optional specific query
 * @param preferredModel Which AI model to prefer
 * @returns Analysis response with detailed error information
 */
/**
 * Analyze evidence file using our enhanced API endpoint
 * This improved implementation handles various error cases and provides detailed feedback
 * 
 * @param fileId Evidence file ID
 * @param query Optional specific query
 * @param preferredModel Which AI model to prefer
 * @returns Analysis response with detailed error information
 */
export async function analyzeEvidenceFile(
  fileId: number,
  query?: string,
  preferredModel: 'auto' | 'claude' | 'openai' = 'auto'
): Promise<AIAnalysisResponse> {
  try {
    const response = await fetch(`/api/evidence-files/${fileId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        preferredModel
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for errors array with API key related issues
      if (data.errors && Array.isArray(data.errors)) {
        if (data.errors.some((e: { message?: string }) => e.message && isApiKeyError(e.message))) {
          throw new Error(formatApiKeyError(data));
        }

        // If we have errors but they're not API key related, format them for display
        if (data.errors.length > 0) {
          const errorMessages = data.errors
            .filter((e: any) => e.message || e.error || (typeof e === 'string'))
            .map((e: any) => {
              if (typeof e === 'string') return e;
              return e.message || e.error || 'Unknown error';
            })
            .join('; ');

          if (errorMessages) {
            throw new Error(`Analysis failed: ${errorMessages}`);
          }
        }
      }

      // Handle other error formats
      throw new Error(data.error || data.message || 'Failed to analyze evidence file');
    }

    // Format successful response
    return {
      success: data.status === 'completed',
      analysis: data.results?.fullText,
      error: data.status === 'failed' ? 'Analysis failed' : undefined,
      errors: data.errors,
      source: data.source,
      filename: data.fileName,
      model: data.model || preferredModel
    };
  } catch (error: unknown) {
    console.error('Error analyzing evidence file:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while analyzing the evidence';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Compare analyses from multiple AI models
 * @param analyses An object containing analyses from different models
 * @returns Comparison object highlighting differences and similarities
 */
export function compareAnalyses(analyses: {
  openai?: string;
  claude?: string;
}): { similarities: string[]; differences: string[] } {
  // This is a simple implementation - in a real application, we might use 
  // more sophisticated NLP techniques to compare the analyses

  const similarities: string[] = [];
  const differences: string[] = [];

  if (!analyses.openai || !analyses.claude) {
    return { similarities, differences };
  }

  // Convert to lowercase for comparison
  const openaiLower = analyses.openai.toLowerCase();
  const claudeLower = analyses.claude.toLowerCase();

  // Check for major section presence
  const sections = [
    "document assessment",
    "merit weight",
    "court strategy",
    "summary and action items"
  ];

  sections.forEach(section => {
    const inOpenAI = openaiLower.includes(section);
    const inClaude = claudeLower.includes(section);

    if (inOpenAI && inClaude) {
      similarities.push(`Both models provide ${section} analysis`);
    } else if (inOpenAI && !inClaude) {
      differences.push(`Only OpenAI provides ${section} analysis`);
    } else if (!inOpenAI && inClaude) {
      differences.push(`Only Claude provides ${section} analysis`);
    }
  });

  // Look for specific keywords related to case merit
  const meritTerms = ["merit", "strength", "weakness", "evidence", "credibility"];

  meritTerms.forEach(term => {
    const inOpenAI = openaiLower.includes(term);
    const inClaude = claudeLower.includes(term);

    if (inOpenAI && inClaude) {
      similarities.push(`Both models mention "${term}" in their analysis`);
    }
  });

  return { similarities, differences };
}

const analyzeDocument = async (text: string, options = {}) => {
  try {
    // Try OpenAI first
    const response = await apiRequest('/api/openai/analyze', {
      method: 'POST',
      body: JSON.stringify({ text, options }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      // If OpenAI fails, try Claude as backup
      console.log('OpenAI analysis failed, falling back to Claude');
      return await claudeAnalyze(text, options);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    // Final fallback to Claude
    try {
      return await claudeAnalyze(text, options);
    } catch (backupError) {
      throw new Error(`All AI services failed: ${error}. Backup error: ${backupError}`);
    }
  }
};

export default {
  analyzeDocument,
  analyzeDocument,
  analyzeExistingDocument,
  analyzeText,
  analyzeEvidenceFile,
  compareAnalyses
};