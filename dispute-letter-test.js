/**
 * Test script for sending dispute letters
 * 
 * This script demonstrates how to use the sendDisputeLetter function
 * to send a dispute letter via email.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sendDisputeLetter from './send_email_gmail.js';

// Initialize environment variables
dotenv.config();

// For ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test document if needed
const createTestDocument = () => {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testDocumentPath = path.join(testDir, 'test-dispute-letter.txt');
  fs.writeFileSync(
    testDocumentPath,
    'DISPUTE LETTER\n\n' +
    'Date: ' + new Date().toLocaleDateString() + '\n\n' +
    'To Whom It May Concern:\n\n' +
    'This is a test dispute letter that would normally contain the formal dispute content.\n\n' +
    'In a real scenario, this would be a PDF document with properly formatted legal content\n' +
    'and would include all necessary details about the dispute.\n\n' +
    'Sincerely,\n\n' +
    'Test Client\n' +
    'SmartDispute.ai User'
  );
  
  console.log(`✅ Created test dispute letter at ${testDocumentPath}`);
  return testDocumentPath;
};

// Main execution
(async () => {
  console.log('📝 SmartDispute.ai - Dispute Letter Email Test');
  console.log('=============================================');
  
  // Check for required environment variables
  const requiredVars = ['EMAIL_SERVICE', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease add these to your .env file and try again.');
    process.exit(1);
  }
  
  // Get recipient from command line args or use a default
  const recipientEmail = process.argv[2] || 'test@example.com';
  const recipientName = process.argv[3] || 'Test Recipient';
  
  // Create a test document
  const testDocumentPath = createTestDocument();
  
  console.log(`\n🔄 Sending dispute letter to ${recipientName} (${recipientEmail})...`);
  
  // Send the dispute letter
  const result = await sendDisputeLetter(
    recipientEmail,
    recipientName,
    testDocumentPath,
    {
      subject: "Important: Your Legal Dispute Documentation",
      customMessage: "This is a test of the dispute letter sending system."
    }
  );
  
  if (result.success) {
    console.log('\n✅ Dispute letter sent successfully!');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`⏰ Timestamp: ${result.timestamp}`);
  } else {
    console.error('\n❌ Failed to send dispute letter:');
    console.error(`   Error: ${result.error}`);
    process.exit(1);
  }
})();