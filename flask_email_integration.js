/**
 * Flask Email Integration for SmartDispute.ai
 * 
 * This module provides a way to send generated dispute letters directly via email
 * from the Flask application. It integrates with the Flask success page to offer
 * the option to send the dispute letter via email after generation.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

/**
 * Sends a dispute letter via email 
 * @param {Object} options Configuration options
 * @param {string} options.recipientEmail Email address to send to
 * @param {string} options.recipientName Name of recipient
 * @param {string} options.documentPath Path to the generated document
 * @param {string} options.disputeType Type of dispute (e.g. 'landlord_tenant', 'credit', etc.)
 * @param {string} options.province Province code (e.g. 'ON', 'BC', etc.)
 * @param {string} options.senderName Name of the sender
 * @param {string} [options.subject] Optional custom subject line
 * @param {string} [options.customMessage] Optional custom message to include
 * @returns {Promise<Object>} Result with success status and message
 */
async function sendDisputeLetter(options) {
  try {
    // Extract options
    const { 
      recipientEmail, 
      recipientName = 'To Whom It May Concern', 
      documentPath, 
      disputeType, 
      province, 
      senderName,
      subject,
      customMessage
    } = options;

    // Validate required fields
    if (!recipientEmail) {
      throw new Error('Recipient email is required');
    }
    
    if (!documentPath || !fs.existsSync(documentPath)) {
      throw new Error('Valid document path is required');
    }

    // Format dispute type for display
    const formatDisputeType = (type) => {
      const types = {
        'landlord_cease_desist': 'Landlord Cease and Desist Notice',
        'repair_notice': 'Repair Notice',
        'intent_to_vacate': 'Notice of Intent to Vacate',
        'termination_notice': 'Lease Termination Notice',
        'sublease_agreement': 'Sublease Agreement',
        'cas_cease_desist': 'Children\'s Aid Society Cease and Desist',
        'cas_worker_reassignment': 'CAS Worker Reassignment Request',
        'cas_answer_plan': 'CAS Answer and Plan of Care Response',
        'cas_records_request': 'CAS Records Request',
        'cas_appeal': 'CAS Decision Appeal'
      };
      
      return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Format province for display
    const formatProvince = (code) => {
      const provinces = {
        'ON': 'Ontario',
        'BC': 'British Columbia',
        'AB': 'Alberta',
        'MB': 'Manitoba',
        'SK': 'Saskatchewan',
        'QC': 'Quebec',
        'NS': 'Nova Scotia',
        'NB': 'New Brunswick',
        'PE': 'Prince Edward Island',
        'NL': 'Newfoundland and Labrador',
        'YT': 'Yukon',
        'NT': 'Northwest Territories',
        'NU': 'Nunavut'
      };
      
      return provinces[code] || code;
    };

    // Generate filename for the document attachment
    const getDocumentFilename = () => {
      const date = new Date().toISOString().split('T')[0];
      const disputeName = disputeType.replace(/_/g, '-');
      return `${disputeName}-${province}-${date}.docx`;
    };
    
    // Prepare email data
    const emailOptions = {
      from: `SmartDispute.ai <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: subject || `Legal Dispute: ${formatDisputeType(disputeType)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4a5568; margin: 0;">SmartDispute.ai</h2>
            <p style="color: #718096; font-size: 14px;">Legal Self-Help Platform</p>
          </div>
          
          <p>Dear ${recipientName},</p>
          
          <p>Please find attached a formal legal document regarding a ${formatDisputeType(disputeType)} 
          in ${formatProvince(province)}.</p>
          
          ${customMessage ? `<p>${customMessage}</p>` : ''}
          
          <p>This document has been prepared in accordance with the relevant legislation in 
          ${formatProvince(province)} and serves as official communication regarding this matter.</p>
          
          <p>Please review the attached document carefully and take appropriate action as outlined within.</p>
          
          <p>Sincerely,<br>${senderName || 'SmartDispute.ai User'}</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="color: #718096; font-size: 12px;">
            This communication was sent via the SmartDispute.ai platform, a service designed to assist
            individuals with legal self-help and document preparation. The attached document was generated
            based on information provided by the sender and relevant legal frameworks.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: getDocumentFilename(),
          path: documentPath,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ]
    };

    // Send the email
    const info = await transporter.sendMail(emailOptions);
    
    console.log(`Dispute letter sent successfully to ${recipientEmail}`);
    console.log(`Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipientEmail,
      documentType: formatDisputeType(disputeType)
    };
    
  } catch (error) {
    console.error('Error sending dispute letter:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sends a user notification email with their generated document
 * @param {Object} options Configuration options
 * @param {string} options.userEmail User's email address
 * @param {string} options.userName User's name
 * @param {string} options.documentPath Path to the generated document
 * @param {string} options.disputeType Type of dispute
 * @param {string} options.province Province code
 * @returns {Promise<Object>} Result with success status and message
 */
async function sendUserNotification(options) {
  try {
    const { 
      userEmail, 
      userName, 
      documentPath, 
      disputeType, 
      province 
    } = options;
    
    // Validate required fields
    if (!userEmail || !documentPath || !fs.existsSync(documentPath)) {
      throw new Error('Email address and valid document path are required');
    }
    
    // Format dispute type for display
    const formatDisputeType = (type) => {
      return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };
    
    // Format filename for the attachment
    const getDocumentFilename = () => {
      const date = new Date().toISOString().split('T')[0];
      const disputeName = disputeType.replace(/_/g, '-');
      return `SmartDispute-${disputeName}-${date}.docx`;
    };
    
    // Prepare email data
    const emailOptions = {
      from: `SmartDispute.ai <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `Your ${formatDisputeType(disputeType)} Document`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4a5568; margin: 0;">SmartDispute.ai</h2>
            <p style="color: #718096; font-size: 14px;">Legal Self-Help Platform</p>
          </div>
          
          <p>Hello ${userName || 'there'},</p>
          
          <p>Thank you for using SmartDispute.ai. Attached is your generated 
          ${formatDisputeType(disputeType)} document.</p>
          
          <p>Next steps:</p>
          <ol>
            <li>Review the document carefully to ensure all information is correct.</li>
            <li>Print and sign the document where indicated (if required).</li>
            <li>Send the document to the appropriate recipient using the method that works best for your situation (email, mail, or in-person delivery).</li>
          </ol>
          
          <p>If you need any further assistance with this document or have questions about the legal process, 
          please don't hesitate to contact us.</p>
          
          <p>Regards,<br>The SmartDispute.ai Team</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <p style="color: #718096; font-size: 12px; text-align: center;">
            SmartDispute.ai - Empowering Canadians through accessible legal tools
          </p>
        </div>
      `,
      attachments: [
        {
          filename: getDocumentFilename(),
          path: documentPath,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(emailOptions);
    
    console.log(`Document notification sent to user: ${userEmail}`);
    console.log(`Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      userEmail
    };
    
  } catch (error) {
    console.error('Error sending user notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Check email configuration
function checkEmailConfig() {
  const hasCredentials = process.env.GMAIL_USER && process.env.GMAIL_APP_PASS;
  return {
    configured: hasCredentials,
    email: hasCredentials ? process.env.GMAIL_USER : null
  };
}

module.exports = {
  sendDisputeLetter,
  sendUserNotification,
  checkEmailConfig
};