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
const mjml2html = require('mjml');
const pdfkit = require('pdfkit');

// Configure email transport - needs EMAIL_PASSWORD env var
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'support@smartdispute.ai',
        pass: process.env.GMAIL_APP_PASS
    }
});

/**
 * Generates a branded email HTML template using MJML
 * 
 * @param {Object} options Configuration options
 * @param {string} options.recipientName Name of the recipient
 * @param {string} options.messageTitle Title of the message
 * @param {string} options.messageContent Main content of the message
 * @param {string} [options.ctaText] Call to action button text (optional)
 * @param {string} [options.ctaUrl] Call to action button URL (optional)
 * @returns {string} Compiled HTML
 */
function generateEmailTemplate(options) {
    const { 
        recipientName = 'User', 
        messageTitle = 'Your SmartDispute.ai Document', 
        messageContent,
        ctaText,
        ctaUrl
    } = options;

    // Define the MJML template
    const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>SmartDispute.ai</mj-title>
        <mj-font name="Segoe UI" href="https://fonts.googleapis.com/css?family=Segoe+UI" />
        <mj-attributes>
          <mj-all font-family="Segoe UI, Arial, sans-serif" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f8f9fa">
        <mj-section padding="20px 0" background-color="#2d3748">
          <mj-column>
            <mj-text font-size="24px" color="#ffffff" align="center" font-weight="bold">SmartDispute.ai</mj-text>
            <mj-text font-size="14px" color="#cbd5e0" align="center">Empowering Canadians through accessible legal resources</mj-text>
          </mj-column>
        </mj-section>
        
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text font-size="18px" font-weight="bold" color="#2d3748">Hello ${recipientName},</mj-text>
            <mj-text font-size="20px" font-weight="bold" color="#4a5568" padding-top="10px">${messageTitle}</mj-text>
            <mj-divider border-color="#e2e8f0" />
            <mj-text font-size="16px" color="#4a5568" line-height="1.6">${messageContent}</mj-text>
            
            ${ctaText && ctaUrl ? `
            <mj-button background-color="#4a5568" color="white" font-weight="bold" border-radius="4px" href="${ctaUrl}">${ctaText}</mj-button>
            ` : ''}
            
            <mj-divider border-color="#e2e8f0" padding-top="20px" />
            <mj-text font-size="14px" color="#718096" line-height="1.4">
              This email was sent automatically from SmartDispute.ai. Please do not reply to this email.
            </mj-text>
          </mj-column>
        </mj-section>
        
        <mj-section padding="10px 0" background-color="#f8f9fa">
          <mj-column>
            <mj-text font-size="12px" color="#718096" align="center">
              &copy; ${new Date().getFullYear()} SmartDispute.ai - All rights reserved
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
    `;

    // Convert MJML to HTML
    const { html } = mjml2html(mjmlTemplate);
    return html;
}

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
    const {
        recipientEmail,
        recipientName,
        documentPath,
        disputeType = 'legal document',
        province = '',
        senderName,
        subject,
        customMessage = ''
    } = options;

    // Format dispute type for display
    const formattedDisputeType = disputeType
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    try {
        // Check if document exists
        if (!fs.existsSync(documentPath)) {
            throw new Error(`Document not found at path: ${documentPath}`);
        }

        // Prepare email content
        const emailSubject = subject || `Legal Document: ${formattedDisputeType} from ${senderName}`;
        
        // Generate branded email content with MJML
        const messageContent = `
            A legal document has been prepared for your review. This document is a ${formattedDisputeType} 
            prepared by ${senderName} in accordance with applicable provincial laws in ${province}.
            <br><br>
            ${customMessage ? `<strong>Additional message:</strong><br>${customMessage}<br><br>` : ''}
            The document is attached to this email. Please review it carefully.
            <br><br>
            <strong>Important:</strong> This document was generated using SmartDispute.ai, 
            a platform that helps Canadians create legal documents. The attached document is 
            provided for informational purposes and may constitute legal correspondence.
        `;

        const emailHtml = generateEmailTemplate({
            recipientName,
            messageTitle: `${formattedDisputeType} Document`,
            messageContent
        });

        // Setup email options
        const mailOptions = {
            from: '"SmartDispute.ai" <support@smartdispute.ai>',
            to: recipientEmail,
            subject: emailSubject,
            html: emailHtml,
            attachments: [
                {
                    filename: path.basename(documentPath),
                    path: documentPath
                }
            ]
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            messageId: info.messageId,
            recipientEmail
        };
    } catch (error) {
        console.error('Error sending dispute letter email:', error);
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
 * @param {string} [options.customMessage] Optional custom message to include
 * @returns {Promise<Object>} Result with success status and message
 */
async function sendUserNotification(options) {
    const {
        userEmail,
        userName = 'User',
        documentPath,
        disputeType = 'legal document',
        customMessage = ''
    } = options;

    // Format dispute type for display
    const formattedDisputeType = disputeType
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    try {
        // Check if document exists
        if (!fs.existsSync(documentPath)) {
            throw new Error(`Document not found at path: ${documentPath}`);
        }

        // Prepare email content
        const emailSubject = `Your ${formattedDisputeType} Document from SmartDispute.ai`;
        
        // Generate branded email content with MJML
        const messageContent = `
            Thank you for using SmartDispute.ai! Your ${formattedDisputeType} document has been generated 
            and is attached to this email.
            <br><br>
            ${customMessage ? `<strong>Additional message:</strong><br>${customMessage}<br><br>` : ''}
            <strong>Next Steps:</strong>
            <ol>
                <li>Review the document carefully to ensure all information is correct</li>
                <li>If needed, make any necessary edits or adjust formatting</li>
                <li>Send the document to the appropriate recipient</li>
                <li>Keep a copy for your records</li>
            </ol>
            <br>
            <strong>Important:</strong> This document was generated based on the information you provided.
            While we strive to create accurate documents based on current legal standards, this does not 
            constitute legal advice. If you have complex legal needs, we recommend consulting with a 
            qualified legal professional.
        `;

        const emailHtml = generateEmailTemplate({
            recipientName: userName,
            messageTitle: `Your ${formattedDisputeType} Document is Ready`,
            messageContent,
            ctaText: 'Visit SmartDispute.ai',
            ctaUrl: 'https://smartdispute.ai'
        });

        // Setup email options
        const mailOptions = {
            from: '"SmartDispute.ai" <support@smartdispute.ai>',
            to: userEmail,
            subject: emailSubject,
            html: emailHtml,
            attachments: [
                {
                    filename: path.basename(documentPath),
                    path: documentPath
                }
            ]
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            messageId: info.messageId,
            recipientEmail: userEmail
        };
    } catch (error) {
        console.error('Error sending user notification email:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Checks if email configuration environment variables are available
 * @returns {boolean} True if properly configured
 */
function checkEmailConfig() {
    const hasConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASS);
    if (!hasConfig) {
        console.warn('Email service not configured: Missing GMAIL_USER or GMAIL_APP_PASS environment variables');
    }
    return hasConfig;
}

module.exports = {
    sendDisputeLetter,
    sendUserNotification,
    checkEmailConfig
};