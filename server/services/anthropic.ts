import Anthropic from '@anthropic-ai/sdk';
import { extractJsonFromText, extractTextFromContentBlock, validateTextInput } from '../utils/ai-content-helpers';
import { DocumentAnalysisResult } from './advancedNlpService';

// Initialize Anthropic client
// Note: SDK will look for the ANTHROPIC_API_KEY environment variable automatically
const anthropic = new Anthropic();

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. Do not change this unless explicitly requested by the user
const DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';

// Define TypeScript types to match Anthropic SDK requirements
type UserRole = 'user';
type AssistantRole = 'assistant';
type MessageRole = UserRole | AssistantRole;

interface TextContent {
  type: 'text';
  text: string;
}

interface ImageContent {
  type: 'image';
  source: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

type MessageContent = string | TextContent | ImageContent | (TextContent | ImageContent)[];

interface UserMessage {
  role: UserRole;
  content: MessageContent;
}

interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

type Message = UserMessage | AssistantMessage;

/**
 * Interface for analysis options
 */
export interface AnalysisOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  model?: string;
}

/**
 * Generic text analysis function for Claude
 * @param text Text content to analyze
 * @param options Analysis options
 * @returns Analyzed text as string
 */
export async function analyzeText(
  text: string,
  options: AnalysisOptions = {}
): Promise<string> {
  // API key authentication is handled by the Anthropic client

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Text content required for analysis');
  }

  const {
    systemPrompt,
    temperature = 0.3,
    maxTokens = 1000,
    responseFormat = 'text',
    model = DEFAULT_MODEL
  } = options;

  try {
    const messages = [
      {
        role: 'user' as const,
        content: text
      }
    ];

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages
    });

    // Extract text content from response
    const content = response.content;
    return extractTextFromContentBlock(content);
  } catch (error: any) {
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic analysis failed: ${error.message}`);
  }
}

/**
 * Analyzes a document with Claude
 * @param text The document text to analyze
 * @param documentType Optional document type for more targeted analysis
 * @param jurisdiction Optional jurisdiction for more targeted analysis
 * @returns Structured document analysis result
 */
export async function analyzeDocument(
  text: string,
  documentType: string | null = null,
  jurisdiction: string = 'Ontario'
): Promise<DocumentAnalysisResult> {
  // API key authentication is handled by the Anthropic client

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Document text required for analysis');
  }

  // Build system instruction with context
  let systemPrompt = `
You are a specialized legal document analyzer focusing on Canadian legal documents. Your task is to analyze the provided document text and extract key information in a structured format.

Your analysis should be detailed and specific to Canadian legal systems, with particular attention to provincial jurisdictions. Consider the nature of the document and its implications for the party who likely needs assistance.

Focus on:
1. Document identification: Determine the type of legal document (e.g., notice of eviction, CAS disclosure, etc.)
2. Key entities: Extract important names, organizations, locations, dates, monetary values, and legal references
3. Legal deadlines: Identify and explain any time-sensitive requirements or deadlines
4. Legal obligations: Extract obligations imposed on different parties
5. Jurisdiction: Identify the relevant legal jurisdiction (province, territory, or federal)
6. Risks and warnings: Highlight potential risks or concerning elements
7. Complexity assessment: Evaluate the document's complexity for a layperson (1-10 scale)
8. Next steps: Suggest practical next steps for someone receiving this document

Your analysis should be thorough but focused on what would be most important for someone without legal training to understand. Prioritize clarity and actionable insights.
`;
  
  if (documentType) {
    systemPrompt += `\nThis document appears to be a ${documentType}. Please analyze it with this context in mind.`;
  }
  
  if (jurisdiction) {
    systemPrompt += `\nThis document is from ${jurisdiction}, Canada. Please consider relevant provincial laws in your analysis.`;
  }

  try {
    // Truncate text if too long
    const processedText = validateTextInput(text, 10, 25000);
    
    const userMessage = `Please analyze this legal document and provide a detailed analysis in JSON format with the following structure:
{
  "documentType": "type of legal document",
  "legalJurisdiction": "applicable jurisdiction (province/territory)",
  "summary": "concise summary of the document",
  "complexityScore": number from 1-10,
  "keyEntities": [
    { "text": "entity text", "type": "ENTITY_TYPE", "relevance": 0.0-1.0, "context": "optional context" }
  ],
  "keyConcepts": [
    { "name": "concept name", "relevance": 0.0-1.0, "description": "brief description" }
  ],
  "deadlines": [
    { "description": "what the deadline is for", "date": "deadline date/period", "isAbsolute": boolean, "consequence": "what happens if missed" }
  ],
  "obligations": [
    { "description": "obligation description", "obligated": "who is obligated", "to": "what they must do", "consequence": "what happens if not fulfilled", "timeframe": "when it must be done" }
  ],
  "risksAndWarnings": [
    "description of risk or warning"
  ],
  "nextSteps": [
    "recommended next step"
  ]
}

Here is the document text:
${processedText}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        { role: 'user' as const, content: userMessage }
      ]
    });

    const contentText = extractTextFromContentBlock(response.content);
    const jsonResponse = extractJsonFromText(contentText);
    
    if (!jsonResponse) {
      throw new Error('Failed to extract structured data from Anthropic response');
    }
    
    // Construct a structured document analysis result
    const result: DocumentAnalysisResult = {
      content: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''), // Store a preview of the original content
      documentType: jsonResponse.documentType || 'Unknown',
      legalJurisdiction: jsonResponse.legalJurisdiction || jurisdiction,
      complexityScore: typeof jsonResponse.complexityScore === 'number' ? jsonResponse.complexityScore : 5,
      summary: jsonResponse.summary || '',
      keyEntities: Array.isArray(jsonResponse.keyEntities) ? jsonResponse.keyEntities : [],
      keyConcepts: Array.isArray(jsonResponse.keyConcepts) ? jsonResponse.keyConcepts : [],
      deadlines: Array.isArray(jsonResponse.deadlines) ? jsonResponse.deadlines : [],
      obligations: Array.isArray(jsonResponse.obligations) ? jsonResponse.obligations : [],
      risksAndWarnings: Array.isArray(jsonResponse.risksAndWarnings) ? jsonResponse.risksAndWarnings : [],
      nextSteps: Array.isArray(jsonResponse.nextSteps) ? jsonResponse.nextSteps : [],
      rawAnalysis: contentText,
      sourceModel: DEFAULT_MODEL
    };
    
    return result;
  } catch (error: any) {
    console.error('Anthropic document analysis error:', error);
    throw new Error(`Anthropic document analysis failed: ${error.message}`);
  }
}

/**
 * Analyze an image with Claude
 * @param base64Image Base64-encoded image data
 * @param prompt Text prompt for the analysis
 * @returns Analysis text
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string = 'Analyze this image and describe what you see in detail.'
): Promise<string> {
  // API key authentication is handled by the Anthropic client

  if (!base64Image) {
    throw new Error('Base64 image data is required');
  }

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: prompt
            },
            {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    return extractTextFromContentBlock(response.content);
  } catch (error: any) {
    console.error('Anthropic image analysis error:', error);
    throw new Error(`Anthropic image analysis failed: ${error.message}`);
  }
}

/**
 * Custom function for analyzing a legal situation
 * @param userDescription User's description of their legal situation
 * @param documentText Optional supporting document text
 * @param documentType Optional document type
 * @param jurisdiction Optional jurisdiction
 * @returns Legal analysis and advice
 */
export async function analyzeLegalSituation(
  userDescription: string,
  documentText?: string,
  documentType?: string,
  jurisdiction: string = 'Ontario'
): Promise<string> {
  // API key authentication is handled by the Anthropic client

  if (!userDescription || userDescription.trim().length === 0) {
    throw new Error('User description is required');
  }

  const systemPrompt = `
You are a legal assistance AI specialized in Canadian law, particularly for ${jurisdiction}.
Your goal is to provide helpful information and guidance to individuals who may not be able to afford legal representation.

IMPORTANT DISCLAIMERS:
1. You are not a lawyer and cannot provide legal advice.
2. Your analysis is for informational purposes only and should not be considered legal advice.
3. You should encourage users to seek professional legal counsel for their specific situation.

When analyzing the user's situation:
1. Identify the key legal issues involved
2. Provide general information about relevant laws and procedures
3. Explain potential options the person might have
4. Mention relevant deadlines or time-sensitive actions
5. Reference helpful resources or legal aid services
6. Always maintain a balanced perspective

Be empathetic, clear, and practical in your guidance.
`;

  try {
    const messages = [
      {
        role: 'user' as const,
        content: `I need help understanding my legal situation in ${jurisdiction}. Here's what's happening:\n\n${userDescription}`
      }
    ];

    // Add document context if provided
    if (documentText && documentText.trim().length > 0) {
      messages.push({
        role: 'user' as const,
        content: `Here's a ${documentType || 'legal document'} related to my situation:\n\n${documentText}`
      });
    }

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      temperature: 0.4,
      system: systemPrompt,
      messages
    });

    return extractTextFromContentBlock(response.content);
  } catch (error: any) {
    console.error('Anthropic legal situation analysis error:', error);
    throw new Error(`Anthropic legal analysis failed: ${error.message}`);
  }
}