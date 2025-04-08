/**
 * Test script for the latest Anthropic Claude API using Node.js SDK
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

// Initialize the client
const client = new Anthropic();

async function testTextAnalysis(text) {
  try {
    console.log('Testing basic text analysis...');
    const response = await client.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      max_tokens: 500,
      messages: [
        { role: "user", content: text || "Write a one-sentence bedtime story about a unicorn." }
      ],
    });
    
    console.log('Text analysis result:');
    console.log(response.content[0].text);
    console.log('\n' + '-'.repeat(50) + '\n');
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error in Claude text analysis:');
    console.error(error);
    throw error;
  }
}

async function testImageAnalysis(base64Image, prompt) {
  if (!base64Image) {
    console.error('Base64 image data required');
    return;
  }
  
  try {
    console.log('Testing image analysis...');
    const response = await client.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt || "Analyze this image in detail."
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
        }
      ]
    });
    
    console.log('Image analysis result:');
    console.log(response.content[0].text);
    console.log('\n' + '-'.repeat(50) + '\n');
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error in Claude image analysis:');
    console.error(error);
    throw error;
  }
}

async function testLegalAnalysis(situation, returnJson = false) {
  try {
    console.log('Testing legal analysis...');
    
    const systemPrompt = `
    You are a legal assistance AI specialized in Canadian law.
    Your goal is to provide helpful information and guidance to individuals who may not be able to afford legal representation.
    
    IMPORTANT DISCLAIMERS:
    1. You are not a lawyer and cannot provide legal advice.
    2. Your analysis is for informational purposes only and should not be considered legal advice.
    3. You should encourage users to seek professional legal counsel for their specific situation.
    `;
    
    let message = situation || "I received a notice from my landlord saying I have to move out in 14 days. Is this legal in Ontario?";
    
    if (returnJson) {
      message += "\n\nPlease respond in JSON format with the following structure: { 'legalIssue': 'identification of the legal issue', 'relevantLaws': ['list of relevant laws'], 'possibleSteps': ['possible steps to take'], 'timeframe': 'any relevant timeframes' }";
    }
    
    const response = await client.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: "user", content: message }
      ]
    });
    
    console.log('Legal analysis result:');
    console.log(response.content[0].text);
    console.log('\n' + '-'.repeat(50) + '\n');
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error in Claude legal analysis:');
    console.error(error);
    throw error;
  }
}

// If this script is run directly, test the functions
if (process.argv[1].includes('claude-test')) {
  console.log("Running Claude API tests...");
  
  const testText = "What are some key considerations when facing eviction in Canada?";
  testTextAnalysis(testText)
    .then(() => console.log("Text analysis test completed"))
    .catch(err => console.error("Text analysis test failed:", err));
  
  // Note: Image testing requires a base64 image to be passed in
  
  const legalSituation = "I received a notice that says I violated my lease by having a pet, but my lease doesn't say anything about pets. What should I do?";
  testLegalAnalysis(legalSituation)
    .then(() => console.log("Legal analysis test completed"))
    .catch(err => console.error("Legal analysis test failed:", err));
}