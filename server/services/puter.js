/**
 * Puter API Integration Service for SmartDispute.ai
 * 
 * This service provides an alternative way to access Claude 3.5 Sonnet
 * using the Puter API instead of requiring a direct Anthropic API key.
 * Based on the EndlessClaude project: https://github.com/usualdork/EndlessClaude
 */

import fetch from 'node-fetch';

/**
 * Class for handling communication with the Puter API
 */
class PuterService {
  constructor() {
    this.apiBaseUrl = 'https://api.puter.com/v2';
  }

  /**
   * Send a message to Claude AI via Puter's API
   *
   * @param {string} message - The message to send to Claude
   * @param {Object} options - Additional options
   * @param {string} options.model - The model to use (defaults to claude-3-5-sonnet)
   * @returns {Promise<string>} - The AI's response
   */
  async sendMessage(message, options = {}) {
    const model = options.model || 'claude-3-5-sonnet';
    console.log(`Sending message to Claude via Puter API using model: ${model}`);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          model: model
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Puter API error (${response.status}): ${errorData}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Puter API:', error.message);
      throw error;
    }
  }

  /**
   * Analyze a document using Claude via Puter
   *
   * @param {string} documentText - The text content of the document to analyze
   * @param {string} province - Canadian province code (e.g., 'ON', 'BC')
   * @returns {Promise<Object>} - Structured analysis results
   */
  async analyzeDocument(documentText, province = 'ON') {
    const prompt = `
    Please analyze this legal document from ${province}, Canada and provide the following information:
    1. Document type and category
    2. Main parties involved
    3. Key issues or claims
    4. Relevant legal statutes or references specific to ${province}
    5. Deadline dates mentioned
    6. Overall assessment of the strength of the case or claim
    
    Document:
    ${documentText}
    
    Format your response as JSON with this structure:
    {
      "documentType": "",
      "documentCategory": "",
      "parties": { 
        "from": "", 
        "to": "" 
      },
      "keyIssues": [""],
      "legalReferences": [{
        "name": "",
        "relevantSections": [""]
      }],
      "importantDates": [{
        "date": "",
        "description": ""
      }],
      "assessmentScore": 0-100,
      "confidenceScore": 0-1,
      "recommendedActions": [""]
    }
    
    Return only valid JSON.
    `;
    
    try {
      const result = await this.sendMessage(prompt);
      
      // Extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[0]);
          return jsonData;
        } catch (jsonError) {
          console.error('Error parsing JSON from Claude response:', jsonError.message);
          throw new Error('Could not parse structured data from the AI response');
        }
      } else {
        throw new Error('No JSON data found in the AI response');
      }
    } catch (error) {
      console.error('Document analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate a response letter based on document analysis
   *
   * @param {Object} analysis - The analysis results from analyzeDocument
   * @param {string} originalText - The original document text
   * @param {Object} userInfo - Optional user information for personalization
   * @returns {Promise<string>} - Generated response letter in HTML format
   */
  async generateResponseLetter(analysis, originalText, userInfo = null) {
    const userContext = userInfo ? `
    The letter should be addressed from:
    Name: ${userInfo.name || 'N/A'}
    Address: ${userInfo.address || 'N/A'}
    Email: ${userInfo.email || 'N/A'}
    Phone: ${userInfo.phone || 'N/A'}
    ` : '';
    
    const prompt = `
    Based on the analysis of this document and the original text, create a professional
    response letter that addresses the key issues and provides a strong legal position.
    
    Document Analysis:
    ${JSON.stringify(analysis, null, 2)}
    
    Original Document:
    ${originalText}
    
    ${userContext}
    
    The response should:
    1. Use formal legal language appropriate for ${analysis.documentCategory || 'this type of document'}
    2. Reference relevant laws and statutes from the analysis
    3. Clearly state the recipient's position and requested actions
    4. Include proper formatting with date, address blocks, subject line, and signature
    
    Format the response as properly formatted HTML that can be directly used in a formal letter.
    `;
    
    try {
      const responseHtml = await this.sendMessage(prompt);
      return responseHtml;
    } catch (error) {
      console.error('Response generation failed:', error.message);
      throw error;
    }
  }
}

// Create a singleton instance
const puterService = new PuterService();

export default puterService;