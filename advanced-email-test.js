/**
 * Advanced Email Test Script for SmartDispute.ai
 * 
 * This script tests the EmailService with MJML templates and attachments
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import emailService from './server/services/emailService.js';

// Initialize dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test document
const createTestDocument = () => {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testDocumentPath = path.join(testDir, 'test-document.txt');
  fs.writeFileSync(
    testDocumentPath,
    'This is a test document for SmartDispute.ai email service.\n\n' +
    'It contains sample content that would be analyzed by the AI system.\n\n' +
    'In a real scenario, this would be a PDF or docx file with legal content.'
  );
  
  console.log(`✅ Created test document at ${testDocumentPath}`);
  return testDocumentPath;
};

// Tests for the email service
const runTests = async () => {
  console.log('🧪 RUNNING EMAIL SERVICE TESTS');
  console.log('=============================');
  
  // Test 1: Verify connection
  console.log('\n🔄 Test 1: Verifying SMTP connection...');
  const connectionValid = await emailService.verifyConnection();
  
  if (!connectionValid) {
    console.error('❌ SMTP connection verification failed. Check your credentials.');
    console.log('\nMake sure you have these environment variables set in .env:');
    console.log('  - EMAIL_SERVICE (e.g. gmail)');
    console.log('  - EMAIL_USER (your email address)');
    console.log('  - EMAIL_PASSWORD (your email password or app password)');
    return false;
  }
  
  console.log('✅ SMTP connection verified successfully.');
  
  // Test 2: Send a simple email
  if (process.argv.includes('--send-simple')) {
    console.log('\n🔄 Test 2: Sending simple email...');
    const recipient = process.argv[2] || 'test@example.com';
    
    const simpleResult = await emailService.sendEmail({
      to: recipient,
      subject: 'SmartDispute.ai - Simple Email Test',
      text: 'This is a simple test email from SmartDispute.ai email service.',
      html: '<h1>SmartDispute.ai Test</h1><p>This is a <b>simple test</b> email from SmartDispute.ai email service.</p>'
    });
    
    if (!simpleResult.success) {
      console.error(`❌ Simple email test failed: ${simpleResult.error}`);
      return false;
    }
    
    console.log(`✅ Simple email sent successfully to ${recipient}`);
    console.log(`📧 Message ID: ${simpleResult.messageId}`);
  }
  
  // Test 3: Send an email with template
  if (process.argv.includes('--send-template')) {
    console.log('\n🔄 Test 3: Sending template email...');
    const recipient = process.argv[2] || 'test@example.com';
    
    const templateResult = await emailService.sendTemplateEmail({
      to: recipient,
      subject: 'SmartDispute.ai - Template Email Test',
      templateName: 'test-template',
      data: {
        name: 'Test User',
        date: new Date().toISOString(),
        testId: Math.floor(Math.random() * 1000000),
        buttonUrl: 'https://smartdispute.ai/dashboard'
      }
    });
    
    if (!templateResult.success) {
      console.error(`❌ Template email test failed: ${templateResult.error}`);
      return false;
    }
    
    console.log(`✅ Template email sent successfully to ${recipient}`);
    console.log(`📧 Message ID: ${templateResult.messageId}`);
  }
  
  // Test 4: Send document
  if (process.argv.includes('--send-document')) {
    console.log('\n🔄 Test 4: Sending document email...');
    const recipient = process.argv[2] || 'test@example.com';
    
    // Create a test document
    const testDocumentPath = createTestDocument();
    
    const documentResult = await emailService.sendDocument({
      to: recipient,
      subject: 'SmartDispute.ai - Document Email Test',
      documentPath: testDocumentPath,
      documentName: 'test-legal-document.txt',
      message: 'Here is your requested legal document. Please review it carefully.'
    });
    
    if (!documentResult.success) {
      console.error(`❌ Document email test failed: ${documentResult.error}`);
      return false;
    }
    
    console.log(`✅ Document email sent successfully to ${recipient}`);
    console.log(`📧 Message ID: ${documentResult.messageId}`);
  }
  
  console.log('\n🎉 All requested email tests completed successfully!');
  return true;
};

// Print usage information
const printUsage = () => {
  console.log('\nUsage:');
  console.log('  node advanced-email-test.js [recipient@example.com] [options]');
  console.log('\nOptions:');
  console.log('  --send-simple    Send a simple text/HTML email');
  console.log('  --send-template  Send an email using MJML template');
  console.log('  --send-document  Send an email with document attachment');
  console.log('  --all            Run all tests');
  console.log('\nExample:');
  console.log('  node advanced-email-test.js user@example.com --all');
};

// Main execution
(async () => {
  console.log('📧 SmartDispute.ai Advanced Email Test');
  console.log('====================================');
  
  // Check if we should run all tests
  if (process.argv.includes('--all')) {
    process.argv.push('--send-simple', '--send-template', '--send-document');
  }
  
  // If no test options provided, just verify connection and show usage
  if (!process.argv.includes('--send-simple') && 
      !process.argv.includes('--send-template') && 
      !process.argv.includes('--send-document')) {
    await emailService.verifyConnection();
    printUsage();
    return;
  }
  
  // Run the tests
  const success = await runTests();
  
  if (success) {
    console.log('\n🚀 Email service is working correctly!');
  } else {
    console.log('\n❌ Email service test failed. Please check the errors above.');
    process.exit(1);
  }
})();