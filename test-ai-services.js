/**
 * Test script for AI Services integration in SmartDispute.ai
 * 
 * This script tests both OpenAI and Anthropic services with sample text and error handling
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
dotenv.config();

// Check for required API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Test data
const sampleText = `
NOTICE OF EVICTION
Date: March 15, 2025

To: Jane Doe
Address: 123 Main Street, Apt 4B, Toronto, Ontario M5V 1A1

Dear Tenant,

This letter serves as formal notice that your tenancy at the above address will be terminated on April 30, 2025, due to the following reason(s):

1. Non-payment of rent for February and March 2025, totaling $2,400.
2. Violation of lease terms regarding noise disturbances, following complaints from neighbors on January 10, January 15, and February 3, 2025.

According to the Ontario Residential Tenancies Act, you have 14 days from receipt of this notice to remedy the situation by paying all outstanding rent and addressing the lease violations.

If you fail to comply with the terms outlined above within the given timeframe, legal proceedings for eviction will commence.

Should you have any questions regarding this notice, please contact our office at (416) 555-1234.

Sincerely,
John Smith
Property Manager
Sunshine Properties Ltd.
`;

// Test OpenAI service
async function testOpenAI() {
  console.log("📋 Testing OpenAI Service");
  console.log("------------------------");
  
  try {
    // Check API key
    if (!OPENAI_API_KEY) {
      console.log("❌ OpenAI API key missing. Please set OPENAI_API_KEY in your environment variables.");
      return;
    }
    
    console.log("🔑 OpenAI API key found");
    
    // Test text analysis
    console.log("🧠 Testing document analysis...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      temperature: 0.2,
      messages: [
        { 
          role: "system", 
          content: "You are a legal document analyzer. Extract key information from the provided document." 
        },
        { 
          role: "user", 
          content: sampleText 
        }
      ],
      response_format: { type: "json_object" }
    });
    
    console.log("✅ Document analysis successful");
    console.log("📝 Analysis result:");
    console.log(JSON.stringify(JSON.parse(response.choices[0].message.content), null, 2));
    
  } catch (error) {
    console.log(`❌ OpenAI test failed: ${error.message}`);
    console.error(error);
  }
}

// Test Anthropic service
async function testAnthropic() {
  console.log("\n📋 Testing Anthropic Service");
  console.log("------------------------");
  
  try {
    // Check API key
    if (!ANTHROPIC_API_KEY) {
      console.log("❌ Anthropic API key missing. Please set ANTHROPIC_API_KEY in your environment variables.");
      return;
    }
    
    console.log("🔑 Anthropic API key found");
    
    // Test text analysis
    console.log("🧠 Testing document analysis...");
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      max_tokens: 1500,
      system: "You are a legal document analyzer. Extract key information from the provided document and format as JSON.",
      messages: [{
        role: 'user',
        content: sampleText
      }],
      temperature: 0.2,
    });
    
    console.log("✅ Document analysis successful");
    console.log("📝 Analysis result:");
    console.log(response.content[0].text);
    
  } catch (error) {
    console.log(`❌ Anthropic test failed: ${error.message}`);
    console.error(error);
  }
}

// Error handling function to test error handling
async function testErrorHandling() {
  console.log("\n📋 Testing Error Handling");
  console.log("------------------------");
  
  // Test with invalid API key for OpenAI
  try {
    console.log("🧪 Testing OpenAI error handling with invalid API key...");
    const invalidOpenAI = new OpenAI({ apiKey: "invalid_key_sk_test" });
    
    await invalidOpenAI.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
    });
    
  } catch (error) {
    console.log(`✅ OpenAI correctly handled invalid API key: ${error.message}`);
  }
  
  // Test with invalid API key for Anthropic
  try {
    console.log("🧪 Testing Anthropic error handling with invalid API key...");
    const invalidAnthropic = new Anthropic({ apiKey: "invalid_key_sk_ant" });
    
    await invalidAnthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      messages: [{ role: "user", content: "Hello" }],
    });
    
  } catch (error) {
    console.log(`✅ Anthropic correctly handled invalid API key: ${error.message}`);
  }
}

async function runTests() {
  console.log("🚀 Starting AI Services Tests");
  console.log("===========================\n");
  
  // Run tests
  await testOpenAI();
  await testAnthropic();
  await testErrorHandling();
  
  console.log("\n✨ All tests completed");
}

runTests().catch(error => {
  console.error("❌ Test execution failed:", error);
});