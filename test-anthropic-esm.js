/**
 * Test script for SmartDispute.ai Anthropic Claude integration (ESM version)
 * 
 * This script tests the Anthropic Claude integration capabilities,
 * including text analysis, document generation, and vision features.
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Check if the Anthropic API key is configured
const isConfigured = !!process.env.ANTHROPIC_API_KEY;

// Sample text for testing
const sampleText = `
NOTICE OF EVICTION

Date: April 1, 2025
Property Address: 123 Main Street, Unit 4B
Tenant Name: John Smith

Dear Mr. Smith,

This letter serves as a formal notice that you are being evicted from the above-referenced premises due to non-payment of rent. According to our records, you have failed to pay rent in the amount of $1,200 for the month of March 2025.

As per the terms of your lease agreement and in accordance with the Residential Tenancies Act, you are hereby given 14 days' notice to vacate the premises. If you fail to vacate by April 15, 2025, we will commence legal proceedings for possession of the property and recovery of all unpaid rent, late fees, and legal costs.

You may prevent this eviction by paying the full amount owed ($1,200) plus the applicable late fee ($50) within 7 days of receipt of this notice.

If you have any questions regarding this notice, please contact our office at (555) 123-4567.

Sincerely,
Jane Doe
Property Manager
ABC Property Management
`;

/**
 * Test basic text analysis with Claude
 */
async function testTextAnalysis() {
  console.log('=== Testing Text Analysis with Claude ===');
  
  if (!isConfigured) {
    console.log('❌ Anthropic API key is not configured. Skipping test.');
    return;
  }
  
  try {
    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      max_tokens: 1024,
      model: 'claude-3-7-sonnet-20250219',
      system: "You are a legal analysis assistant. Analyze the provided document carefully and respond with a structured JSON object containing:\n"
             + "- documentType: The type of legal document\n"
             + "- issueType: The primary issue addressed\n"
             + "- relevantLaw: The relevant law or legislation mentioned\n"
             + "- urgencyLevel: How urgent this matter is (Critical, High, Medium, Low)\n"
             + "- keyPoints: An array of the most important points from the document\n"
             + "- nextSteps: An array of recommended actions for the recipient\n"
             + "- meritWeight: A score from 0 to 1 representing the strength of the case for the tenant",
      messages: [
        {
          role: 'user',
          content: sampleText
        }
      ],
    });
    
    console.log('✅ Text analysis successful!');
    const textContent = response.content[0].text;
    
    try {
      const jsonResult = JSON.parse(textContent);
      console.log('Analysis result:', JSON.stringify(jsonResult, null, 2));
    } catch (jsonError) {
      console.log('Warning: Response is not in JSON format');
      console.log('Raw response:', textContent);
    }
  } catch (error) {
    console.error('❌ Error in text analysis:', error.message);
  }
}

/**
 * Test generating a response letter
 */
async function testResponseGeneration() {
  console.log('\n=== Testing Response Letter Generation ===');
  
  if (!isConfigured) {
    console.log('❌ Anthropic API key is not configured. Skipping test.');
    return;
  }
  
  try {
    // Analysis data (usually from the previous analysis step)
    const analysis = {
      documentType: "Eviction Notice",
      issueType: "Non-payment of rent",
      relevantLaw: "Residential Tenancies Act",
      urgencyLevel: "High",
      keyPoints: [
        "Tenant is being evicted for non-payment of $1,200 for March 2025",
        "14 days' notice period ending April 15, 2025",
        "Option to prevent eviction by paying $1,250 within 7 days"
      ],
      nextSteps: [
        "Verify the claimed non-payment",
        "Check if proper notice period is being given per local laws",
        "Consider paying the amount if accurate or dispute if incorrect"
      ],
      meritWeight: 0.65
    };
    
    // User information for personalization
    const userInfo = {
      name: "John Smith",
      address: "123 Main Street, Unit 4B, Toronto, ON",
      email: "john.smith@example.com"
    };
    
    // Generate response with Claude
    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      max_tokens: 2048,
      model: 'claude-3-7-sonnet-20250219',
      system: "You are a legal assistant helping tenants respond to notices. Generate a formal, professional response letter based on the analysis and original text provided. The letter should be in HTML format with proper formatting.",
      messages: [
        {
          role: 'user',
          content: `Here is the analysis of an eviction notice: ${JSON.stringify(analysis)}\n\nHere is the original notice: ${sampleText}\n\nPlease generate a response letter from the tenant (${userInfo.name}) addressing this eviction notice. Use tenant information: ${JSON.stringify(userInfo)}.`
        }
      ],
    });
    
    console.log('✅ Response generation successful!');
    console.log('\nGenerated Response (Preview):');
    const htmlContent = response.content[0].text;
    
    // Output a preview of the HTML
    const previewLength = 500;
    console.log(htmlContent.length > previewLength 
      ? htmlContent.substring(0, previewLength) + '...' 
      : htmlContent);
  } catch (error) {
    console.error('❌ Error in response generation:', error.message);
  }
}

/**
 * Test image analysis with Claude Vision capabilities
 */
async function testImageAnalysis() {
  console.log('\n=== Testing Image Analysis with Claude Vision ===');
  
  if (!isConfigured) {
    console.log('❌ Anthropic API key is not configured. Skipping test.');
    return;
  }
  
  try {
    // Try to find a test image
    const testImagePath = path.join(__dirname, 'static', 'sample_document.png');
    const fallbackImagePath = path.join(__dirname, 'public', 'logo.png');
    
    let imagePath;
    if (fs.existsSync(testImagePath)) {
      imagePath = testImagePath;
    } else if (fs.existsSync(fallbackImagePath)) {
      imagePath = fallbackImagePath;
      console.log('Note: Using logo image for testing as no sample document was found.');
    } else {
      console.log('❌ No test image found. Skipping image analysis test.');
      return;
    }
    
    // Read the image file
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    
    // Analyze the image with Claude
    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      max_tokens: 1024,
      model: 'claude-3-7-sonnet-20250219',
      system: "You are a document analysis assistant. Analyze the image and extract any visible text, key information, and describe the document type.",
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this document image and extract any text and important information.'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64Image
              }
            }
          ]
        }
      ],
    });
    
    console.log('✅ Image analysis successful!');
    console.log('\nImage Analysis Result:');
    console.log(response.content[0].text);
  } catch (error) {
    console.error('❌ Error in image analysis:', error.message);
  }
}

/**
 * Main function to run all tests
 */
async function runAllTests() {
  console.log('=== ANTHROPIC CLAUDE INTEGRATION TEST ===');
  console.log('API Key Status:', isConfigured ? '✅ Configured' : '❌ Not Configured');
  console.log('Model: claude-3-7-sonnet-20250219\n');
  
  if (!isConfigured) {
    console.log('Please set the ANTHROPIC_API_KEY environment variable to run the tests.');
    return;
  }
  
  try {
    await testTextAnalysis();
    await testResponseGeneration();
    await testImageAnalysis();
    
    console.log('\n=== ALL TESTS COMPLETED ===');
  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
});