/**
 * Gmail Dispute Letter Test
 * This script tests the direct Gmail dispute letter sender
 */
const sendDisputeLetter = require('./send_email_gmail.cjs');

// Get user email and name from command line arguments
const clientEmail = process.argv[2] || 'test@example.com';
const clientName = process.argv[3] || 'Test Client';
const pdfPath = process.argv[4] || null; // Optional path to an existing PDF

// Sample dispute description (used if no PDF is provided)
const issue = `I am writing to dispute an incorrect late payment notation on my credit report from ABC Credit Card Company (account #1234-5678-9012-3456).

According to my records, I made the payment for January 2025 on time via online banking on January 15, 2025. I have attached a copy of my bank statement showing this payment was processed on that date.

Under the Fair Credit Reporting Act, this information must be corrected as it is causing harm to my credit score.`;

// Main function
async function runTest() {
  console.log('📧 SmartDispute.ai Gmail Sender Test');
  console.log('===================================');
  
  // Check for Gmail credentials
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.error('❌ Missing Gmail credentials in .env file:');
    console.error('   Please add GMAIL_USER and GMAIL_APP_PASS environment variables');
    process.exit(1);
  }
  
  console.log(`Sending dispute letter to: ${clientName} (${clientEmail})`);
  console.log(`PDF Path: ${pdfPath || 'Will be generated dynamically'}`);
  
  try {
    // Send the dispute letter
    const result = await sendDisputeLetter(clientEmail, clientName, pdfPath, issue);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Failed to send email:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();