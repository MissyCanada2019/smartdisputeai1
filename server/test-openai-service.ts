/**
 * Test script for OpenAI service using the latest SDK and gpt-4o model
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Get from environment variable
});

/**
 * Test basic text generation with GPT-4o
 */
async function testBasicTextGeneration() {
  try {
    console.log('\n🔍 Testing basic text generation with GPT-4o...');
    
    const prompt = 'Write a short paragraph describing the importance of access to legal information for marginalized communities.';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: 'system', content: 'You are a helpful assistant with expertise in legal affairs and social justice.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    console.log('\n✅ GPT-4o Response:');
    console.log(content);
    
    return content;
  } catch (error) {
    console.error('❌ Error testing basic text generation:', error);
    throw error;
  }
}

/**
 * Test JSON structured output with GPT-4o
 */
async function testJsonResponse() {
  try {
    console.log('\n🔍 Testing JSON structured output with GPT-4o...');
    
    const legalSituation = `
    I received a Notice of Termination from my landlord stating I need to vacate my apartment 
    in Toronto within 60 days because they claim they're moving a family member in. I've been 
    living here for 3 years with no issues. I suspect they actually want to raise the rent for 
    a new tenant. What are my rights?
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: 'system', 
          content: 'You are a legal assistant AI that provides information about tenant rights in Ontario, Canada. Respond with structured JSON data only.' 
        },
        { 
          role: 'user', 
          content: `Analyze this tenant situation and provide structured advice: ${legalSituation}` 
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000
    });

    const jsonContent = JSON.parse(response.choices[0].message.content);
    console.log('\n✅ GPT-4o JSON Response:');
    console.log(JSON.stringify(jsonContent, null, 2));
    
    return jsonContent;
  } catch (error) {
    console.error('❌ Error testing JSON response:', error);
    throw error;
  }
}

/**
 * Test legal document analysis
 */
async function testDocumentAnalysis() {
  try {
    console.log('\n🔍 Testing legal document analysis with GPT-4o...');
    
    // Sample legal document (N12 form from Ontario)
    const sampleDocument = `
    NOTICE TO END YOUR TENANCY
    For Landlord's or Purchaser's Own Use
    N12
    
    To: (Tenant's name) John Smith
    
    From: (Landlord's name) Jane Doe
    
    Address of the Rental Unit: 123 Main Street, Unit 4, Toronto, ON M5V 2K7
    
    This is a legal notice that could lead to you being evicted from your home.
    
    I am giving you this notice because I want to end your tenancy. I want you to move out of your rental unit by the following termination date: July 31, 2023
    
    Information About the Termination Date
    The termination date must be at least 60 days from when you give the tenant this notice. Also, the termination date must be the last day of the rental period or, if the tenancy is for a fixed term, the last day of the fixed term.
    
    My Reason for Ending Your Tenancy
    I am giving you this notice because I need the rental unit for:
    [x] Reason 1: I require the rental unit for the purpose of residential occupation for myself.
    [ ] Reason 2: I require the rental unit for the purpose of residential occupation by my spouse.
    [ ] Reason 3: I require the rental unit for the purpose of residential occupation by my child or my spouse's child.
    [ ] Reason 4: I require the rental unit for the purpose of residential occupation by my parent, my spouse's parent or a person who provides or will provide care services to me or my spouse.
    [ ] Reason 5: I require the rental unit for the purpose of residential occupation by a person who provides or will provide care services to me or my spouse, and the person providing the care services is required to live in the rental unit.
    
    Details About the Person Who Will Move Into the Unit:
    Name: Jane Doe
    Description of relationship to landlord: Self
    Description of care services (if applicable): N/A
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: 'system', 
          content: `
          You are a legal document analyzer specialized in tenant-landlord law in Ontario, Canada.
          Analyze legal documents and extract key information in a structured format.
          Focus on identifying document type, key dates, obligations, legal requirements, and potential issues.
          `
        },
        { 
          role: 'user', 
          content: `Analyze this legal document and provide a structured analysis in JSON format:
          
          ${sampleDocument}` 
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000
    });

    const analysisContent = JSON.parse(response.choices[0].message.content);
    console.log('\n✅ GPT-4o Document Analysis Response:');
    console.log(JSON.stringify(analysisContent, null, 2));
    
    return analysisContent;
  } catch (error) {
    console.error('❌ Error testing document analysis:', error);
    throw error;
  }
}

/**
 * Test image analysis (if API key has vision capabilities)
 */
async function testImageAnalysis() {
  try {
    console.log('\n🔍 Testing image analysis with GPT-4o Vision...');
    
    // Path to a sample image (should be a legal document image if available)
    const imagePath = path.join(process.cwd(), 'uploads', 'sample-document.jpg');
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.log('⚠️ Sample image not found. Skipping image analysis test.');
      return null;
    }
    
    // Read and encode image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'This is a legal document image. Analyze it and extract key information about its type, content, and purpose.' 
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const visionContent = response.choices[0].message.content;
    console.log('\n✅ GPT-4o Vision Response:');
    console.log(visionContent);
    
    return visionContent;
  } catch (error) {
    console.error('❌ Error testing image analysis:', error);
    console.log('Note: This might fail if your OpenAI API key does not have GPT-4 Vision access or if the model has changed.');
    return null;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🚀 Starting OpenAI service tests...');
  
  try {
    await testBasicTextGeneration();
    await testJsonResponse();
    await testDocumentAnalysis();
    // Optional: Uncomment to test image analysis
    // await testImageAnalysis();
    
    console.log('\n🎉 All tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export {
  testBasicTextGeneration,
  testJsonResponse,
  testDocumentAnalysis,
  testImageAnalysis,
  runTests
};