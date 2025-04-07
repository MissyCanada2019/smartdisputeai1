/**
 * Dispute Letter Email Sender for SmartDispute.ai
 * 
 * This module provides a specialized function for sending dispute letters to recipients
 * via Gmail's SMTP service using the project's existing email infrastructure.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import emailService from './server/services/emailService.js';

// Initialize environment variables
dotenv.config();

// For ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sends a dispute letter to a recipient with professional formatting and an attachment
 * 
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} recipientName - Name of the recipient for personalization
 * @param {string} pdfPath - Path to the PDF document to attach
 * @param {Object} options - Optional parameters
 * @param {string} options.subject - Email subject line (defaults to "Important: Legal Dispute Notification")
 * @param {string} options.customMessage - Additional message to include in the email body
 * @returns {Promise<Object>} Result object with success status and message information
 */
async function sendDisputeLetter(recipientEmail, recipientName, pdfPath, options = {}) {
  try {
    // Validate inputs
    if (!recipientEmail) throw new Error("Recipient email is required");
    if (!recipientName) throw new Error("Recipient name is required");
    if (!pdfPath) throw new Error("PDF document path is required");
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Document file not found at path: ${pdfPath}`);
    }

    // Extract filename from path
    const fileName = path.basename(pdfPath);
    
    // Set default options
    const emailSubject = options.subject || "Important: Legal Dispute Notification";
    const customMessage = options.customMessage || "";
    
    // Get current date for the letter
    const currentDate = new Date().toLocaleDateString('en-CA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Send email using the document email service function
    const result = await emailService.sendDocument({
      to: recipientEmail,
      subject: emailSubject,
      documentPath: pdfPath,
      documentName: fileName,
      templateName: 'dispute-letter',
      data: {
        recipientName,
        date: currentDate,
        customMessage,
        trackingId: `SD-${Date.now().toString().slice(-6)}`,
        buttonUrl: process.env.APP_URL || 'https://smartdispute.ai'
      }
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to send dispute letter");
    }

    console.log(`✅ Dispute letter successfully sent to ${recipientName} (${recipientEmail})`);
    return {
      success: true,
      messageId: result.messageId,
      recipient: recipientEmail,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error(`❌ Error sending dispute letter: ${error.message}`);
    return {
      success: false,
      error: error.message,
      recipient: recipientEmail
    };
  }
}

export default sendDisputeLetter;