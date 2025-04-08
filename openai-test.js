/**
 * Test script for the latest OpenAI API using Node.js SDK
 */

import OpenAI from 'openai';
import 'dotenv/config';

// Initialize the client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    // Test basic chat completion
    console.log('Testing basic chat completion...');
    const chatResponse = await client.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: 'user', content: 'Write a one-sentence bedtime story about a unicorn.' }
      ],
    });
    
    console.log('Chat completion result:');
    console.log(chatResponse.choices[0].message.content);
    console.log('\n' + '-'.repeat(50) + '\n');

    // Test JSON response format
    console.log('Testing JSON response format...');
    const jsonResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: 'user', 
          content: 'Generate a simple JSON object with fields: title, summary, and rating (1-5) for a fictional legal document.' 
        }
      ],
      response_format: { type: "json_object" }
    });
    
    console.log('JSON response:');
    console.log(jsonResponse.choices[0].message.content);
    console.log('\n' + '-'.repeat(50) + '\n');

    // Test system messages
    console.log('Testing system messages...');
    const systemResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: 'system', 
          content: 'You are a legal document analyzer specialized in Canadian law. Be concise and professional.' 
        },
        { 
          role: 'user', 
          content: 'What are the key components of a notice of eviction?' 
        }
      ],
    });
    
    console.log('Response with system message:');
    console.log(systemResponse.choices[0].message.content);
    console.log('\n' + '-'.repeat(50) + '\n');

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error in OpenAI API test:');
    console.error(error);
  }
}

// Run the tests
testOpenAI();