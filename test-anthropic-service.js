/**
 * Test script for Anthropic Claude service integration in SmartDispute.ai
 * Tests the various functions of the Claude service and error handling
 */

// Import required modules
import 'dotenv/config';
import fs from 'fs';
import { promisify } from 'util';
import anthropicService from './server/services/anthropic.js';

const readFile = promisify(fs.readFile);

// Test configuration
const TEST_TEXT = `
This is a Notice of Eviction from landlord John Smith to tenant Maria Garcia at 123 Main St, Toronto, ON.
The eviction is scheduled for July 15, 2025, citing unpaid rent for June 2025 in the amount of $1,500.
The tenancy is governed by the Ontario Residential Tenancies Act.
`;

const TEST_SITUATION = `
I received an eviction notice from my landlord claiming I didn't pay rent, but I have proof of payment via e-transfer.
I live in Toronto, Ontario and have been renting this apartment for 3 years.
`;

const TEST_EVIDENCE = [
  {
    title: "Eviction Notice",
    content: TEST_TEXT,
    description: "Notice received on June 10, 2025"
  },
  {
    title: "Proof of Payment",
    content: "E-transfer receipt #ET12345 showing payment of $1,500 to John Smith on June 1, 2025.",
    description: "Bank confirmation of payment"
  }
];

// Test all API functions with proper error handling
async function runTests() {
  console.log("🧪 Starting Anthropic Claude service integration tests");
  
  try {
    // Check if API key is set
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("❌ ANTHROPIC_API_KEY environment variable is not set. Please set it before running tests.");
      return;
    }
    
    console.log("\n📄 Testing document analysis...");
    try {
      const docResult = await anthropicService.analyzeDocument(TEST_TEXT);
      console.log("✅ Document analysis successful");
      console.log("Result:", JSON.stringify(docResult, null, 2));
    } catch (error) {
      console.error("❌ Document analysis failed:", error.message);
    }

    console.log("\n🧠 Testing legal advice generation...");
    try {
      const adviceResult = await anthropicService.generateLegalAdvice(
        TEST_SITUATION,
        TEST_EVIDENCE,
        "Ontario"
      );
      console.log("✅ Legal advice generation successful");
      console.log("Result:", adviceResult.advice.substring(0, 200) + "...");
    } catch (error) {
      console.error("❌ Legal advice generation failed:", error.message);
    }

    console.log("\n⚖️ Testing legal strategy analysis...");
    try {
      const strategyResult = await anthropicService.analyzeLegalStrategy(
        TEST_SITUATION,
        TEST_EVIDENCE,
        "Ontario"
      );
      console.log("✅ Legal strategy analysis successful");
      console.log("Result:", JSON.stringify(strategyResult, null, 2));
    } catch (error) {
      console.error("❌ Legal strategy analysis failed:", error.message);
    }

    console.log("\n📝 Testing legal document generation...");
    try {
      const documentResult = await anthropicService.generateLegalDocument(
        "Response to Eviction Notice",
        {
          tenant_name: "Maria Garcia",
          landlord_name: "John Smith",
          address: "123 Main St, Toronto, ON",
          eviction_date: "July 15, 2025",
          payment_proof: "E-transfer receipt #ET12345 showing payment of $1,500 on June 1, 2025"
        },
        "Ontario"
      );
      console.log("✅ Legal document generation successful");
      console.log("Result:", documentResult.document.substring(0, 200) + "...");
    } catch (error) {
      console.error("❌ Legal document generation failed:", error.message);
    }

    // Test compatibility functions
    console.log("\n🔄 Testing compatibility functions...");
    try {
      const result1 = await anthropicService.analyzeImageDocument("SGVsbG8sIHdvcmxkIQ=="); // Base64 "Hello, world!"
      console.log("✅ analyzeImageDocument compatibility function works");
    } catch (error) {
      console.error("❌ analyzeImageDocument compatibility function failed:", error.message);
    }

    try {
      const result2 = await anthropicService.compareEvidenceStrategies(
        TEST_SITUATION,
        TEST_EVIDENCE,
        "Ontario"
      );
      console.log("✅ compareEvidenceStrategies compatibility function works");
    } catch (error) {
      console.error("❌ compareEvidenceStrategies compatibility function failed:", error.message);
    }

    console.log("\n✨ All tests completed");
  } catch (error) {
    console.error("❌ Test suite error:", error);
  }
}

// Execute tests
runTests();