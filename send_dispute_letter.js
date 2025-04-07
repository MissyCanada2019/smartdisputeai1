/**
 * Dispute Letter Sender for SmartDispute.ai
 * 
 * This module provides functionality to send dispute letters via email
 * using a Gmail account with app password authentication.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Sends a dispute letter to the specified recipient with PDF attachment
 * 
 * @param {Object} options - Configuration options for sending the dispute letter
 * @param {string} options.recipientEmail - Email address of the recipient
 * @param {string} options.recipientName - Name of the recipient (organization or individual)
 * @param {string} options.subject - Email subject line
 * @param {string} options.senderName - Name of the sender/user
 * @param {string} options.disputeType - Type of dispute (e.g., 'landlord_tenant', 'credit', 'cas')
 * @param {string} options.province - Province code (e.g., 'ON', 'BC', 'AB', 'QC')
 * @param {string} options.attachmentPath - Path to the generated document to attach
 * @param {string} [options.customMessage] - Optional custom message to include in the email body
 * @returns {Promise<Object>} - Result object with success status and information
 */
async function sendDisputeLetter(options) {
  const {
    recipientEmail,
    recipientName,
    subject,
    senderName,
    disputeType,
    province,
    attachmentPath,
    customMessage = ''
  } = options;

  // Verify required environment variables
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  if (!emailUser || !emailPassword) {
    throw new Error('Missing required environment variables: EMAIL_USER and EMAIL_PASSWORD must be set.');
  }

  // Verify the dispute letter file exists
  if (!fs.existsSync(attachmentPath)) {
    throw new Error(`Attachment file not found at: ${attachmentPath}`);
  }

  // Set up email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });

  // Format dispute type for display
  const formattedDisputeType = disputeType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Build the email content
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Important: ${formattedDisputeType} Dispute Notification</h2>
        <p>Dear ${recipientName || 'Recipient'},</p>
        <p>Please find attached my formal dispute letter regarding a ${formattedDisputeType.toLowerCase()} matter in ${province}.</p>
        ${customMessage ? `<p>${customMessage}</p>` : ''}
        <p>This document contains important information that requires your attention and response in accordance with applicable legislation.</p>
        <p>Please review the attached document carefully and respond as outlined.</p>
      </div>
      
      <div style="border-top: 1px solid #ddd; padding-top: 15px; color: #666; font-size: 12px;">
        <p>Sent via SmartDispute.ai on behalf of ${senderName}</p>
        <p>This is an official communication regarding a legal dispute. Please retain this email and attachment for your records.</p>
      </div>
    </div>
  `;

  // Configure email options
  const mailOptions = {
    from: `"SmartDispute.ai" <${emailUser}>`,
    to: recipientEmail,
    subject: subject || `Important: ${formattedDisputeType} Dispute Notification`,
    html: emailContent,
    attachments: [
      {
        filename: path.basename(attachmentPath),
        path: attachmentPath
      }
    ]
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending dispute letter:', error);
    throw error;
  }
}

module.exports = {
  sendDisputeLetter
};

// Example usage if script is run directly
if (require.main === module) {
  // Simple test if run directly
  console.log('This module provides the sendDisputeLetter function.');
  console.log('Please import and use this module in your application.');
}