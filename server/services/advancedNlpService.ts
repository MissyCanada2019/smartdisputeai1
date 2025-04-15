/**
 * Advanced Natural Language Processing service for document analysis
 * Provides sophisticated analysis capabilities for legal documents
 */

import * as anthropicService from './anthropic';
import * as openaiService from './openai';
import { validateTextInput } from '../utils/ai-content-helpers';
import fs from 'fs';
import path from 'path';
import util from 'util';

const readFile = util.promisify(fs.readFile);

/**
 * Interface representing the result of document analysis
 */
export interface DocumentAnalysisResult {
  content: string;            // The original document content (or preview)
  keyEntities: Entity[];      // Extracted named entities
  keyConcepts: Concept[];     // Main concepts identified in the document
  documentType: string;       // The detected document type
  legalJurisdiction: string;  // Detected legal jurisdiction
  complexityScore: number;    // Document complexity score (1-10)
  summary: string;            // Concise summary of the document
  deadlines: Deadline[];      // Important deadlines extracted from document
  obligations: Obligation[];  // Legal obligations identified
  risksAndWarnings: string[]; // Potential risks or warnings
  nextSteps: string[];        // Recommended next steps
  rawAnalysis: string;        // Full raw analysis from AI model
  sourceModel: string;        // The AI model used for analysis
}

/**
 * Entity interface for named entity recognition
 */
export interface Entity {
  text: string;       // The entity text as it appears in the document
  type: EntityType;   // The type of entity
  relevance: number;  // Relevance score (0-1)
  context?: string;   // Optional surrounding context
}

/**
 * Enum of recognized entity types
 */
export type EntityType = 
  | 'PERSON'          // Individual names
  | 'ORGANIZATION'    // Organizations, companies, institutions
  | 'LOCATION'        // Physical locations
  | 'DATE'            // Calendar dates or times
  | 'MONEY'           // Monetary values
  | 'LEGAL_REFERENCE' // References to laws, acts, sections
  | 'LEGAL_TERM'      // Specialized legal terminology
  | 'DOCUMENT_REF'    // References to other documents
  | 'DEADLINE'        // Time-sensitive information
  | 'OTHER';          // Other entity types

/**
 * Concept interface for important legal concepts
 */
export interface Concept {
  name: string;       // Concept name
  relevance: number;  // Relevance score (0-1)
  description: string; // Brief description of the concept
}

/**
 * Deadline interface for time-sensitive information
 */
export interface Deadline {
  description: string; // What the deadline is for
  date: string;       // The deadline date or period
  isAbsolute: boolean; // Whether the deadline is absolute or relative
  consequence: string; // What happens if the deadline is missed
}

/**
 * Obligation interface for required actions
 */
export interface Obligation {
  description: string; // Description of the obligation
  obligated: string;   // Who is obligated (e.g., "tenant", "landlord")
  to: string;          // What they are obligated to do
  consequence: string; // Consequence of not fulfilling the obligation
  timeframe: string;   // When it must be fulfilled
}

/**
 * Performs advanced NLP analysis on a document using multiple AI models
 * with fallback functionality
 * 
 * @param text The document text to analyze
 * @param documentType Optional known document type for more targeted analysis
 * @param jurisdiction Optional known jurisdiction for more targeted analysis
 * @returns Structured analysis of the document
 */
export async function analyzeDocument(
  text: string,
  documentType: string | null = null,
  jurisdiction: string = 'Ontario'
): Promise<DocumentAnalysisResult> {
  // Validate input
  try {
    text = validateTextInput(text, 10, 25000);
  } catch (error: any) {
    throw new Error(`Input validation failed: ${error.message}`);
  }

  let result: DocumentAnalysisResult;
  let errorMessage = '';

  // Try with OpenAI first
  try {
    console.log('Attempting document analysis using OpenAI...');
    result = await openaiService.analyzeDocument(text, documentType, jurisdiction);
    console.log('OpenAI document analysis succeeded');
    return result;
  } catch (error: any) {
    errorMessage += `OpenAI analysis error: ${error.message}. `;
    console.warn('OpenAI analysis failed, will try Anthropic:', error.message);
  }

  // Fall back to Anthropic
  try {
    console.log('Attempting document analysis using Anthropic...');
    result = await anthropicService.analyzeDocument(text, documentType, jurisdiction);
    console.log('Anthropic document analysis succeeded');
    return result;
  } catch (error: any) {
    errorMessage += `Anthropic analysis error: ${error.message}. `;
    console.warn('Anthropic analysis failed:', error.message);
  }

  // If all attempts fail, throw an error
  throw new Error(`Document analysis failed with all available models: ${errorMessage.trim()}`);
}

/**
 * Analyzes a document file from a file path
 * @param filePath Path to the document file
 * @param documentType Optional document type
 * @param jurisdiction Optional jurisdiction
 * @returns Structured document analysis
 */
export async function analyzeDocumentFile(
  filePath: string,
  documentType: string | null = null,
  jurisdiction: string = 'Ontario'
): Promise<DocumentAnalysisResult> {
  try {
    // Read the file
    const fileContent = await readFile(filePath, 'utf-8');
    
    // Process the document text
    return await analyzeDocument(fileContent, documentType, jurisdiction);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Error analyzing document file: ${error.message}`);
  }
}

/**
 * Extracts key entities from document text using NER
 * @param text The document text
 * @returns Array of extracted entities
 */
export async function extractEntities(text: string): Promise<Entity[]> {
  // Validate input
  try {
    text = validateTextInput(text, 10, 25000);
  } catch (error: any) {
    throw new Error(`Input validation failed: ${error.message}`);
  }

  // Try with available models
  let entities: Entity[] = [];
  let errorMessage = '';

  // Try OpenAI first
  try {
    console.log('Extracting entities using OpenAI...');
    
    const userPrompt = `
Please extract all named entities from the following text. 
Return only a JSON array of entities with the following structure:
[
  {
    "text": "the exact entity text",
    "type": "PERSON | ORGANIZATION | LOCATION | DATE | MONEY | LEGAL_REFERENCE | LEGAL_TERM | DOCUMENT_REF | DEADLINE | OTHER",
    "relevance": "a score from 0 to 1 indicating relevance",
    "context": "optional brief surrounding context"
  }
]

Text to analyze:
${text}`;

    const response = await openaiService.analyzeText(userPrompt, {
      systemInstruction: 'You are a specialized legal entity extractor focusing on entities relevant in legal documents.',
      responseFormat: 'json'
    });
    
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        entities = parsed;
        console.log(`Successfully extracted ${entities.length} entities with OpenAI`);
        return entities;
      }
    } catch (parseError: any) {
      console.warn('Failed to parse OpenAI entity extraction response:', parseError.message);
    }
  } catch (error: any) {
    errorMessage += `OpenAI entity extraction error: ${error.message}. `;
    console.warn('OpenAI entity extraction failed, will try Anthropic:', error.message);
  }

  // Fall back to Anthropic
  try {
    console.log('Extracting entities using Anthropic...');
    
    const userPrompt = `
Please extract all named entities from the following text. 
Return only a JSON array of entities with the following structure:
[
  {
    "text": "the exact entity text",
    "type": "PERSON | ORGANIZATION | LOCATION | DATE | MONEY | LEGAL_REFERENCE | LEGAL_TERM | DOCUMENT_REF | DEADLINE | OTHER",
    "relevance": "a score from 0 to 1 indicating relevance",
    "context": "optional brief surrounding context"
  }
]

Text to analyze:
${text}`;

    const response = await anthropicService.analyzeText(userPrompt, {
      systemPrompt: 'You are a specialized legal entity extractor focusing on entities relevant in legal documents.',
      responseFormat: 'json'
    });
    
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        entities = parsed;
        console.log(`Successfully extracted ${entities.length} entities with Anthropic`);
        return entities;
      }
    } catch (parseError: any) {
      console.warn('Failed to parse Anthropic entity extraction response:', parseError.message);
    }
  } catch (error: any) {
    errorMessage += `Anthropic entity extraction error: ${error.message}. `;
    console.warn('Anthropic entity extraction failed:', error.message);
  }

  // If all attempts fail, throw an error
  if (entities.length === 0) {
    throw new Error(`Entity extraction failed with all available models: ${errorMessage.trim()}`);
  }

  return entities;
}

/**
 * Identify and extract key deadlines from text
 * @param text Document text
 * @returns Array of deadline objects
 */
export async function extractDeadlines(text: string): Promise<Deadline[]> {
  // Validate input
  try {
    text = validateTextInput(text, 10, 25000);
  } catch (error: any) {
    throw new Error(`Input validation failed: ${error.message}`);
  }

  // Try with available models
  let deadlines: Deadline[] = [];
  let errorMessage = '';

  // Try OpenAI first
  try {
    console.log('Extracting deadlines using OpenAI...');
    
    const userPrompt = `
Extract all deadlines and time-sensitive information from the following text.
Return only a JSON array with the following structure:
[
  {
    "description": "what the deadline is for",
    "date": "the deadline date or period",
    "isAbsolute": boolean indicating if this is a fixed calendar date or relative timeframe,
    "consequence": "what happens if the deadline is missed"
  }
]

Text to analyze:
${text}`;

    const response = await openaiService.analyzeText(userPrompt, {
      systemInstruction: 'You are a specialized legal deadline extractor. Focus only on time-sensitive information in legal documents.',
      responseFormat: 'json'
    });
    
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        deadlines = parsed;
        console.log(`Successfully extracted ${deadlines.length} deadlines with OpenAI`);
        return deadlines;
      }
    } catch (parseError: any) {
      console.warn('Failed to parse OpenAI deadline extraction response:', parseError.message);
    }
  } catch (error: any) {
    errorMessage += `OpenAI deadline extraction error: ${error.message}. `;
    console.warn('OpenAI deadline extraction failed, will try Anthropic:', error.message);
  }

  // Fall back to Anthropic
  try {
    console.log('Extracting deadlines using Anthropic...');
    
    const userPrompt = `
Extract all deadlines and time-sensitive information from the following text.
Return only a JSON array with the following structure:
[
  {
    "description": "what the deadline is for",
    "date": "the deadline date or period",
    "isAbsolute": boolean indicating if this is a fixed calendar date or relative timeframe,
    "consequence": "what happens if the deadline is missed"
  }
]

Text to analyze:
${text}`;

    const response = await anthropicService.analyzeText(userPrompt, {
      systemPrompt: 'You are a specialized legal deadline extractor. Focus only on time-sensitive information in legal documents.',
      responseFormat: 'json'
    });
    
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        deadlines = parsed;
        console.log(`Successfully extracted ${deadlines.length} deadlines with Anthropic`);
        return deadlines;
      }
    } catch (parseError: any) {
      console.warn('Failed to parse Anthropic deadline extraction response:', parseError.message);
    }
  } catch (error: any) {
    errorMessage += `Anthropic deadline extraction error: ${error.message}. `;
    console.warn('Anthropic deadline extraction failed:', error.message);
  }

  // If all attempts fail, throw an error
  if (deadlines.length === 0) {
    throw new Error(`Deadline extraction failed with all available models: ${errorMessage.trim()}`);
  }

  return deadlines;
}

/**
 * Calculate complexity score based on various metrics
 * @param text Document text
 * @returns Complexity score from 1-10
 */
export function calculateComplexity(text: string): number {
  if (!text || typeof text !== 'string') {
    return 5; // Default mid-range value
  }

  // Base score factors
  let complexityScore = 5; // Start at middle
  
  // 1. Length (longer docs tend to be more complex)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 10000) complexityScore += 2;
  else if (wordCount > 5000) complexityScore += 1.5;
  else if (wordCount > 2000) complexityScore += 1;
  else if (wordCount < 500) complexityScore -= 1;
  
  // 2. Sentence length (longer sentences = more complex)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(1, sentences.length);
  if (avgSentenceLength > 30) complexityScore += 1.5;
  else if (avgSentenceLength > 25) complexityScore += 1;
  else if (avgSentenceLength > 20) complexityScore += 0.5;
  else if (avgSentenceLength < 10) complexityScore -= 1;
  
  // 3. Legal terminology density
  const legalTerms = [
    'pursuant to', 'hereinafter', 'aforementioned', 'notwithstanding',
    'herein', 'whereby', 'therein', 'whereas', 'heretofore',
    'jurisdiction', 'statutory', 'adjudication', 'covenant',
    'indemnification', 'litigation', 'stipulation', 'tort',
    'defendant', 'plaintiff', 'appellant', 'respondent'
  ];
  
  const termMatches = legalTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  const termDensity = termMatches / Math.max(1, wordCount) * 1000; // Per 1000 words
  if (termDensity > 15) complexityScore += 2;
  else if (termDensity > 10) complexityScore += 1.5;
  else if (termDensity > 5) complexityScore += 1;
  else if (termDensity < 1) complexityScore -= 0.5;
  
  // Ensure score stays within 1-10 range
  complexityScore = Math.min(10, Math.max(1, Math.round(complexityScore)));
  
  return complexityScore;
}

/**
 * Helper function to provide human-readable interpretation of complexity scores
 * @param score Complexity score (1-10)
 * @returns Interpretation string
 */
export function getComplexityInterpretation(score: number): string {
  switch (true) {
    case score <= 2:
      return 'Very Simple - Easily understood by most people with basic reading skills.';
    case score <= 4:
      return 'Simple - Generally understandable by most adults, with some legal terminology.';
    case score <= 6:
      return 'Moderate - Contains legal language that may require careful reading for full comprehension.';
    case score <= 8:
      return 'Complex - Contains significant legal terminology and concepts that may be challenging for non-lawyers.';
    case score <= 10:
      return 'Very Complex - Dense legal language and concepts that likely require legal expertise to fully understand.';
    default:
      return 'Moderate - Contains legal language that may require careful reading for full comprehension.';
  }
}