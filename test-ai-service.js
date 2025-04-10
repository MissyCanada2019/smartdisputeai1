/**
 * Test script for SmartDispute.ai unified AI service
 * 
 * This script tests the AI service functionality including fallback
 * and retry capabilities.
 */

import * as aiService from './server/services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample test text
const testText = `
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

// Function to run the tests
async function runTests() {
  console.log('=== TESTING SMARTDISPUTE.AI AI SERVICE ===');
  
  // Check service status
  console.log('\n1. Checking AI service status...');
  try {
    const status = await aiService.checkAllServices();
    console.log('Service status:');
    console.log('- Anthropic (Primary):', status.anthropic.available ? 'Available' : 'Unavailable');
    if (!status.anthropic.available) console.log('  Error:', status.anthropic.error);
    
    console.log('- OpenAI (Secondary):', status.openai.available ? 'Available' : 'Unavailable');
    if (!status.openai.available) console.log('  Error:', status.openai.error);
    
    console.log('- Mock mode:', status.mockMode ? 'Enabled' : 'Disabled');
    console.log('- Default provider:', status.defaultProvider);
  } catch (error) {
    console.error('Error checking service status:', error.message);
  }
  
  // Test text analysis
  console.log('\n2. Testing text analysis...');
  try {
    console.log('Analyzing sample eviction notice...');
    const analysis = await aiService.analyzeText(testText);
    console.log('Analysis result:');
    console.log('- Document type:', analysis.documentType);
    console.log('- Issue type:', analysis.issueType);
    console.log('- Relevant law:', analysis.relevantLaw);
    console.log('- Urgency level:', analysis.urgencyLevel);
    console.log('- Merit weight:', analysis.meritWeight);
    console.log('- Merit rating:', aiService.getMeritRating(aiService.calculateMeritWeight(analysis)));
    console.log('- Confidence score:', analysis.confidenceScore);
    console.log('\nKey points:');
    if (analysis.keyPoints) {
      analysis.keyPoints.forEach((point, index) => {
        console.log(`  ${index + 1}. ${point}`);
      });
    }
    console.log('\nRecommended next steps:');
    if (analysis.nextSteps) {
      analysis.nextSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
    }
  } catch (error) {
    console.error('Error analyzing text:', error.message);
  }
  
  // Test response generation
  console.log('\n3. Testing response generation...');
  try {
    console.log('Generating response to eviction notice...');
    const analysis = await aiService.analyzeText(testText);
    const userInfo = {
      name: 'John Smith',
      address: '123 Main Street, Unit 4B, Toronto, ON',
      email: 'john.smith@example.com',
      phone: '(555) 987-6543'
    };
    
    const responseHtml = await aiService.generateResponse(analysis, testText, userInfo);
    console.log('Response generated successfully. Preview:');
    console.log('-'.repeat(80));
    console.log(responseHtml.substring(0, 500) + '...');
    console.log('-'.repeat(80));
  } catch (error) {
    console.error('Error generating response:', error.message);
  }
  
  // Test chat functionality
  console.log('\n4. Testing chat functionality...');
  try {
    console.log('Sending a chat message...');
    const chatResponse = await aiService.chat('What are my rights as a tenant facing eviction in Ontario?');
    console.log('Chat response:');
    console.log('-'.repeat(80));
    console.log(chatResponse.substring(0, 500) + '...');
    console.log('-'.repeat(80));
  } catch (error) {
    console.error('Error in chat:', error.message);
  }
  
  // Test merit weight calculation
  console.log('\n5. Testing merit weight calculation...');
  const testCases = [
    { meritWeight: 0.1, confidenceScore: 0.8, urgencyLevel: 'Low' },
    { meritWeight: undefined, confidenceScore: 0.7, urgencyLevel: 'Medium' },
    { meritWeight: undefined, confidenceScore: 0.9, urgencyLevel: 'High' },
    { meritWeight: undefined, confidenceScore: undefined, urgencyLevel: 'Critical' },
    { meritWeight: undefined, confidenceScore: 0.3, urgencyLevel: undefined }
  ];
  
  testCases.forEach((testCase, index) => {
    const calculated = aiService.calculateMeritWeight(testCase);
    const rating = aiService.getMeritRating(calculated);
    const color = aiService.getMeritColor(calculated);
    
    console.log(`Test case ${index + 1}:`);
    console.log(`- Input: meritWeight=${testCase.meritWeight}, confidenceScore=${testCase.confidenceScore}, urgencyLevel=${testCase.urgencyLevel}`);
    console.log(`- Calculated merit weight: ${calculated}`);
    console.log(`- Merit rating: ${rating}`);
    console.log(`- Color code: ${color}`);
  });
  
  console.log('\n=== TESTS COMPLETED ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
});