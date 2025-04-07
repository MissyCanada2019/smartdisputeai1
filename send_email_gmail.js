/**
 * Dispute Letter Email Sender for SmartDispute.ai
 * 
 * This module provides a specialized function for sending dispute letters to recipients
 * via Gmail's SMTP service using the project's existing email infrastructure.
 */

import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Configure the email transporter using Gmail SMTP
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASS || process.env.EMAIL_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not found in environment variables. Please set GMAIL_USER and GMAIL_APP_PASS or EMAIL_USER and EMAIL_PASSWORD.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });
};

// Generate a PDF document with the dispute text
const generatePDF = async (recipientName, disputeText) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfPath = path.join(tempDir, `dispute_letter_${Date.now()}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(pdfPath);

      writeStream.on('finish', () => resolve(pdfPath));
      writeStream.on('error', reject);
      
      doc.pipe(writeStream);

      // Add letterhead
      doc.fontSize(16).font('Helvetica-Bold').text('SmartDispute.ai', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Legal Dispute Resolution Document', { align: 'center' });
      doc.moveDown();
      
      // Add current date
      const today = new Date();
      doc.text(`Date: ${today.toLocaleDateString()}`);
      doc.moveDown();
      
      // Add recipient name
      doc.text(`To: ${recipientName}`);
      doc.moveDown();
      
      // Add subject line
      doc.font('Helvetica-Bold').text('Subject: OFFICIAL LEGAL DISPUTE NOTIFICATION');
      doc.font('Helvetica').moveDown();
      
      // Add dispute text
      doc.text('Dear Sir/Madam,');
      doc.moveDown();
      
      doc.text(disputeText || 'Please find attached the official dispute notification and supporting documentation related to this matter.', {
        align: 'justify'
      });
      doc.moveDown();
      
      // Add closing
      doc.text('If you have any questions or require clarification, please contact the sender of this email directly.');
      doc.moveDown();
      
      doc.text('Sincerely,');
      doc.moveDown();
      doc.moveDown();
      
      doc.text('____________________');
      doc.text('(Signature)');
      doc.moveDown();
      doc.moveDown();
      
      // Add footer
      doc.fontSize(8).text('This document was prepared with assistance from SmartDispute.ai, an AI-powered legal document service.', {
        align: 'center'
      });
      doc.text('The content of this document is provided for informational purposes only and does not constitute legal advice.', {
        align: 'center'
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Sends a dispute letter to a recipient with professional formatting and an attachment
 * 
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} recipientName - Name of the recipient for personalization
 * @param {string} pdfPath - Path to the PDF document to attach
 * @param {string} disputeText - Text to include in the generated PDF (if pdfPath is null)
 * @param {Object} options - Optional parameters
 * @param {string} options.subject - Email subject line (defaults to "Important: Legal Dispute Notification")
 * @param {string} options.customMessage - Additional message to include in the email body
 * @returns {Promise<Object>} Result object with success status and message information
 */
const sendDisputeLetter = async (recipientEmail, recipientName, pdfPath, disputeText, options = {}) => {
  if (!recipientEmail) {
    return { success: false, error: 'Recipient email is required' };
  }

  try {
    // Create transporter
    const transporter = createTransporter();

    // Generate a PDF if none provided
    let finalPdfPath = pdfPath;
    let shouldDeletePdf = false;

    if (!finalPdfPath) {
      finalPdfPath = await generatePDF(recipientName, disputeText);
      shouldDeletePdf = true; // Mark for deletion after sending
    }

    // Default options
    const defaultOptions = {
      subject: 'Important: Legal Dispute Notification',
      customMessage: ''
    };
    
    const mergedOptions = { ...defaultOptions, ...options };

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || `SmartDispute.ai <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: mergedOptions.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2a4b8d; margin-bottom: 5px;">SmartDispute.ai</h2>
            <p style="color: #666; font-size: 14px;">Legal Document Delivery Service</p>
          </div>
          
          <div style="border-left: 4px solid #2a4b8d; padding-left: 15px; margin-bottom: 20px;">
            <p>Dear ${recipientName},</p>
            <p>Please find attached an important legal dispute notification that requires your attention.</p>
            ${mergedOptions.customMessage ? `<p>${mergedOptions.customMessage}</p>` : ''}
            <p>This document has been prepared and sent using SmartDispute.ai's secure document delivery system.</p>
          </div>
          
          <div style="margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>This email and any attached documents are confidential and intended solely for the use of the individual or entity to whom they are addressed.</p>
            <p>If you believe you have received this message in error, please notify the sender immediately and delete this email.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
            <p>© ${new Date().getFullYear()} SmartDispute.ai | <a href="${process.env.APP_URL || process.env.SITE_URL || 'https://smartdispute.ai'}" style="color: #2a4b8d;">Visit our website</a></p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'Legal_Dispute_Notification.pdf',
          path: finalPdfPath
        }
      ]
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Clean up temp file if we generated it
    if (shouldDeletePdf && fs.existsSync(finalPdfPath)) {
      fs.unlinkSync(finalPdfPath);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending dispute letter:', error);
    return {
      success: false,
      error: error.message || 'Failed to send dispute letter'
    };
  }
};

export default sendDisputeLetter;