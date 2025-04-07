// Node.js email sender using Gmail + App Password + PDF attachment support
// Be sure to install 'nodemailer', 'dotenv', and 'pdfkit'

require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Load credentials from .env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,       // e.g., smartdisputecanada@gmail.com
    pass: process.env.GMAIL_APP_PASS    // 16-character App Password from Google
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
    doc.fontSize(14).text(`To Whom It May Concern,\n`, { lineGap: 10 });
    doc.text(`My name is ${fullName}, and I am writing to formally dispute the following issue:`, { lineGap: 10 });
    doc.text(issue, { lineGap: 10 });
    doc.text(`\nI respectfully request that this matter be investigated and resolved as soon as possible.\n`);
    doc.text(`\nSincerely,\n${fullName}`);

    doc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
}

/**
 * Sends a dispute letter PDF to the client via Gmail
 * @param {string} toEmail - Recipient's email
 * @param {string} fullName - Recipient's name
 * @param {string} pdfPath - Path to existing PDF file, or null to generate one
 * @param {string} issue - Description of the dispute (used if pdfPath is null)
 */
async function sendDisputeLetter(toEmail, fullName, pdfPath, issue) {
  try {
    // If a PDF path is provided and exists, use it; otherwise generate a PDF
    let finalPdfPath = pdfPath;
    
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      if (!issue) {
        throw new Error('Either an existing PDF path or issue description must be provided');
      }
      
      finalPdfPath = path.resolve(__dirname, 'dispute_letter.pdf');
      await generateDisputePDF(fullName, issue, finalPdfPath);
    }

    const mailOptions = {
      from: `SmartDispute.ai <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Your Legal Dispute Letter is Ready',
      text: `Hi ${fullName},\n\nAttached is your generated legal dispute letter.\n\nIf you need additional help or want to submit this letter directly to a credit bureau, housing provider, or government agency, please reply to this email.\n\n- SmartDispute.ai`,
      attachments: [
        {
          filename: 'dispute_letter.pdf',
          path: finalPdfPath
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', toEmail);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, error: err.message };
  }
}

module.exports = sendDisputeLetter;