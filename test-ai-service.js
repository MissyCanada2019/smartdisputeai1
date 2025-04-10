/**
 * AI Service Integration Test for SmartDispute.ai
 * 
 * This script tests the unified AI service with automated fallback
 * between Anthropic, OpenAI, and Puter services.
 */

import * as aiService from './server/services/aiService.js';
import 'dotenv/config';

async function runTests() {
  console.log('===== SmartDispute.ai AI Service Test =====');
  console.log('Testing started at:', new Date().toISOString());
  console.log('==========================================');
  
  // Step 1: Test service status
  console.log('\n--- Testing AI Service Status ---');
  try {
    const status = await aiService.getStatus();
    console.log('AI Service Status:', JSON.stringify(status, null, 2));
    
    if (status.systemStatus === 'operational') {
      console.log('✅ System operational');
    } else {
      console.log('⚠️ System not operational. Check API keys and services.');
    }
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    return;
  }
  
  // Step 2: Test text analysis
  console.log('\n--- Testing Text Analysis ---');
  try {
    const sampleText = `
    NOTICE OF EVICTION
    
    Date: March 15, 2025
    
    To: John Doe
    Address: 123 Main Street, Apt 4B, Toronto, ON M4Y 2W7
    
    This letter serves as a formal notice that your tenancy at the above address will be terminated in 60 days, 
    on May 15, 2025, due to the following reason(s):
    
    - Non-payment of rent for February and March 2025, totaling $2,400.00
    - Violation of lease terms regarding noise complaints
    
    In accordance with the Ontario Residential Tenancies Act, 2006, you are required to vacate the premises 
    by the termination date. Failure to do so may result in formal eviction proceedings.
    
    If you have questions about this notice or wish to discuss payment arrangements, please contact the property 
    management office at (416) 555-1234 within 7 days of receiving this notice.
    
    Sincerely,
    
    Jane Smith
    Property Manager
    Maple Leaf Properties
    `;
    
    console.log('Analyzing sample eviction notice text...');
    const analysisResult = await aiService.analyzeText(sampleText, 'ON');
    
    console.log('Analysis completed using:', analysisResult.serviceName, '(', analysisResult.modelName, ')');
    console.log('Analysis result:', JSON.stringify(analysisResult.result, null, 2));
    
    if (analysisResult.result && !analysisResult.error) {
      console.log('✅ Text analysis successful');
    } else {
      console.log('⚠️ Text analysis produced errors or warnings');
    }
  } catch (error) {
    console.error('❌ Text analysis failed:', error.message);
    return;
  }
  
  // Step 3: Test response generation
  console.log('\n--- Testing Response Generation ---');
  try {
    // Mock analysis result if the previous test failed
    const analysisResult = {
      documentType: "Eviction Notice",
      issueCategory: "Housing",
      issueSubcategory: "Tenant Eviction",
      parties: {
        landlord: "Maple Leaf Properties (Jane Smith, Property Manager)",
        tenant: "John Doe"
      },
      keyDates: [
        "March 15, 2025 (Notice Date)",
        "May 15, 2025 (Eviction Date)"
      ],
      legalReferences: ["Ontario Residential Tenancies Act, 2006"],
      responseSuggestions: [
        "Challenge the validity of the noise complaints",
        "Request detailed records of the alleged noise violations",
        "Propose a payment plan for outstanding rent",
        "Request mediation through the Landlord and Tenant Board"
      ],
      riskAssessment: {
        evictionRisk: "High",
        timeframe: "60 days",
        legalStanding: "Moderate"
      },
      nextSteps: [
        "Contact property management within 7 days",
        "Review lease agreement for noise policies",
        "Gather evidence against noise complaints",
        "Consider filing a T2 application with the Landlord and Tenant Board"
      ],
      confidenceScore: 0.85
    };
    
    const sampleText = `NOTICE OF EVICTION: Tenant John Doe at 123 Main Street, Apt 4B, Toronto, ON must vacate in 60 days by May 15, 2025 due to rent non-payment ($2,400.00) and noise violations.`;
    
    const userInfo = {
      name: "John Doe",
      address: "123 Main Street, Apt 4B, Toronto, ON M4Y 2W7",
    };
    
    console.log('Generating response based on analysis...');
    const responseResult = await aiService.generateResponse(analysisResult, sampleText, userInfo, 'ON');
    
    console.log('Response generated using:', responseResult.serviceName, '(', responseResult.modelName, ')');
    console.log('Response preview:', responseResult.result.substring(0, 500) + '...');
    
    if (responseResult.result && !responseResult.error) {
      console.log('✅ Response generation successful');
    } else {
      console.log('⚠️ Response generation produced errors or warnings');
    }
  } catch (error) {
    console.error('❌ Response generation failed:', error.message);
    return;
  }
  
  // Step 4: Test simple chat interface
  console.log('\n--- Testing Chat Interface ---');
  try {
    console.log('Sending test message to chat interface...');
    const chatResult = await aiService.chat('What are my rights as a tenant in Ontario if I receive an eviction notice?');
    
    console.log('Chat response from:', chatResult.serviceName, '(', chatResult.modelName, ')');
    console.log('Chat response preview:', chatResult.result.substring(0, 500) + '...');
    
    if (chatResult.result && !chatResult.error) {
      console.log('✅ Chat interface successful');
    } else {
      console.log('⚠️ Chat interface produced errors or warnings');
    }
  } catch (error) {
    console.error('❌ Chat interface failed:', error.message);
    return;
  }
  
  console.log('\n==========================================');
  console.log('Testing completed at:', new Date().toISOString());
  console.log('==========================================');
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error);
});