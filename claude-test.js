// Simple test script for Claude API functionality
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client with API key
// Note: This is only needed for direct API calls, our API endpoints handle this server-side
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function to test text analysis with Claude
async function testTextAnalysis(text) {
  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{ role: 'user', content: text }],
      model: 'claude-3-7-sonnet-20250219',
    });

    console.log('Text Analysis Result:');
    console.log(message.content[0].text);
    return message.content[0].text;
  } catch (error) {
    console.error('Error in text analysis:', error.message);
    throw error;
  }
}

// Function to test image analysis with Claude (multimodal)
async function testImageAnalysis(base64Image, prompt) {
  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt || "Analyze this image in detail and describe what you see."
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    console.log('Image Analysis Result:');
    console.log(response.content[0].text);
    return response.content[0].text;
  } catch (error) {
    console.error('Error in image analysis:', error.message);
    throw error;
  }
}

// Function to test legal situation analysis
async function testLegalAnalysis(situation, returnJson = false) {
  try {
    let systemPrompt = "You're a legal assistant specializing in Canadian law. Analyze the described situation and provide insights.";
    
    if (returnJson) {
      systemPrompt += " Respond with a JSON object that includes the following keys: 'legalIssues', 'applicableLaws', 'possibleActions', 'risks', and 'recommendations'.";
    }

    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: systemPrompt,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: situation }
      ],
    });

    console.log('Legal Analysis Result:');
    console.log(response.content[0].text);
    
    if (returnJson) {
      try {
        return JSON.parse(response.content[0].text);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        return response.content[0].text;
      }
    }
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error in legal analysis:', error.message);
    throw error;
  }
}

// Export the test functions
export {
  testTextAnalysis,
  testImageAnalysis,
  testLegalAnalysis
};