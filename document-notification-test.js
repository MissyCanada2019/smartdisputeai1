/**
 * Document Notification Test Script for SmartDispute.ai
 * 
 * This script tests the DocumentNotificationService integration with EmailService
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const documentNotificationService = require('./server/services/documentNotificationService');
const emailService = require('./server/services/emailService');

// Create test documents and sample analysis results
const setupTestData = () => {
  console.log('📝 Setting up test data...');
  
  // Create test directory if it doesn't exist
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Create a sample document
  const testDocumentPath = path.join(testDir, 'sample-legal-document.txt');
  fs.writeFileSync(
    testDocumentPath,
    'ONTARIO TENANCY AGREEMENT\n\n' +
    'THIS TENANCY AGREEMENT made this 1st day of April, 2025.\n\n' +
    'BETWEEN: Jane Smith (the "Landlord")\n\n' +
    'AND: John Doe (the "Tenant")\n\n' +
    '1. PREMISES\n' +
    'The Landlord agrees to rent to the Tenant the residential premises at: 123 Main Street, Toronto, Ontario.\n\n' +
    '2. TERM\n' +
    'The term of this Agreement is fixed and begins on May 1, 2025 and ends on April 30, 2026.\n\n' +
    '3. RENT\n' +
    'The Tenant agrees to pay monthly rent of $2,000.00, payable in advance on the first day of each month.\n\n' +
    '4. UTILITIES\n' +
    'The following utilities are included in the rent: Water, Heat. The Tenant is responsible for: Electricity, Internet.\n\n' +
    '5. TERMINATION\n' +
    'The Tenant must give at least 60 days written notice to terminate this agreement.\n\n'
  );
  
  // Create a sample analysis results
  const sampleAnalysisResults = {
    id: 'doc_' + Math.floor(Math.random() * 10000),
    documentType: 'Residential Tenancy Agreement',
    keyPoints: [
      'Fixed-term lease from May 1, 2025 to April 30, 2026',
      'Monthly rent of $2,000.00',
      'Water and heat included in rent, tenant pays electricity and internet',
      '60-day notice required for termination'
    ],
    legalIssues: [
      'No provision for rent increases after the fixed term',
      'No security deposit amount specified',
      'No maintenance responsibilities clearly defined'
    ],
    recommendations: [
      'Request clarification on maintenance responsibilities',
      'Discuss potential rent increases after lease term',
      'Get confirmation of move-in inspection process',
      'Clarify visitor policy and quiet hours'
    ],
    score: 75,
    summary: 'This is a standard Ontario residential tenancy agreement with a fixed term of one year. It covers basic terms but lacks some important details regarding maintenance, inspections, and future rent increases. The agreement follows standard Ontario tenancy patterns but would benefit from additional clarifications.'
  };
  
  // Create a batch of sample documents
  const batchDocuments = [
    {
      name: 'tenancy-agreement.txt',
      path: testDocumentPath
    },
    {
      name: 'rights-information.txt',
      path: path.join(testDir, 'rights-information.txt')
    },
    {
      name: 'notice-template.txt',
      path: path.join(testDir, 'notice-template.txt')
    }
  ];
  
  // Create the additional sample documents
  fs.writeFileSync(
    batchDocuments[1].path,
    'ONTARIO TENANT RIGHTS INFORMATION\n\n' +
    'As a tenant in Ontario, you have the following rights:\n\n' +
    '1. RIGHT TO SECURITY OF TENANCY\n' +
    'You cannot be evicted without a proper legal reason and process.\n\n' +
    '2. RIGHT TO MAINTENANCE AND REPAIRS\n' +
    'Your landlord must keep the rental property in a good state of repair.\n\n' +
    '3. RIGHT TO PRIVACY\n' +
    'Your landlord must give you 24 hours written notice before entering your unit.\n\n' +
    '4. RIGHT TO ASSIGN OR SUBLET\n' +
    'You have the right to assign or sublet your rental unit (with landlord approval).\n\n'
  );
  
  fs.writeFileSync(
    batchDocuments[2].path,
    'NOTICE OF MAINTENANCE REQUEST\n\n' +
    '[DATE]\n\n' +
    'Dear [LANDLORD NAME],\n\n' +
    'I am writing to formally request maintenance for the following issue(s) in my rental unit at [ADDRESS]:\n\n' +
    '[DESCRIBE ISSUE IN DETAIL]\n\n' +
    'This issue requires attention because [REASON].\n\n' +
    'According to Ontario's Residential Tenancies Act, landlords are required to maintain rental units in a good state of repair. Please address this issue within [TIMEFRAME] days.\n\n' +
    'Thank you for your prompt attention to this matter.\n\n' +
    'Sincerely,\n' +
    '[TENANT NAME]\n' +
    '[CONTACT INFORMATION]'
  );
  
  console.log('✅ Test data created successfully');
  
  return {
    testDocumentPath,
    sampleAnalysisResults,
    batchDocuments
  };
};

// Test for sending analysis results
const testSendAnalysisResults = async (recipient, testData) => {
  console.log('\n🔄 Test 1: Sending document analysis results...');
  
  const result = await documentNotificationService.sendAnalysisResults({
    to: recipient,
    documentName: 'Residential Tenancy Agreement.txt',
    analysisResults: testData.sampleAnalysisResults,
    documentPath: testData.testDocumentPath
  });
  
  if (!result.success) {
    console.error(`❌ Failed to send analysis results: ${result.error}`);
    return false;
  }
  
  console.log('✅ Analysis results sent successfully!');
  console.log(`📧 Message ID: ${result.messageId}`);
  return true;
};

// Test for sending document ready notification
const testSendDocumentReadyNotification = async (recipient, testData) => {
  console.log('\n🔄 Test 2: Sending document ready notification...');
  
  const result = await documentNotificationService.sendDocumentReadyNotification({
    to: recipient,
    documentName: 'Tenant Rights Information Package',
    documentId: 'doc_' + Math.floor(Math.random() * 10000)
  });
  
  if (!result.success) {
    console.error(`❌ Failed to send document ready notification: ${result.error}`);
    return false;
  }
  
  console.log('✅ Document ready notification sent successfully!');
  console.log(`📧 Message ID: ${result.messageId}`);
  return true;
};

// Test for sending a batch of documents
const testSendDocumentBatch = async (recipient, testData) => {
  console.log('\n🔄 Test 3: Sending document batch...');
  
  const result = await documentNotificationService.sendDocumentBatch({
    to: recipient,
    documents: testData.batchDocuments,
    subject: 'SmartDispute.ai - Your Tenant Resource Package',
    message: 'Here is your comprehensive tenant resource package with important information about your rights and templates for common notices.'
  });
  
  if (!result.success) {
    console.error(`❌ Failed to send document batch: ${result.error}`);
    return false;
  }
  
  console.log('✅ Document batch sent successfully!');
  console.log(`📧 Message ID: ${result.messageId}`);
  return true;
};

// Print usage information
const printUsage = () => {
  console.log('\nUsage:');
  console.log('  node document-notification-test.js [recipient@example.com] [options]');
  console.log('\nOptions:');
  console.log('  --send-analysis     Send document analysis results');
  console.log('  --send-notification Send document ready notification');
  console.log('  --send-batch        Send a batch of related documents');
  console.log('  --all               Run all tests');
  console.log('\nExample:');
  console.log('  node document-notification-test.js user@example.com --all');
};

// Main execution
(async () => {
  console.log('📧 SmartDispute.ai Document Notification Test');
  console.log('===========================================');
  
  // Check email service connection
  console.log('\n🔄 Verifying email service connection...');
  const connectionValid = await emailService.verifyConnection();
  
  if (!connectionValid) {
    console.error('❌ Email service connection failed. Check your credentials.');
    console.log('\nMake sure you have these environment variables set in .env:');
    console.log('  - EMAIL_SERVICE (e.g. gmail)');
    console.log('  - EMAIL_USER (your email address)');
    console.log('  - EMAIL_PASSWORD (your email password or app password)');
    process.exit(1);
  }
  
  // Check if recipient email is provided
  const recipient = process.argv[2];
  if (!recipient || !recipient.includes('@')) {
    console.error('❌ Please provide a valid recipient email address as the first argument.');
    printUsage();
    process.exit(1);
  }
  
  // Check if we should run all tests
  if (process.argv.includes('--all')) {
    process.argv.push('--send-analysis', '--send-notification', '--send-batch');
  }
  
  // If no test options provided, show usage
  if (!process.argv.includes('--send-analysis') && 
      !process.argv.includes('--send-notification') && 
      !process.argv.includes('--send-batch')) {
    printUsage();
    process.exit(0);
  }
  
  // Setup test data
  const testData = setupTestData();
  
  // Run the tests
  let success = true;
  
  if (process.argv.includes('--send-analysis')) {
    success = await testSendAnalysisResults(recipient, testData) && success;
  }
  
  if (process.argv.includes('--send-notification')) {
    success = await testSendDocumentReadyNotification(recipient, testData) && success;
  }
  
  if (process.argv.includes('--send-batch')) {
    success = await testSendDocumentBatch(recipient, testData) && success;
  }
  
  if (success) {
    console.log('\n🎉 All document notification tests completed successfully!');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
})();