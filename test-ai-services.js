/**
 * Script to test AI services
 * Usage: node test-ai-services.js [openai|anthropic]
 */

// Default to testing both if no argument is provided
const args = process.argv.slice(2);
const serviceToTest = args[0] || 'both';

async function main() {
  console.log('⚙️ Testing AI services...');
  
  // Test OpenAI service
  if (serviceToTest === 'openai' || serviceToTest === 'both') {
    try {
      // Use dynamic import to support ESM modules
      const { runTests: runOpenAITests } = await import('./server/test-openai-service.js');
      await runOpenAITests();
    } catch (error) {
      console.error('❌ Error running OpenAI tests:', error.message);
    }
  }
  
  // Test Anthropic service
  if (serviceToTest === 'anthropic' || serviceToTest === 'both') {
    try {
      // Use dynamic import to support ESM modules
      const { runTests: runAnthropicTests } = await import('./server/test-anthropic-service.js');
      await runAnthropicTests();
    } catch (error) {
      console.error('❌ Error running Anthropic tests:', error.message);
    }
  }
  
  // Invalid argument
  if (serviceToTest !== 'openai' && serviceToTest !== 'anthropic' && serviceToTest !== 'both') {
    console.error('❌ Invalid argument. Please use "openai", "anthropic", or no argument to test both.');
  }
}

main().catch(console.error);