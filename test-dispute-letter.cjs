/**
 * Test script for sending dispute letters using the CommonJS module
 */
const sendDisputeLetter = require('./send_dispute_letter.cjs');

// Check for command line arguments
const clientEmail = process.argv[2] || 'test@example.com';
const clientName = process.argv[3] || 'Test Client';
const issue = process.argv[4] || 'This is a test dispute regarding a late payment that was incorrectly reported to credit bureaus. I have evidence that the payment was made on time, and I request that this be corrected immediately.';

// Output configuration
console.log('📝 SmartDispute.ai - Sending Test Dispute Letter');
console.log('===============================================');
console.log(`Client Email: ${clientEmail}`);
console.log(`Client Name: ${clientName}`);
console.log(`Issue: ${issue.substring(0, 50)}...`);
console.log('-----------------------------------------------');

// Send the dispute letter
(async () => {
  try {
    console.log('Generating and sending dispute letter...');
    const result = await sendDisputeLetter(clientEmail, clientName, null, issue);
    
    if (result.success) {
      console.log('✅ Dispute letter sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Failed to send dispute letter:');
      console.error(`   Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
})();