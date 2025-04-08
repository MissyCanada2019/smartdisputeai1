/**
 * Document Notification Test Script for SmartDispute.ai
 * 
 * This script tests the DocumentNotificationService integration with EmailService
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

/**
 * Sends a document notification email with branding and styling
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.recipientEmail - Email address of the recipient
 * @param {string} options.recipientName - Name of the recipient
 * @param {string} options.documentPath - Path to the document to attach (optional)
 * @param {string} options.documentType - Type of document (e.g., 'Cease and Desist Letter')
 * @param {string} options.customMessage - Optional custom message to include
 * @returns {Promise<Object>} - Object with success status and message info
 */
async function sendDocumentNotification(options) {
  try {
    const { 
      recipientEmail, 
      recipientName = 'User', 
      documentPath, 
      documentType = 'Legal Document',
      customMessage = ''
    } = options;
    
    // Validate required parameters
    if (!recipientEmail) {
      throw new Error('Recipient email is required');
    }
    
    // Check if document exists when path is provided
    if (documentPath && !fs.existsSync(documentPath)) {
      throw new Error(`Document not found at path: ${documentPath}`);
    }
    
    // Logo path for email template
    const logoPath = path.join(__dirname, 'public', 'logo.png');
    const logoExists = fs.existsSync(logoPath);
    
    // Prepare email content with branding
    const emailOptions = {
      from: `SmartDispute.ai <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your ${documentType} from SmartDispute.ai`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${logoExists ? 
              `<img src="cid:logo" alt="SmartDispute.ai Logo" style="max-width: 180px; height: auto;" />` : 
              `<h2 style="color: #4a5568; margin: 0;">SmartDispute.ai</h2>`
            }
            <p style="color: #718096; font-size: 14px;">Canadian Legal Self-Help Platform</p>
          </div>
          
          <p>Hello ${recipientName},</p>
          
          <p>Your ${documentType} has been successfully generated and is attached to this email.</p>
          
          ${customMessage ? `<p>${customMessage}</p>` : ''}
          
          <p>Next steps:</p>
          <ol>
            <li>Review the document carefully to ensure all information is correct.</li>
            <li>Print and sign the document if required.</li>
            <li>Deliver the document to the recipient using your preferred method.</li>
          </ol>
          
          <p>If you need any further assistance with this document or have questions about the legal process, 
          please don't hesitate to contact us.</p>
          
          <p>Thank you for using SmartDispute.ai.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="color: #718096; font-size: 12px; text-align: center;">
            SmartDispute.ai - Empowering Canadians through accessible legal tools
          </p>
        </div>
      `
    };
    
    // Add logo as embedded image if it exists
    if (logoExists) {
      emailOptions.attachments = [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo'
        }
      ];
    }
    
    // Add document attachment if provided
    if (documentPath) {
      const documentAttachment = {
        filename: path.basename(documentPath),
        path: documentPath
      };
      
      if (emailOptions.attachments) {
        emailOptions.attachments.push(documentAttachment);
      } else {
        emailOptions.attachments = [documentAttachment];
      }
    } else {
      // If no document path provided, create sample text content
      emailOptions.text = `Hello ${recipientName},\n\nYour ${documentType} has been generated.\n\nThank you for using SmartDispute.ai.`;
    }
    
    // Send email
    const info = await transporter.sendMail(emailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      recipientEmail
    };
    
  } catch (error) {
    console.error('Error sending document notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Self-test function 
async function runTest() {
  console.log('Starting document notification test...');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.error('ERROR: Email credentials not configured!');
    console.error('Set GMAIL_USER and GMAIL_APP_PASS environment variables in your .env file');
    return;
  }
  
  // Create a sample document for testing
  const sampleDocPath = path.join(__dirname, 'sample-test-document.txt');
  fs.writeFileSync(sampleDocPath, 'This is a sample document generated for testing purposes.');
  
  try {
    // Test recipient (use your own email for testing)
    const testEmail = process.env.TEST_EMAIL || process.env.GMAIL_USER;
    
    // Send test notification
    console.log(`Sending test notification to ${testEmail}...`);
    
    const result = await sendDocumentNotification({
      recipientEmail: testEmail,
      recipientName: 'Test User',
      documentPath: sampleDocPath,
      documentType: 'Test Document',
      customMessage: 'This is a test notification from the SmartDispute.ai system.'
    });
    
    if (result.success) {
      console.log('Test notification sent successfully!');
      console.log(`Message ID: ${result.messageId}`);
    } else {
      console.error('Failed to send test notification:', result.error);
    }
    
    // Clean up sample document
    fs.unlinkSync(sampleDocPath);
    
  } catch (error) {
    console.error('Error during test:', error);
    
    // Attempt to clean up sample document
    if (fs.existsSync(sampleDocPath)) {
      fs.unlinkSync(sampleDocPath);
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runTest()
    .then(() => console.log('Test completed'))
    .catch(err => console.error('Test failed:', err));
}

module.exports = { sendDocumentNotification };