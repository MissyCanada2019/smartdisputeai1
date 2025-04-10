/**
 * Test script for AI service fallback capabilities
 * 
 * This script tests the AI service's ability to fall back to
 * alternative providers when the primary provider fails.
 */

import * as aiService from './server/services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Backup the original environment variables
const originalEnv = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MOCK_MODE: process.env.MOCK_MODE
};

// Sample test text
const testText = `
NOTICE OF EVICTION

Date: April 1, 2025
Property Address: 123 Main Street, Unit 4B
Tenant Name: John Smith

This letter serves as a formal notice that you are being evicted from the above-referenced premises due to non-payment of rent.
`;

// Function to restore original environment
function restoreEnv() {
  process.env.ANTHROPIC_API_KEY = originalEnv.ANTHROPIC_API_KEY;
  process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY;
  process.env.MOCK_MODE = originalEnv.MOCK_MODE;
}

// Test scenarios
async function runTests() {
  console.log('=== TESTING AI SERVICE FALLBACK CAPABILITIES ===');
  
  try {
    // Scenario 1: Both services available
    console.log('\n1. Testing with both services available...');
    process.env.MOCK_MODE = 'false';
    const status1 = await aiService.checkAllServices();
    console.log('Status:');
    console.log('- Anthropic:', status1.anthropic.available ? 'Available' : 'Unavailable');
    console.log('- OpenAI:', status1.openai.available ? 'Available' : 'Unavailable');
    
    if (status1.anthropic.available && status1.openai.available) {
      console.log('Both services are available, proceeding with dual-service test...');
      const result1 = await aiService.analyzeText(testText);
      console.log('Analysis completed successfully with both services available.');
      console.log('Result type:', result1.documentType);
    } else {
      console.log('Skipping dual-service test since not all services are available.');
    }
    
    // Scenario 2: Only Anthropic available (OpenAI disabled)
    console.log('\n2. Testing with only Anthropic available...');
    const backupOpenAI = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = '';
    
    const status2 = await aiService.checkAllServices();
    console.log('Status:');
    console.log('- Anthropic:', status2.anthropic.available ? 'Available' : 'Unavailable');
    console.log('- OpenAI:', status2.openai.available ? 'Available' : 'Unavailable');
    
    if (status2.anthropic.available) {
      console.log('Anthropic is available, testing with OpenAI disabled...');
      const result2 = await aiService.analyzeText(testText);
      console.log('Analysis completed successfully with only Anthropic available.');
      console.log('Result type:', result2.documentType);
    } else {
      console.log('Skipping Anthropic-only test since Anthropic is not available.');
    }
    
    // Restore OpenAI key
    process.env.OPENAI_API_KEY = backupOpenAI;
    
    // Scenario 3: Only OpenAI available (Anthropic disabled)
    console.log('\n3. Testing with only OpenAI available...');
    const backupAnthropic = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = '';
    
    const status3 = await aiService.checkAllServices();
    console.log('Status:');
    console.log('- Anthropic:', status3.anthropic.available ? 'Available' : 'Unavailable');
    console.log('- OpenAI:', status3.openai.available ? 'Available' : 'Unavailable');
    
    if (status3.openai.available) {
      console.log('OpenAI is available, testing with Anthropic disabled...');
      const result3 = await aiService.analyzeText(testText);
      console.log('Analysis completed successfully with only OpenAI available.');
      console.log('Result type:', result3.documentType);
    } else {
      console.log('Skipping OpenAI-only test since OpenAI is not available.');
    }
    
    // Restore Anthropic key
    process.env.ANTHROPIC_API_KEY = backupAnthropic;
    
    // Scenario 4: Mock mode (both services disabled)
    console.log('\n4. Testing with Mock mode enabled (both services disabled)...');
    process.env.ANTHROPIC_API_KEY = '';
    process.env.OPENAI_API_KEY = '';
    process.env.MOCK_MODE = 'true';
    
    const status4 = await aiService.checkAllServices();
    console.log('Status:');
    console.log('- Anthropic:', status4.anthropic.available ? 'Available' : 'Unavailable');
    console.log('- OpenAI:', status4.openai.available ? 'Available' : 'Unavailable');
    console.log('- Mock Mode:', status4.mockMode ? 'Enabled' : 'Disabled');
    
    console.log('Testing with mock mode enabled...');
    const result4 = await aiService.analyzeText(testText);
    console.log('Analysis completed successfully in mock mode.');
    console.log('Result type:', result4.documentType);
    
    // Test multi-function capabilities with mock mode
    console.log('\nTesting other functions in mock mode:');
    
    // Response generation
    console.log('- Testing response generation...');
    const respResult = await aiService.generateResponse(result4, testText, { name: 'Test User' });
    console.log('  Response generation successful, length:', respResult.length);
    
    // Chat
    console.log('- Testing chat functionality...');
    const chatResult = await aiService.chat('What are my rights as a tenant?');
    console.log('  Chat successful, length:', chatResult.length);
    
    // Merit weight calculation
    console.log('- Testing merit weight calculation...');
    const meritWeight = aiService.calculateMeritWeight(result4);
    const meritRating = aiService.getMeritRating(meritWeight);
    console.log('  Calculated merit weight:', meritWeight);
    console.log('  Merit rating:', meritRating);
    
    console.log('\n=== ALL TESTS COMPLETED ===');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Always restore the original environment
    restoreEnv();
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Tests failed with error:', error);
  restoreEnv(); // Ensure environment is restored even if tests fail
});