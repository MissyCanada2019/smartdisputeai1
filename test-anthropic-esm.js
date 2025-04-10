/**
 * Test script for Anthropic Claude API using the Node.js SDK
 * Uses ESM syntax for import (ES Modules)
 */

import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

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

// Test JSON structured output
async function testJSONOutput() {
  try {
    console.log("\nTesting JSON structured output...");
    const systemPrompt = `You are a legal assistant for SmartDispute.ai, specialized in Canadian legal matters.
    Analyze the given text and provide information about landlord-tenant issues.
    
    Respond in valid JSON format with these fields:
    {
      "issue_type": string,
      "jurisdiction": string,
      "relevant_laws": string,
      "recommended_action": string,
      "confidence_score": number (0-1)
    }`;

    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: systemPrompt,
      max_tokens: 1000,
      messages: [
        { 
          role: 'user', 
          content: 'My landlord has been ignoring my requests to fix the broken heating system for 3 weeks now. It\'s winter and the temperature in my apartment is below 15 degrees. I live in Ontario.' 
        }
      ]
    });

    console.log("Response received from Claude:");
    console.log(response.content[0].text);
    
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
        console.log("\nJSON output test completed successfully");
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
    console.error("Error in JSON output test:", error);
    return false;
  }
}

// Test detailed legal analysis
async function testLegalAnalysis() {
  try {
    console.log("\nTesting detailed legal analysis...");
    const systemPrompt = `You are a legal assistant for SmartDispute.ai, specialized in Canadian legal matters.
    Provide a detailed analysis of the legal situation described by the user.
    Include applicable laws, potential remedies, and recommended next steps.`;

    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: systemPrompt,
      max_tokens: 1500,
      messages: [
        { 
          role: 'user', 
          content: `I received this letter from my landlord:
          
          NOTICE OF TERMINATION
          
          Dear Tenant,
          
          This letter serves as a 30-day notice to terminate your tenancy at 123 Main Street, Apartment 4B, Toronto, ON.
          
          Your lease will end on May 31, 2025, and you must vacate the premises by that date. The reason for this termination is that I plan to renovate the unit extensively.
          
          Please ensure all personal belongings are removed and the apartment is in clean condition upon your departure.
          
          Regards,
          John Smith
          Landlord` 
        }
      ]
    });

    console.log("Response received from Claude:");
    console.log(response.content[0].text.substring(0, 500) + "...");
    console.log("\nLegal analysis test completed successfully");
    return true;
  } catch (error) {
    console.error("Error in legal analysis test:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("Starting Anthropic Claude API tests...");
  console.log("======================================");
  
  let testResults = {
    basicText: await testTextResponse(),
    jsonOutput: await testJSONOutput(),
    legalAnalysis: await testLegalAnalysis()
  };
  
  console.log("\nTest Results Summary:");
  console.log("=====================");
  for (const [test, passed] of Object.entries(testResults)) {
    console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  const overallSuccess = Object.values(testResults).every(result => result === true);
  console.log(`\nOverall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!overallSuccess) {
    console.log("\nTroubleshooting tips:");
    console.log("1. Verify your ANTHROPIC_API_KEY is set correctly in the .env file");
    console.log("2. Confirm you have sufficient API credits in your Anthropic account");
    console.log("3. Check for any network issues that might be blocking API calls");
    console.log("4. Verify the model name is correct (it should be 'claude-3-7-sonnet-20250219')");
  }
}

// Run the tests
runAllTests();