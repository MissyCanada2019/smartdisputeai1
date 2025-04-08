/**
 * Email Service Test Script for SmartDispute.ai
 * 
 * This script tests sending emails with the email integration services
 * 
 * Usage:
 * node email-test.js
 */

// Import the email integration module
const { sendUserNotification } = require('./flask_email_integration');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Check for required environment variables
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.error('Error: Missing required environment variables for email testing.');
    console.error('Please set GMAIL_USER and GMAIL_APP_PASS environment variables.');
    process.exit(1);
}

// Create a test document if none is provided
async function createTestDocument() {
    return new Promise((resolve, reject) => {
        try {
            const outputPath = path.join(__dirname, 'test-document.pdf');
            
            // Create a simple PDF document
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(outputPath);
            
            doc.pipe(stream);
            
            // Add content to PDF
            doc.fontSize(25).text('SmartDispute.ai Test Document', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text('This is a test document generated for email service testing.', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });
            
            // Finish PDF
            doc.end();
            
            // Wait for the stream to finish
            stream.on('finish', () => {
                console.log('Test document created successfully at:', outputPath);
                resolve(outputPath);
            });
            
            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Function to test email sending
async function testEmailSending() {
    try {
        // Get recipient email from command line or use default
        const recipientEmail = process.argv[2] || 'test@example.com';
        
        // Create a test document
        const documentPath = await createTestDocument();
        
        console.log(`Sending test email to: ${recipientEmail}`);
        
        // Send an email with the test document
        const result = await sendUserNotification({
            userEmail: recipientEmail,
            userName: 'Test User',
            documentPath,
            disputeType: 'test_document',
            customMessage: 'This is a test message from the SmartDispute.ai email service.'
        });
        
        if (result.success) {
            console.log('Email sent successfully!');
            console.log('Message ID:', result.messageId);
        } else {
            console.error('Failed to send email:', result.error);
        }
        
        // Clean up test document
        fs.unlinkSync(documentPath);
        console.log('Test document deleted.');
        
    } catch (error) {
        console.error('Error in test:', error);
    }
}

// Run the test
testEmailSending();