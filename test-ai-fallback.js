/**
 * AI Service Fallback Testing Script for SmartDispute.ai
 * 
 * This script tests our AI service with its fallback mechanism:
 * 1. First attempts to use Anthropic API directly
 * 2. Falls back to Puter API if needed
 * 
 * This helps ensure reliability in our document analysis capabilities.
 */

import aiService from './server/services/aiService.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Test the AI service status and capabilities
 */
async function testAIService() {
  console.log('\n===== AI Service Fallback Test =====\n');
  
  // Check initial service status
  console.log('Initial AI Service Status:');
  console.log(aiService.getStatus());
  
  // Test if Anthropic API is directly available
  console.log('\nTesting Anthropic API availability...');
  const isAnthropicAvailable = await aiService.isAnthropicAvailable();
  console.log(`Anthropic API directly available: ${isAnthropicAvailable ? 'Yes ✅' : 'No ❌'}`);
  
  if (!isAnthropicAvailable) {
    console.log('Reason:', aiService.getStatus().lastError);
  }
  
  // Test basic message functionality with fallback if needed
  console.log('\nTesting basic message functionality...');
  try {
    const response = await aiService.sendMessage(
      'What are the key tenant protections under Ontario\'s Residential Tenancies Act?'
    );
    
    console.log('\nResponse received successfully:');
    console.log(response.substring(0, 150) + '...');
    console.log('\nCurrent AI Service Status:');
    console.log(aiService.getStatus());
  } catch (error) {
    console.error('Error in basic message test:', error.message);
  }
  
  // Test document analysis with automatic fallback
  console.log('\nTesting document analysis functionality...');
  
  const sampleDocument = `
    NOTICE OF RENT INCREASE
    
    Date: April 5, 2025
    
    To: Jane Smith
    123 Main Street, Unit 4B
    Toronto, ON M5V 1A1
    
    From: ABC Property Management
    
    This letter serves as formal notice that the rent for your unit at
    123 Main Street, Unit 4B, Toronto, ON M5V 1A1 will increase from
    $1,800 to $2,100 effective July 1, 2025.
    
    This represents an increase of 16.7%.
    
    Sincerely,
    John Doe
    Property Manager
    ABC Property Management
  `;
  
  try {
    console.log('Sending sample document for analysis...');
    const analysis = await aiService.analyzeDocument(sampleDocument, 'ON');
    
    console.log('\nDocument analysis completed successfully:');
    console.log(JSON.stringify(analysis, null, 2));
    
    console.log('\nCurrent AI Service Status:');
    console.log(aiService.getStatus());
    
    // Test response generation based on analysis
    console.log('\nTesting response letter generation...');
    const userInfo = {
      name: 'Jane Smith',
      address: '123 Main Street, Unit 4B, Toronto, ON M5V 1A1',
      email: 'jane.smith@example.com',
      phone: '416-555-1234'
    };
    
    const responseHtml = await aiService.generateResponseLetter(
      analysis, 
      sampleDocument,
      userInfo
    );
    
    console.log('\nResponse letter generated successfully:');
    console.log(responseHtml.substring(0, 200) + '...');
    
    console.log('\nFinal AI Service Status:');
    console.log(aiService.getStatus());
    
  } catch (error) {
    console.error('Error in document analysis test:', error.message);
  }
  
  console.log('\n===== Test Complete =====\n');
}

// Run the test
testAIService();