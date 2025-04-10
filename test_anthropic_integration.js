/**
 * Anthropic API Integration Test Script
 * This script tests the connection to Anthropic API using the updated Claude model
 */

// Import dependencies
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Anthropic client with API key from environment
async function testAnthropicConnection() {
  console.log('\n=== Testing Anthropic API Connection ===\n');
  
  try {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('Error: No ANTHROPIC_API_KEY found in environment variables');
      console.log('Please set a valid API key to continue');
      return false;
    }
    
    // Check if API key has correct format (should start with 'sk-')
    if (!apiKey.startsWith('sk-')) {
      console.error('Error: ANTHROPIC_API_KEY does not have correct format (should start with "sk-")');
      console.log('Current format:', apiKey.slice(0, 5) + '...');
      return false;
    }
    
    console.log('API key found with correct format');
    
    // Initialize client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    console.log('Client initialized, testing API call...');
    
    // Make a simple API call to test connection
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      messages: [
        { role: "user", content: "Hello Claude, please respond with your model name and a brief greeting." }
      ]
    });
    
    console.log('\nAPI Response:');
    console.log('Model:', response.model);
    console.log('Content:', response.content[0].text);
    
    console.log('\n✅ Anthropic API connection successful!\n');
    return true;
    
  } catch (error) {
    console.error('\n❌ Error connecting to Anthropic API:');
    console.error(error.message);
    
    if (error.message.includes('401')) {
      console.log('\nThis likely indicates an invalid API key. Please check your API key and try again.');
    } else if (error.message.includes('429')) {
      console.log('\nYou have exceeded your rate limit. Please wait and try again later.');
    }
    
    return false;
  }
}

// Run the test immediately
console.log('Starting Anthropic API test...');
testAnthropicConnection().then((success) => {
  if (!success) {
    console.log('\nTest failed! Please check your API key and network connection.');
    // Exit with non-zero status to indicate failure
    process.exit(1);
  }
});

// Export for use in other modules
export { testAnthropicConnection };