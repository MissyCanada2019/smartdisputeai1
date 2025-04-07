// Email Test Script for SmartDispute.ai
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test PDF file if needed
const createTestPdf = () => {
  const testPdfPath = path.join(__dirname, 'test-document.txt');
  if (!fs.existsSync(testPdfPath)) {
    fs.writeFileSync(testPdfPath, 'This is a test document for email attachment testing.');
    console.log(`Created test document at ${testPdfPath}`);
  }
  return testPdfPath;
};

// Function to verify environment variables
const checkEnvironmentVars = () => {
  const requiredVars = ['EMAIL_SERVICE', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease add these to your .env file');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
};

// Function to send a test email
const sendTestEmail = async (recipient) => {
  // Validate environment variables
  if (!checkEnvironmentVars()) {
    return false;
  }
  
  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  // Create a test document
  const testDocumentPath = createTestPdf();
  
  console.log(`\n💌 Sending test email to ${recipient}...`);
  
  // Define mail options
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipient,
    subject: 'SmartDispute.ai - Test Email with Attachment',
    text: `Hello,

This is a test email from SmartDispute.ai's email notification system. 
If you're receiving this email, the system is working correctly!

The system is using:
- Email service: ${process.env.EMAIL_SERVICE}
- Sender: ${process.env.EMAIL_USER}

This email includes a test document attachment.

Best regards,
SmartDispute.ai Team`,
    attachments: [
      {
        filename: 'test-document.txt',
        path: testDocumentPath
      }
    ]
  };
  
  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error);
    return false;
  }
};

// Get recipient email from command line args or use a default
const recipientEmail = process.argv[2] || 'recipient@example.com';

// Execute the test
(async () => {
  console.log('📧 SmartDispute.ai Email Test');
  console.log('==========================');
  
  const success = await sendTestEmail(recipientEmail);
  
  if (success) {
    console.log('\n🚀 Email test completed successfully!');
  } else {
    console.log('\n❌ Email test failed. Please check the errors above.');
    process.exit(1);
  }
})();