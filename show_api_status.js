/**
 * Anthropic API Status Checker
 * Simple script to check the availability of the Anthropic API key
 */

// Import dotenv to load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Print API status information
function checkApiStatus() {
  console.log('\n===== SmartDispute.ai API Configuration =====\n');
  
  // Check for Anthropic API key
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  console.log(`Anthropic API Key: ${anthropicApiKey ? '✅ Present' : '❌ Missing'}`);
  
  if (anthropicApiKey) {
    // Validate API key format
    const isValidFormat = anthropicApiKey.startsWith('sk-');
    console.log(`API Key Format: ${isValidFormat ? '✅ Valid (starts with sk-)' : '❌ Invalid (should start with sk-)'}`);
    
    // Show first few characters of API key for verification (safely)
    if (anthropicApiKey.length > 8) {
      const masked = `${anthropicApiKey.substring(0, 5)}${'*'.repeat(anthropicApiKey.length - 8)}${anthropicApiKey.substring(anthropicApiKey.length - 3)}`;
      console.log(`API Key Preview: ${masked}`);
    }
  }
  
  // Check for OpenAI API key as well
  const openaiApiKey = process.env.OPENAI_API_KEY;
  console.log(`\nOpenAI API Key: ${openaiApiKey ? '✅ Present' : '❌ Missing'}`);
  
  // Mock mode status
  const usingMockMode = (!anthropicApiKey || !anthropicApiKey.startsWith('sk-')) && 
                         (!openaiApiKey);
  
  console.log(`\nApplication Mode: ${usingMockMode ? '🔶 MOCK MODE (using simulated responses)' : '✅ LIVE MODE (using actual API)'}`);
  
  // Show current model configuration
  console.log('\nCurrent Model Configuration:');
  console.log('- Anthropic: claude-3-5-sonnet-20241022');
  console.log('- OpenAI: gpt-4o');
  
  console.log('\n=========================================\n');
}

// Run the check
checkApiStatus();