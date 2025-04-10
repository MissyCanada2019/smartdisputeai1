/**
 * API Status Checker for SmartDispute.ai
 * 
 * This script checks the status of all AI service providers
 * and shows which ones are available, with basic testing capabilities.
 */

import * as aiService from './server/services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Helper to mask API keys for display
function maskApiKey(key) {
  if (!key) return 'Not configured';
  
  // Show first 4 and last 4 characters, mask the rest
  const firstPart = key.slice(0, 4);
  const lastPart = key.slice(-4);
  const middle = '*'.repeat(Math.min(key.length - 8, 8));
  
  return `${firstPart}${middle}${lastPart}`;
}

// Function to run the status check
async function checkApiStatus() {
  console.log('=== SMARTDISPUTE.AI API SERVICE STATUS ===');
  
  // Environment variables check
  console.log('\nAPI KEY CONFIGURATION:');
  console.log('- ANTHROPIC_API_KEY:', maskApiKey(process.env.ANTHROPIC_API_KEY));
  console.log('- OPENAI_API_KEY:', maskApiKey(process.env.OPENAI_API_KEY));
  console.log('- MOCK_MODE:', process.env.MOCK_MODE === 'true' ? 'Enabled' : 'Disabled');
  
  // Check service status
  console.log('\nSERVICE AVAILABILITY:');
  try {
    const status = await aiService.checkAllServices();
    
    console.log('- Anthropic (Claude):', status.anthropic.available ? '✅ Available' : '❌ Unavailable');
    if (!status.anthropic.available && status.anthropic.error) {
      console.log('  Error:', status.anthropic.error);
    }
    
    console.log('- OpenAI (GPT-4o):', status.openai.available ? '✅ Available' : '❌ Unavailable');
    if (!status.openai.available && status.openai.error) {
      console.log('  Error:', status.openai.error);
    }
    
    console.log('- Mock service:', status.mock.available ? '✅ Available' : '❌ Unavailable');
    console.log('- Default provider:', status.defaultProvider);
    
    // Summary of status
    if (status.anthropic.available || status.openai.available) {
      console.log('\n✅ AI SERVICES ARE OPERATIONAL');
      if (status.anthropic.available && status.openai.available) {
        console.log('Both Anthropic and OpenAI services are available. Fallback system is fully operational.');
      } else if (status.anthropic.available) {
        console.log('Anthropic service is available but OpenAI service is not. Limited fallback capability.');
      } else {
        console.log('OpenAI service is available but Anthropic service is not. Limited fallback capability.');
      }
    } else if (status.mockMode) {
      console.log('\n⚠️ USING MOCK MODE - NO LIVE AI SERVICES');
      console.log('The system will use mock data for AI responses.');
      console.log('To enable real AI services, set up API keys in .env file.');
    } else {
      console.log('\n❌ NO AI SERVICES ARE AVAILABLE');
      console.log('Configure either ANTHROPIC_API_KEY or OPENAI_API_KEY in the .env file.');
      console.log('Or enable MOCK_MODE=true for testing with mock responses.');
    }
  } catch (error) {
    console.error('\n❌ ERROR CHECKING SERVICE STATUS:', error.message);
  }
  
  console.log('\n=== STATUS CHECK COMPLETE ===');
}

// Run the check
checkApiStatus().catch(error => {
  console.error('Status check failed with error:', error);
});