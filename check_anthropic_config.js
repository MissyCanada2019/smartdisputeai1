/**
 * Anthropic Configuration Checker
 * This script verifies the current Anthropic SDK configuration and environment
 */

// Import dependencies
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { createRequire } from 'module';

// Setup environment
dotenv.config();

// Get package info using createRequire for JSON imports
const require = createRequire(import.meta.url);
const packageVersion = require('@anthropic-ai/sdk/package.json').version;

// Check the Anthropic API configuration
function checkAnthropicConfig() {
  console.log('\n===== Anthropic API Configuration Check =====\n');
  
  // Display SDK version
  console.log(`Anthropic SDK Version: ${packageVersion}`);
  
  // Check for required environment variables
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log(`\nAPI Key Status: ${apiKey ? '✅ Present' : '❌ Missing'}`);
  
  if (apiKey) {
    // Validate API key format
    const isValidFormat = apiKey.startsWith('sk-');
    console.log(`API Key Format: ${isValidFormat ? '✅ Valid (starts with sk-)' : '❌ Invalid (should start with sk-)'}`);
    
    // Show first few characters of API key for verification (safely)
    if (apiKey.length > 8) {
      console.log(`API Key Preview: ${apiKey.substring(0, 5)}${'*'.repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 3)}`);
    }
  }
  
  // List available Claude models
  console.log('\nAvailable Claude Models:');
  console.log('- claude-3-5-sonnet-20241022 (Latest stable release)');
  console.log('- claude-3-opus-20240229');
  console.log('- claude-3-sonnet-20240229');
  console.log('- claude-3-haiku-20240307');
  
  // Check the current model used in our application
  console.log('\nCurrent model set in application: claude-3-5-sonnet-20241022');
  
  // Mock mode status
  const mockMode = !apiKey || !apiKey.startsWith('sk-');
  console.log(`\nApplication Mode: ${mockMode ? '🔶 MOCK MODE (using simulated responses)' : '✅ LIVE MODE (using actual API)'}`);
  
  console.log('\n===========================================\n');
}

// Run the check when executed directly
if (import.meta.url === import.meta.main) {
  checkAnthropicConfig();
}

// Export for use in other modules
export { checkAnthropicConfig };