/**
 * Send Dispute Letter - CommonJS version
 * Simple function to send dispute letters via Gmail
 */
require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Create email transporter using credentials from .env file
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASS
  }
});

/**
 * Generates a basic legal dispute letter PDF
 * @param {string} fullName - User's full name
 * @param {string} issue - Description of the dispute
 * @param {string} outputPath - Path where the PDF will be saved
 */
function generateDisputePDF(fullName, issue, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);
    
    // Add header with logo if available
    try {
      const logoPath = path.resolve(__dirname, './client/src/assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 150 });
        doc.moveDown(2);
      }
    } catch (err) {
      // Continue without logo if there's an error
    }
    
    // Add date
    doc.fontSize(10).text(new Date().toLocaleDateString('en-CA', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }), { align: 'right' });
    
    doc.moveDown(2);
    doc.fontSize(14).text(`To Whom It May Concern,\n`, { lineGap: 10 });
    doc.text(`My name is ${fullName}, and I am writing to formally dispute the following issue:`, { lineGap: 10 });
    doc.fontSize(12).text(issue, { lineGap: 10, indent: 20 });
    doc.fontSize(14).text(`\nI respectfully request that this matter be investigated and resolved as soon as possible.\n`);
    doc.moveDown(2);
    doc.text(`\nSincerely,\n${fullName}`);
    
    // Add footer
    doc.fontSize(8).text('Generated by SmartDispute.ai - Empowering Canadians with AI-driven legal assistance', {
      align: 'center',
      bottom: 30
    });

    doc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
}

/**
 * Sends a dispute letter to a client via email with PDF attachment
 * 
 * @param {string} toEmail - Recipient's email address
 * @param {string} fullName - Recipient's full name
 * @param {string} pdfPath - Path to existing PDF file to attach, or pass issue text to generate one
 * @param {string} issue - Optional description of the dispute (used if pdfPath is not an existing file)
 */
async function sendDisputeLetter(toEmail, fullName, pdfPath, issue = null) {
  try {
    // Check if we need to generate a PDF
    let finalPdfPath = pdfPath;
    
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      if (!issue) {
        throw new Error('Either an existing PDF path or issue description must be provided');
      }
      
      // Generate a PDF if path doesn't exist but issue is provided
      finalPdfPath = path.resolve(__dirname, 'dispute_letter.pdf');
      await generateDisputePDF(fullName, issue, finalPdfPath);
    }

    // Prepare email
    const mailOptions = {
      from: `SmartDispute.ai <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Your Legal Dispute Letter is Ready',
      text: `Hi ${fullName},

Attached is your generated legal dispute letter.

If you need additional help or want to submit this letter directly to a credit bureau, housing provider, or government agency, please reply to this email or contact us through our website.

Thank you for using our service.

- SmartDispute.ai Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2a4d69; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">SmartDispute.ai</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hi ${fullName},</p>
            <p>Attached is your <strong>generated legal dispute letter</strong>.</p>
            <p>If you need additional help or want to submit this letter directly to a credit bureau, housing provider, or government agency, please reply to this email or contact us through our website.</p>
            <p>Thank you for using our service.</p>
            <p>- SmartDispute.ai Team</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} SmartDispute.ai - Empowering Canadians with AI-driven legal assistance</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: path.basename(finalPdfPath) || 'dispute_letter.pdf',
          path: finalPdfPath
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to', toEmail);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Error sending email:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = sendDisputeLetter;