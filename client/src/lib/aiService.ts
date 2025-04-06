
import { apiRequest } from "@/lib/queryClient";

/**
 * AI Service for document and text analysis
 * Uses server-side OpenAI and Claude APIs through our backend endpoints
 */

// Types for AI analysis responses
export interface AIAnalysisResponse {
  success: boolean;
  analysis?: string;
  openai?: string;
  claude?: string;
  filename?: string;
  model?: string;
  error?: string;
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze document');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while analyzing the document',
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze document');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error analyzing existing document:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while analyzing the document',
    };
  }
}

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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze text');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error analyzing text:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while analyzing the text',
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
