/**
 * API Status Checker for SmartDispute.ai
 * 
 * This script checks the status of all AI service providers
 * and shows which ones are available, with basic testing capabilities.
 */

// Import required modules
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Function to mask API keys for display
function maskApiKey(key) {
  if (!key) return 'Not configured';
  if (key.length <= 8) return '****';
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

// Main function to check API status
async function checkApiStatus() {
  console.log('=== SmartDispute.ai API Status Check ===');
  console.log('Checking API keys and service availability...\n');

  // Check Anthropic Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const anthropicStatus = {
    configured: !!anthropicKey,
    available: false,
    version: 'claude-3-7-sonnet-20250219',
    error: null
  };

  console.log('Anthropic Claude:');
  console.log(`API Key: ${anthropicKey ? maskApiKey(anthropicKey) : 'Not configured'}`);

  if (anthropicKey) {
    try {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello, are you working? Reply with only yes or no.' }],
      });
      anthropicStatus.available = true;
      console.log('Status: ✅ Available');
      console.log(`Model: ${anthropicStatus.version}`);
      console.log(`Response: ${response.content[0].text.trim()}\n`);
    } catch (error) {
      anthropicStatus.error = error.message;
      console.log('Status: ❌ Error');
      console.log(`Error: ${error.message}\n`);
    }
  } else {
    console.log('Status: ⚠️ Not configured\n');
  }

  // Check OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiStatus = {
    configured: !!openaiKey,
    available: false,
    version: 'gpt-4o',
    error: null
  };

  console.log('OpenAI:');
  console.log(`API Key: ${openaiKey ? maskApiKey(openaiKey) : 'Not configured'}`);

  if (openaiKey) {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Hello, are you working? Reply with only yes or no." }],
        max_tokens: 10,
      });
      openaiStatus.available = true;
      console.log('Status: ✅ Available');
      console.log(`Model: ${openaiStatus.version}`);
      console.log(`Response: ${response.choices[0].message.content.trim()}\n`);
    } catch (error) {
      openaiStatus.error = error.message;
      console.log('Status: ❌ Error');
      console.log(`Error: ${error.message}\n`);
    }
  } else {
    console.log('Status: ⚠️ Not configured\n');
  }

  // Check if mock mode is enabled
  const mockModeEnabled = process.env.ENABLE_MOCK_MODE === 'true';
  console.log('Mock Mode:');
  console.log(`Status: ${mockModeEnabled ? '✅ Enabled' : '❌ Disabled'}`);

  // Determine default provider
  let defaultProvider = 'None';
  if (anthropicStatus.available) {
    defaultProvider = 'Anthropic Claude';
  } else if (openaiStatus.available) {
    defaultProvider = 'OpenAI';
  } else if (mockModeEnabled) {
    defaultProvider = 'Mock Mode';
  }

  console.log(`\nDefault Provider: ${defaultProvider}`);

  // Display summary
  console.log('\n=== SUMMARY ===');
  console.log(`Anthropic Claude: ${anthropicStatus.available ? '✅ Available' : anthropicStatus.configured ? '❌ Error' : '⚠️ Not configured'}`);
  console.log(`OpenAI: ${openaiStatus.available ? '✅ Available' : openaiStatus.configured ? '❌ Error' : '⚠️ Not configured'}`);
  console.log(`Mock Mode: ${mockModeEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`Default Provider: ${defaultProvider}`);

  // Provide recommendations
  console.log('\n=== RECOMMENDATIONS ===');
  if (!anthropicStatus.available && !openaiStatus.available && !mockModeEnabled) {
    console.log('❌ Critical: No AI providers are available. Configure at least one API key or enable mock mode.');
  } else if ((anthropicStatus.available || openaiStatus.available) && !mockModeEnabled) {
    console.log('⚠️ Warning: Consider enabling mock mode as a fallback for when API services are unavailable.');
  } else if (!anthropicStatus.available && !openaiStatus.available && mockModeEnabled) {
    console.log('⚠️ Warning: Running in mock mode only. For production use, configure at least one API service.');
  } else {
    console.log('✅ Good configuration: Multiple providers available with fallback options.');
  }

  // Return full status object for potential use by other scripts
  return {
    anthropic: anthropicStatus,
    openai: openaiStatus,
    mockMode: mockModeEnabled,
    defaultProvider
  };
}

// Execute the check if this script is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkApiStatus().catch(error => {
    console.error('Fatal error running API status check:', error);
  });
}

// Export the function for use in other modules
export default checkApiStatus;