/**
 * Document Analysis Service
 * Client-side utility functions for document analysis
 */

import { queryClient } from './queryClient';

/**
 * Interface for document analysis result
 */
export interface DocumentAnalysisResult {
  content: string;            // The original document content (or preview)
  keyEntities: Entity[];      // Extracted named entities
  keyConcepts: Concept[];     // Main concepts identified in the document
  documentType: string;       // The detected document type
  legalJurisdiction: string;  // Detected legal jurisdiction
  complexityScore: number;    // Document complexity score (1-10)
  meritWeight?: number;       // Case merit weight score (1-10)
  summary: string;            // Concise summary of the document
  deadlines: Deadline[];      // Important deadlines extracted from document
  obligations: Obligation[];  // Legal obligations identified
  risksAndWarnings: string[]; // Potential risks or warnings
  nextSteps: string[];        // Recommended next steps
  rawAnalysis: string;        // Full raw analysis from AI model
  sourceModel: string;        // The AI model used for analysis
}

export interface Entity {
  text: string;       // The entity text as it appears in the document
  type: EntityType;   // The type of entity
  relevance: number;  // Relevance score (0-1)
  context?: string;   // Optional surrounding context
}

export type EntityType = 
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'DATE'
  | 'MONEY'
  | 'LEGAL_REFERENCE'
  | 'LEGAL_TERM'
  | 'DOCUMENT_REF'
  | 'DEADLINE'
  | 'OTHER';

export interface Concept {
  name: string;
  relevance: number;
  description: string;
}

export interface Deadline {
  description: string;
  date: string;
  isAbsolute: boolean;
  consequence: string;
}

export interface Obligation {
  description: string;
  obligated: string;
  to: string;
  consequence: string;
  timeframe: string;
}

/**
 * Function to analyze document text
 * @param text Document text to analyze
 * @param documentType Optional document type
 * @param jurisdiction Optional jurisdiction
 * @returns Analysis result
 */
export async function analyzeDocumentText(
  text: string,
  documentType?: string,
  jurisdiction: string = 'Ontario'
): Promise<DocumentAnalysisResult> {
  try {
    const response = await queryClient.apiRequest('/api/advanced-analysis/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        documentType,
        jurisdiction,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Document analysis failed');
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error in document analysis:', error);
    throw error;
  }
}

/**
 * Function to upload and analyze a document
 * @param file Document file to upload and analyze
 * @param documentType Optional document type
 * @param jurisdiction Optional jurisdiction
 * @returns Analysis result and file details
 */
export async function uploadAndAnalyzeDocument(
  file: File,
  documentType?: string,
  jurisdiction: string = 'Ontario'
): Promise<{ result: DocumentAnalysisResult, originalFile: any }> {
  try {
    // Use standard fetch API with FormData
    const formData = new FormData();
    formData.append('document', file);
    
    if (documentType) {
      formData.append('documentType', documentType);
    }
    
    formData.append('jurisdiction', jurisdiction);

    // Use native fetch instead of apiRequest to ensure proper FormData handling
    const response = await fetch('/api/advanced-analysis/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Document upload analysis failed');
    }

    const data = await response.json();
    
    // Ensure merit weight is explicitly handled in the response
    if (data.result && typeof data.result.meritWeight === 'undefined') {
      console.warn('Merit weight missing in response, defaulting to calculated value');
      // Add a default merit weight if not present in the response
      // This calculation can be adjusted based on your scoring algorithm
      data.result.meritWeight = calculateMeritWeightFromComplexity(data.result.complexityScore || 5);
    }
    
    return {
      result: data.result,
      originalFile: data.originalFile
    };
  } catch (error) {
    console.error('Error in document upload analysis:', error);
    throw error;
  }
}

/**
 * Helper function to calculate a merit weight from complexity if not provided by API
 * @param complexityScore The document complexity score (1-10)
 * @returns A calculated merit weight (1-10)
 */
function calculateMeritWeightFromComplexity(complexityScore: number): number {
  // This is a simple fallback calculation - adjust based on your needs
  // The formula inverts complexity (higher complexity = lower initial merit)
  // Then applies modifiers to keep it in a realistic range
  const baseScore = 10 - (complexityScore * 0.6);
  // Ensure the score is between 1-10
  return Math.max(1, Math.min(10, Math.round(baseScore)));
}

/**
 * Function to extract entities from text
 * @param text Document text
 * @returns Array of extracted entities
 */
export async function extractEntities(text: string): Promise<Entity[]> {
  try {
    const response = await queryClient.apiRequest('/api/advanced-analysis/extract-entities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Entity extraction failed');
    }

    const data = await response.json();
    return data.entities;
  } catch (error) {
    console.error('Error in entity extraction:', error);
    throw error;
  }
}

/**
 * Function to extract deadlines from text
 * @param text Document text
 * @returns Array of extracted deadlines
 */
export async function extractDeadlines(text: string): Promise<Deadline[]> {
  try {
    const response = await queryClient.apiRequest('/api/advanced-analysis/extract-deadlines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Deadline extraction failed');
    }

    const data = await response.json();
    return data.deadlines;
  } catch (error) {
    console.error('Error in deadline extraction:', error);
    throw error;
  }
}

/**
 * Function to calculate document complexity
 * @param text Document text
 * @returns Complexity score and interpretation
 */
export async function calculateComplexity(
  text: string
): Promise<{ score: number, interpretation: string }> {
  try {
    const response = await queryClient.apiRequest('/api/advanced-analysis/calculate-complexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Complexity calculation failed');
    }

    const data = await response.json();
    return data.complexity;
  } catch (error) {
    console.error('Error in complexity calculation:', error);
    throw error;
  }
}

/**
 * Get an appropriate icon for an entity type
 * @param entityType The type of entity
 * @returns Icon name for the entity type
 */
export function getEntityTypeIcon(entityType: EntityType): string {
  switch (entityType) {
    case 'PERSON':
      return 'user';
    case 'ORGANIZATION':
      return 'building';
    case 'LOCATION':
      return 'map-pin';
    case 'DATE':
      return 'calendar';
    case 'MONEY':
      return 'dollar-sign';
    case 'LEGAL_REFERENCE':
      return 'book';
    case 'LEGAL_TERM':
      return 'bookmark';
    case 'DOCUMENT_REF':
      return 'file-text';
    case 'DEADLINE':
      return 'clock';
    case 'OTHER':
    default:
      return 'tag';
  }
}

/**
 * Get an appropriate color for an entity type
 * @param entityType The type of entity
 * @returns CSS color class
 */
export function getEntityTypeColor(entityType: EntityType): string {
  switch (entityType) {
    case 'PERSON':
      return 'text-blue-500 bg-blue-100';
    case 'ORGANIZATION':
      return 'text-purple-500 bg-purple-100';
    case 'LOCATION':
      return 'text-green-500 bg-green-100';
    case 'DATE':
      return 'text-amber-500 bg-amber-100';
    case 'MONEY':
      return 'text-emerald-500 bg-emerald-100';
    case 'LEGAL_REFERENCE':
      return 'text-red-500 bg-red-100';
    case 'LEGAL_TERM':
      return 'text-indigo-500 bg-indigo-100';
    case 'DOCUMENT_REF':
      return 'text-sky-500 bg-sky-100';
    case 'DEADLINE':
      return 'text-rose-500 bg-rose-100';
    case 'OTHER':
    default:
      return 'text-gray-500 bg-gray-100';
  }
}

/**
 * Get an human-readable label for an entity type
 * @param entityType The type of entity
 * @returns Human-readable label
 */
export function getEntityTypeLabel(entityType: EntityType): string {
  switch (entityType) {
    case 'PERSON':
      return 'Person';
    case 'ORGANIZATION':
      return 'Organization';
    case 'LOCATION':
      return 'Location';
    case 'DATE':
      return 'Date';
    case 'MONEY':
      return 'Money';
    case 'LEGAL_REFERENCE':
      return 'Legal Reference';
    case 'LEGAL_TERM':
      return 'Legal Term';
    case 'DOCUMENT_REF':
      return 'Document Reference';
    case 'DEADLINE':
      return 'Deadline';
    case 'OTHER':
    default:
      return 'Other';
  }
}

/**
 * Format complexity score as a readable string with color
 * @param score Complexity score (1-10)
 * @returns Object with text and color class
 */
export function formatComplexityScore(score: number): { text: string, color: string } {
  if (score <= 2) {
    return { 
      text: 'Very Simple', 
      color: 'text-green-600' 
    };
  } else if (score <= 4) {
    return { 
      text: 'Simple', 
      color: 'text-emerald-600' 
    };
  } else if (score <= 6) {
    return { 
      text: 'Moderate', 
      color: 'text-amber-600' 
    };
  } else if (score <= 8) {
    return { 
      text: 'Complex', 
      color: 'text-orange-600' 
    };
  } else {
    return { 
      text: 'Very Complex', 
      color: 'text-red-600' 
    };
  }
}

/**
 * Format merit weight score as a readable string with color
 * @param score Merit weight score (1-10)
 * @returns Object with text and color class
 */
export function formatMeritWeight(score: number): { text: string, color: string } {
  if (score >= 8) {
    return { 
      text: 'Very Strong', 
      color: 'text-green-600' 
    };
  } else if (score >= 6) {
    return { 
      text: 'Strong', 
      color: 'text-emerald-600' 
    };
  } else if (score >= 4) {
    return { 
      text: 'Moderate', 
      color: 'text-amber-600' 
    };
  } else if (score >= 2) {
    return { 
      text: 'Weak', 
      color: 'text-orange-600' 
    };
  } else {
    return { 
      text: 'Very Weak', 
      color: 'text-red-600' 
    };
  }
}