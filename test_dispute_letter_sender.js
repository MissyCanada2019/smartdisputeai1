/**
 * Test Script for SmartDispute.ai Dispute Letter Sender
 * 
 * This script demonstrates how to use the sendDisputeLetter function
 * to send a generated dispute letter via email.
 */

const { sendDisputeLetter } = require('./send_dispute_letter');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Check if EMAIL_USER and EMAIL_PASSWORD are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Error: EMAIL_USER and EMAIL_PASSWORD environment variables must be set.');
  console.log('Please set these variables in your .env file or environment.');
  console.log('Example .env file:');
  console.log('EMAIL_USER=your.email@gmail.com');
  console.log('EMAIL_PASSWORD=your-app-password');
  process.exit(1);
}

// Function to verify email is valid
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const recipientEmail = args[0];
const attachmentPath = args[1];
const disputeType = args[2] || 'credit';
const province = args[3] || 'BC';

// Validate inputs
if (!recipientEmail || !isValidEmail(recipientEmail)) {
  console.error('Error: Valid recipient email address is required.');
  console.log('Usage: node test_dispute_letter_sender.js <recipient_email> <attachment_path> [dispute_type] [province]');
  process.exit(1);
}

if (!attachmentPath || !fileExists(attachmentPath)) {
  console.error(`Error: Valid attachment file path is required. File not found: ${attachmentPath}`);
  console.log('Usage: node test_dispute_letter_sender.js <recipient_email> <attachment_path> [dispute_type] [province]');
  process.exit(1);
}

// Sample test function
async function testSendDisputeLetter() {
  console.log('SmartDispute.ai - Testing Dispute Letter Sender');
  console.log('============================================');
  console.log(`Sending to: ${recipientEmail}`);
  console.log(`Attachment: ${attachmentPath}`);
  console.log(`Dispute Type: ${disputeType}`);
  console.log(`Province: ${province}`);
  console.log('============================================');
  
  try {
    const result = await sendDisputeLetter({
      recipientEmail,
      recipientName: 'Test Recipient',
      subject: `Test: ${disputeType.toUpperCase()} Dispute from SmartDispute.ai`,
      senderName: 'Test User',
      disputeType,
      province,
      attachmentPath,
      customMessage: 'This is a test message sent from the SmartDispute.ai test sender script.'
    });
    
    console.log('Success! Dispute letter sent.');
    console.log(`Message ID: ${result.messageId}`);
    
    if (result.previewUrl) {
      console.log(`Preview URL: ${result.previewUrl}`);
    }
  } catch (error) {
    console.error('Failed to send dispute letter:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
testSendDisputeLetter();