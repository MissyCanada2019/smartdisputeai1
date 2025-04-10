/**
 * Test script for Anthropic Claude API using the Node.js SDK
 * Uses CommonJS syntax for compatibility
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Test simple text completion
async function testTextResponse() {
  try {
    console.log("Testing basic text response...");
    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 100,
      messages: [
        { role: 'user', content: 'What are the key principles of Canadian tenant rights?' }
      ]
    });

    console.log("Response received:");
    console.log(response.content[0].text);
    console.log("\nText response test completed successfully");
    return true;
  } catch (error) {
    console.error("Error in text response test:", error);
    return false;
  }
}

// Test document analysis for legal case
async function testDocumentAnalysis() {
  try {
    console.log("\nTesting document analysis...");
    const systemPrompt = `You are a legal assistant for SmartDispute.ai, specialized in Canadian legal matters.
    Analyze this document from Ontario and identify:
    
    1. Type of issue (housing, employment, consumer, CAS/child services, etc.)
    2. Specific classification (e.g., "T2 - Interference with reasonable enjoyment" for housing)
    3. Recommended legal forms or responses
    4. Relevant legal references from Ontario
    5. Suggested response strategy
    6. Document complexity (basic, standard, premium, or urgent)
    
    Respond in valid JSON format with these fields:
    {
        "issue_type": string,
        "classification": string,
        "recommended_forms": string,
        "legal_references": string,
        "response_strategy": string,
        "complexity": string,
        "confidence": number (0-1)
    }
    Include detailed explanations for each field based on the document content.`;

    const documentText = `
    NOTICE OF RENT INCREASE
    
    Date: April 1, 2025
    
    Dear Mr. Johnson,
    
    This letter serves as notice that your monthly rent for the property at 456 Elm Street, Unit 202, Toronto, Ontario, will be increased from $1,500 to $1,800 per month, effective June 1, 2025.
    
    This increase of 20% is necessary due to rising property taxes and maintenance costs.
    
    Please let me know if you have any questions.
    
    Sincerely,
    James Wilson
    Property Manager
    `;

    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: systemPrompt,
      max_tokens: 1000,
      messages: [
        { role: 'user', content: documentText }
      ]
    });

    console.log("Response received from Claude:");
    const truncatedResponse = response.content[0].text.length > 300 
      ? response.content[0].text.substring(0, 300) + "..." 
      : response.content[0].text;
    console.log(truncatedResponse);
    
    // Extract and parse JSON from the response
    try {
      // Find the JSON object in the response
      const jsonStart = response.content[0].text.indexOf('{');
      const jsonEnd = response.content[0].text.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = response.content[0].text.substring(jsonStart, jsonEnd);
        const parsedResult = JSON.parse(jsonStr);
        
        console.log("\nParsed JSON result:");
        console.log(JSON.stringify(parsedResult, null, 2));
        console.log("\nDocument analysis test completed successfully");
        return true;
      } else {
        console.error("Error: Could not find JSON in the response");
        return false;
      }
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return false;
    }
  } catch (error) {
    console.error("Error in document analysis test:", error);
    return false;
  }
}

// Test status endpoint
async function testStatus() {
  try {
    console.log("\nTesting simple status check...");
    
    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 20,
      messages: [
        { role: 'user', content: 'Say hello' }
      ]
    });
    
    console.log("Status check response:", response.content[0].text);
    console.log("API is available and working ✅");
    return true;
  } catch (error) {
    console.error("API status check failed:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("Starting Anthropic Claude API tests (CommonJS version)...");
  console.log("===================================================");
  
  // Run status test first
  const apiAvailable = await testStatus();
  
  if (!apiAvailable) {
    console.log("\n❌ API is not available. Skipping remaining tests.");
    console.log("\nTroubleshooting tips:");
    console.log("1. Verify your ANTHROPIC_API_KEY is set correctly in the .env file");
    console.log("2. Confirm you have sufficient API credits in your Anthropic account");
    console.log("3. Check for any network issues that might be blocking API calls");
    console.log("4. Verify the model name is correct (it should be 'claude-3-7-sonnet-20250219')");
    return;
  }
  
  let testResults = {
    basicText: await testTextResponse(),
    documentAnalysis: await testDocumentAnalysis()
  };
  
  console.log("\nTest Results Summary:");
  console.log("=====================");
  for (const [test, passed] of Object.entries(testResults)) {
    console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  const overallSuccess = Object.values(testResults).every(result => result === true);
  console.log(`\nOverall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Run the tests
runAllTests();