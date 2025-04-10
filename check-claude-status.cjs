/**
 * Claude API Status Check Script for SmartDispute.ai
 * 
 * This script checks if the Anthropic Claude API is available and functioning.
 * It verifies that the API key is valid and that the Claude model can be accessed.
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Anthropic client
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

async function checkClaudeStatus() {
  console.log('Checking Claude API status...');
  
  // Check if API key is present
  if (!apiKey) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY environment variable is not set');
    console.log('Please set a valid API key in your .env file or environment variables');
    return false;
  }
  
  // Check if client can be initialized
  if (!anthropic) {
    console.error('❌ ERROR: Could not initialize Anthropic client');
    return false;
  }
  
  try {
    // Attempt a simple API call
    // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 10,
      messages: [
        { role: 'user', content: 'Say hello' }
      ]
    });
    
    if (response && response.content && response.content[0] && response.content[0].text) {
      console.log('✅ SUCCESS: Claude API is accessible and working properly');
      console.log(`Model: claude-3-7-sonnet-20250219`);
      console.log(`Response: "${response.content[0].text}"`);
      return true;
    } else {
      console.error('❌ ERROR: Received invalid response from Claude API');
      console.log('Response:', JSON.stringify(response));
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to access Claude API');
    console.error(`Error details: ${error.message}`);
    
    if (error.status === 401) {
      console.log('This appears to be an authentication error. Your API key may be invalid or expired.');
    } else if (error.status === 429) {
      console.log('You have hit rate limits or your account has insufficient credits.');
    } else if ([500, 502, 503, 504].includes(error.status)) {
      console.log('This appears to be a server-side issue with Anthropic. The service may be experiencing downtime.');
    }
    
    return false;
  }
}

// Run the status check
checkClaudeStatus()
  .then(isWorking => {
    console.log('\nStatus check complete.');
    if (!isWorking) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Verify your API key is correctly entered in the .env file');
      console.log('2. Check your Anthropic account has sufficient credits');
      console.log('3. Ensure your network allows connections to Anthropic\'s API');
      console.log('4. Verify you\'re using the correct model name ("claude-3-7-sonnet-20250219")');
    }
    process.exit(isWorking ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error during status check:', error);
    process.exit(1);
  });