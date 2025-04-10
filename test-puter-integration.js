/**
 * Puter API Integration Test for SmartDispute.ai
 * 
 * This script tests connecting to the Claude 3.5 Sonnet model using Puter's API
 * as an alternative to direct Anthropic API access.
 * 
 * Based on the EndlessClaude project approach: https://github.com/usualdork/EndlessClaude
 */

// Import required libraries
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Import script helpers for testing
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get the current directory for loading test data
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Test sending a message to Claude via Puter's API
 * 
 * @param {string} message - Message to send to the AI
 * @returns {Promise<string>} - The AI's response
 */
async function testPuterClaudeAPI(message) {
  console.log("\n=== Testing Puter Claude API Integration ===\n");
  console.log(`Sending message: "${message}"\n`);
  
  try {
    // The Puter API endpoint for Claude AI chat
    const response = await fetch('https://api.puter.com/v2/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        model: "claude-3-5-sonnet"
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Response received:");
    console.log(data.response);
    
    return data.response;
  } catch (error) {
    console.error("Error calling Puter API:", error.message);
    throw error;
  }
}

/**
 * Alternative function that emulates the browser-based approach
 * used in EndlessClaude (for future reference)
 */
async function browserPuterApproach(message) {
  // This would require a headless browser or similar approach
  console.log("Note: The browser approach would use the puter.ai.chat() method");
  console.log("which is only available in the browser with the Puter JS SDK loaded.");
  console.log("Example from EndlessClaude:");
  console.log(`
  const response = await puter.ai.chat(query, {
    model: "claude-3-5-sonnet",
    stream: true
  });

  let fullResponse = '';
  for await (const part of response) {
    fullResponse += part?.text || "";
  }
  `);
}

/**
 * Extract text from a PDF for testing document analysis
 * 
 * @param {string} filePath - Path to the file
 * @returns {string} - Extracted text
 */
function mockExtractText(filePath) {
  // For testing purposes, we'll just return some predefined text
  return `
    NOTICE OF TENANCY TERMINATION
    
    Date: April 8, 2025
    
    To: Tenant Name
    123 Sample St, 
    Toronto, ON M5V 2K6
    
    From: Landlord Name
    
    This letter serves as a formal notice that your tenancy at the above address 
    will be terminated effective May 31, 2025, due to consistent late payment 
    of rent over the past 6 months.
    
    According to the Ontario Residential Tenancies Act, 2006, a landlord may 
    terminate a tenancy for consistent late payment of rent.
    
    You have the right to dispute this notice by filing an application with the 
    Landlord and Tenant Board within 10 days of receiving this notice.
    
    Sincerely,
    Landlord Name
  `;
}

/**
 * Main function to test Puter API integration for document analysis
 */
async function testDocumentAnalysis() {
  console.log("\n=== Testing Document Analysis with Puter API ===\n");
  
  // 1. Extract text from a mock PDF (in production, we would use real PDFs)
  const documentText = mockExtractText('mock_document.pdf');
  console.log("Document text extracted:\n");
  console.log(documentText.substring(0, 150) + "...\n");
  
  // 2. Analyze the text with Claude via Puter
  const prompt = `
  Please analyze this legal document and provide the following information:
  1. Document type
  2. Main parties involved
  3. Key issues or claims
  4. Relevant legal statutes or references
  5. Deadline dates mentioned
  6. Overall assessment of the case strength
  
  Document:
  ${documentText}
  
  Please format your response as JSON with the following structure:
  {
    "documentType": "",
    "parties": { "from": "", "to": "" },
    "keyIssues": [""],
    "legalReferences": [""],
    "importantDates": [""],
    "assessmentScore": 0-100,
    "recommendedActions": [""]
  }
  `;
  
  try {
    const analysis = await testPuterClaudeAPI(prompt);
    console.log("\nDocument analysis completed successfully.\n");
    
    // 3. Parse the JSON response - in production, handle this more robustly
    try {
      // Find JSON in the response (Claude often adds context around the JSON)
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const result = JSON.parse(jsonStr);
        console.log("Parsed analysis result:");
        console.log(JSON.stringify(result, null, 2));
        return result;
      } else {
        console.error("Could not extract JSON from response");
        return null;
      }
    } catch (jsonError) {
      console.error("Error parsing JSON from response:", jsonError.message);
      console.log("Raw response:", analysis);
      return null;
    }
  } catch (error) {
    console.error("Document analysis failed:", error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log("Starting Puter API integration tests...\n");
  
  try {
    // Test 1: Simple message exchange
    await testPuterClaudeAPI("Hello Claude, please tell me what you know about tenant rights in Ontario");
    
    // Test 2: Document analysis
    await testDocumentAnalysis();
    
    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("Test suite failed:", error.message);
  }
}

// Execute the tests
runTests();