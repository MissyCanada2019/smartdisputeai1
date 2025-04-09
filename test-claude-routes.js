/**
 * Test file for Claude API routes in SmartDispute.ai
 * 
 * This script tests the API endpoints for text, image, and legal situation analysis
 */

// Import required libraries
import fetch from 'node-fetch';
import 'dotenv/config';
import fs from 'fs';

// Constants
const API_BASE = 'http://localhost:3000/api/claude';
const TEST_TEXT = `
This is a Notice of Eviction from landlord John Smith to tenant Maria Garcia at 123 Main St, Toronto, ON.
The eviction is scheduled for July 15, 2025, citing unpaid rent for June 2025 in the amount of $1,500.
The tenancy is governed by the Ontario Residential Tenancies Act.
`;

// Test functions
async function testHealthEndpoint() {
  console.log("📊 Testing Claude API health endpoint");
  
  try {
    const response = await fetch(`${API_BASE}/health`);
    const result = await response.json();
    
    console.log("Status:", response.status);
    console.log("Response:", result);
    
    return result.available;
  } catch (error) {
    console.error(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function testTextAnalysis() {
  console.log("\n📝 Testing text analysis endpoint");
  
  try {
    const response = await fetch(`${API_BASE}/analyze-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: TEST_TEXT,
        context: "Analyze this text for legal implications and extract key information."
      })
    });
    
    const result = await response.json();
    console.log("Status:", response.status);
    if (response.ok) {
      console.log("✅ Text analysis successful");
      console.log("Classification:", result.analysis.classification);
      console.log("Confidence:", result.analysis.confidence);
      console.log("Summary:", result.analysis.summary?.substring(0, 100) + "...");
    } else {
      console.log("❌ Text analysis failed:", result.error || result.message);
    }
  } catch (error) {
    console.error(`❌ Text analysis request failed: ${error.message}`);
  }
}

async function testImageAnalysis() {
  console.log("\n🖼️ Testing image analysis endpoint");
  
  try {
    // Check if we have a test image
    if (!fs.existsSync('./test-image.jpg')) {
      console.log("❌ Test image not found. Please create a test-image.jpg file.");
      return;
    }
    
    // Read and encode the image
    const imageBuffer = fs.readFileSync('./test-image.jpg');
    const base64Image = imageBuffer.toString('base64');
    
    const response = await fetch(`${API_BASE}/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Image,
        prompt: "Analyze this image and extract any text or relevant information."
      })
    });
    
    const result = await response.json();
    console.log("Status:", response.status);
    if (response.ok) {
      console.log("✅ Image analysis successful");
      console.log("Analysis preview:", result.analysis.extractedText?.substring(0, 100) + "...");
    } else {
      console.log("❌ Image analysis failed:", result.error || result.message);
    }
  } catch (error) {
    console.error(`❌ Image analysis request failed: ${error.message}`);
  }
}

async function testLegalSituationAnalysis() {
  console.log("\n⚖️ Testing legal situation analysis endpoint");
  
  const situation = "I received an eviction notice for allegedly not paying rent, but I have proof of payment via e-transfer. The landlord claims I owe $1,500 for June 2025. I've been a tenant at 123 Main St, Toronto for 3 years with no issues until now.";
  
  const evidence = [
    {
      title: "E-transfer Receipt",
      content: "E-transfer confirmation #ET12345 showing payment of $1,500 to John Smith (john.smith@email.com) on June 1, 2025 with reference 'June 2025 Rent'."
    },
    {
      title: "Rental Agreement",
      content: "Lease agreement dated July 1, 2022 between John Smith (landlord) and Maria Garcia (tenant) for property at 123 Main St, Toronto, ON. Monthly rent: $1,500. Term: 1 year with automatic renewal."
    }
  ];
  
  try {
    const response = await fetch(`${API_BASE}/analyze-legal-situation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        situation,
        evidence,
        jurisdiction: "Ontario",
        options: {
          caseType: "Eviction Dispute",
          requestedAnalysis: "Analyze tenant rights and potential defenses"
        }
      })
    });
    
    const result = await response.json();
    console.log("Status:", response.status);
    if (response.ok) {
      console.log("✅ Legal situation analysis successful");
      if (result.analysis.strategies && result.analysis.strategies.length > 0) {
        console.log("Strategies:", result.analysis.strategies.slice(0, 2));
      }
      if (result.analysis.recommendedApproach) {
        console.log("Recommended approach:", result.analysis.recommendedApproach.substring(0, 100) + "...");
      }
    } else {
      console.log("❌ Legal situation analysis failed:", result.error || result.message);
    }
  } catch (error) {
    console.error(`❌ Legal situation analysis request failed: ${error.message}`);
  }
}

async function testDocumentGeneration() {
  console.log("\n📄 Testing document generation endpoint");
  
  const templateType = "Eviction Response Letter";
  const userInputs = {
    tenant_name: "Maria Garcia",
    tenant_address: "123 Main St, Toronto, ON",
    landlord_name: "John Smith",
    rent_amount: "$1,500",
    dispute_reason: "I have proof of payment via e-transfer on June 1, 2025 (receipt #ET12345)",
    date: "June 15, 2025"
  };
  
  try {
    const response = await fetch(`${API_BASE}/generate-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateType,
        userInputs,
        jurisdiction: "Ontario"
      })
    });
    
    const result = await response.json();
    console.log("Status:", response.status);
    if (response.ok) {
      console.log("✅ Document generation successful");
      console.log("Word count:", result.document.wordCount);
      console.log("Paragraph count:", result.document.paragraphCount);
      console.log("Readability score:", result.document.readabilityScore);
      console.log("Document preview:", result.document.document.substring(0, 150) + "...");
    } else {
      console.log("❌ Document generation failed:", result.error || result.message);
    }
  } catch (error) {
    console.error(`❌ Document generation request failed: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log("🧪 Starting Claude API Routes Tests");
  console.log("==================================");
  
  // Check if Claude API is available
  const isAvailable = await testHealthEndpoint();
  
  if (!isAvailable) {
    console.log("\n❌ Claude API is not available. Further tests will likely fail.");
    console.log("Make sure the ANTHROPIC_API_KEY environment variable is set and the server is running.");
    
    // Ask if we should continue anyway
    console.log("\nDo you want to continue with the tests anyway? (y/n)");
    // In a real script, would wait for user input
    console.log("Continuing with tests for demonstration purposes...");
  }
  
  // Run all tests
  await testTextAnalysis();
  await testImageAnalysis();
  await testLegalSituationAnalysis();
  await testDocumentGeneration();
  
  console.log("\n==================================");
  console.log("🏁 All tests completed!");
}

// Run the tests
runTests().catch(error => {
  console.error("Test runner failed:", error);
});