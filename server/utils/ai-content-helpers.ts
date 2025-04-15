/**
 * Helper utilities for working with AI model responses
 */

/**
 * Safely extracts text content from Anthropic model responses
 * @param contentBlock The content block from an Anthropic response
 * @returns The text content as string or empty string if not available
 */
export function extractTextFromContentBlock(contentBlock: any): string {
  if (!contentBlock) {
    return '';
  }
  
  // Handle Anthropic's specific content structure
  if (Array.isArray(contentBlock)) {
    // Find the first text type block
    const textBlock = contentBlock.find(block => block.type === 'text');
    return textBlock?.text || '';
  }
  
  // Handle simple content that's already text
  if (typeof contentBlock === 'string') {
    return contentBlock;
  }
  
  // Handle content objects with text property
  if (contentBlock.text) {
    return contentBlock.text;
  }
  
  if (contentBlock.content) {
    return typeof contentBlock.content === 'string' 
      ? contentBlock.content 
      : extractTextFromContentBlock(contentBlock.content);
  }
  
  return '';
}

/**
 * Attempts to extract JSON from a text response
 * @param text The text that should contain JSON
 * @returns Parsed object or null if no valid JSON found
 */
export function extractJsonFromText(text: string): any | null {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  // Try direct parsing first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Not valid JSON, continue to extraction methods
  }
  
  // Try to extract JSON using regex pattern matching
  try {
    // Find content between curly braces (including nested structures)
    const jsonPattern = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
    const matches = text.match(jsonPattern);
    
    if (matches && matches.length > 0) {
      // Try parsing each match, return the first valid JSON
      for (const match of matches) {
        try {
          return JSON.parse(match);
        } catch (e) {
          // Continue to next match
        }
      }
    }
    
    // Try to find arrays too
    const arrayPattern = /\[(?:[^\[\]]|(?:\[(?:[^\[\]]|(?:\[[^\[\]]*\]))*\]))*\]/g;
    const arrayMatches = text.match(arrayPattern);
    
    if (arrayMatches && arrayMatches.length > 0) {
      // Try parsing each match, return the first valid JSON
      for (const match of arrayMatches) {
        try {
          return JSON.parse(match);
        } catch (e) {
          // Continue to next match
        }
      }
    }
  } catch (e) {
    console.warn('Error extracting JSON with regex:', e);
  }
  
  return null;
}

/**
 * Formats a basic prompt for AI models, with optional system instruction
 * @param userPrompt The user's prompt text
 * @param systemInstruction Optional system instruction
 * @returns Formatted prompt string
 */
export function formatBasicPrompt(userPrompt: string, systemInstruction?: string): string {
  let formattedPrompt = '';
  
  if (systemInstruction) {
    formattedPrompt += `System: ${systemInstruction}\n\n`;
  }
  
  formattedPrompt += `User: ${userPrompt}`;
  
  return formattedPrompt;
}

/**
 * Helper to validate and standardize inputs for AI processing
 * @param text Text input to validate
 * @param minLength Minimum required length (default 3)
 * @param maxLength Maximum allowed length (default 25000)
 * @returns Validated and trimmed text or throws error
 */
export function validateTextInput(text: string, minLength = 3, maxLength = 25000): string {
  if (!text || typeof text !== 'string') {
    throw new Error('Text input must be a valid string');
  }
  
  const trimmedText = text.trim();
  
  if (trimmedText.length < minLength) {
    throw new Error(`Text input too short (minimum ${minLength} characters)`);
  }
  
  if (trimmedText.length > maxLength) {
    console.warn(`Text input exceeds maximum length, truncating from ${trimmedText.length} to ${maxLength} characters`);
    return trimmedText.substring(0, maxLength);
  }
  
  return trimmedText;
}

/**
 * Converts JSON object to a formatted string representation
 * @param data JSON object to be converted
 * @returns Pretty-printed JSON string
 */
export function formatJsonOutput(data: any): string {
  if (!data) {
    return '';
  }
  
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    console.warn('Error formatting JSON output:', e);
    return typeof data === 'string' ? data : '';
  }
}