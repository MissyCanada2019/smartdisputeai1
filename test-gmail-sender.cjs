// Simple test script for Gmail dispute letter sender
require('dotenv').config();
const sendDisputeLetter = require('./send_dispute_gmail');

// Get command line arguments or use defaults
const clientEmail = process.argv[2] || 'test@example.com';
const clientName = process.argv[3] || 'John Smith';

// Example dispute text
const disputeText = `I am writing regarding account #1234-5678-9012-3456 from XYZ Company. On January 15, 2025, I received a notice claiming that I owed $500 for services that I never authorized or received.

According to my records and previous communications with your company, this charge is erroneous and should be removed from my account immediately. I have attached copies of my original service agreement which clearly indicates that these charges were not part of our agreement.

Under the Consumer Protection Act, I am formally requesting that this matter be investigated and the charges removed within 30 days of receipt of this letter.`;

// Display test information
console.log('🧪 GMAIL DISPUTE LETTER TEST');
console.log('===========================');
console.log(`Sending to: ${clientEmail}`);
console.log(`Client name: ${clientName}`);
console.log(`Using Gmail account: ${process.env.GMAIL_USER || '[NOT SET]'}`);

// Check environment variables
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
  console.error('\n❌ ERROR: Missing Gmail environment variables!');
  console.error('Please set GMAIL_USER and GMAIL_APP_PASS in your .env file.');
  process.exit(1);
}

// Send the dispute letter
(async () => {
  console.log('\nSending dispute letter...');
  
  try {
    const result = await sendDisputeLetter(clientEmail, clientName, null, disputeText);
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Dispute letter sent');
      console.log(`Message ID: ${result.messageId}`);
      console.log(`Sent at: ${result.timestamp}`);
    } else {
      console.error('\n❌ FAILED to send dispute letter');
      console.error(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('\n❌ EXCEPTION occurred:');
    console.error(error);
  }
})();