/**
 * Simple Email Sender for SmartDispute.ai
 * 
 * A streamlined email service with web form for generating and sending dispute letters.
 * Produces a PDF directly from user input and emails it to the user.
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.EMAIL_PORT || 3030;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

// Generate PDF dispute letter
function generateDisputePDF(fullName, issue, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);
    
    // Add a header
    doc.fontSize(22).text('SmartDispute.ai', { align: 'center' });
    doc.fontSize(14).text('Legal Dispute Letter', { align: 'center' });
    doc.moveDown(2);
    
    // Date
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);
    
    // Letter content
    doc.fontSize(12).text(`To Whom It May Concern,\n`, { lineGap: 10 });
    doc.text(`My name is ${fullName}, and I am writing to formally dispute the following issue:`, { lineGap: 10 });
    doc.moveDown(1);
    doc.text(issue, { lineGap: 10 });
    doc.moveDown(1);
    doc.text(`I respectfully request that this matter be investigated and resolved as soon as possible.\n`);
    doc.moveDown(2);
    doc.text(`Sincerely,`);
    doc.moveDown(1);
    doc.text(`${fullName}`);
    
    doc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
}

// Send dispute letter via email
async function sendDisputeLetter(toEmail, fullName, issue) {
  const pdfPath = path.resolve(__dirname, 'dispute_letter.pdf');
  await generateDisputePDF(fullName, issue, pdfPath);

  const mailOptions = {
    from: `SmartDispute.ai <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Legal Dispute Letter is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a5568; margin: 0;">SmartDispute.ai</h2>
          <p style="color: #718096; font-size: 14px;">Legal Self-Help Platform</p>
        </div>
        
        <p>Hi ${fullName},</p>
        
        <p>Attached is your generated legal dispute letter.</p>
        
        <p>If you need additional help or want to submit this letter directly to a credit bureau, 
        housing provider, or government agency, please reply to this email.</p>
        
        <p>Thank you for using SmartDispute.ai for your legal self-help needs.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p style="color: #718096; font-size: 12px; text-align: center;">
          SmartDispute.ai - Empowering Canadians through accessible legal tools
        </p>
      </div>
    `,
    text: `Hi ${fullName},\n\nAttached is your generated legal dispute letter.\n\nIf you need additional help or want to submit this letter directly to a credit bureau, housing provider, or government agency, please reply to this email.\n\n- SmartDispute.ai`,
    attachments: [
      {
        filename: 'dispute_letter.pdf',
        path: pdfPath
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', toEmail);
    fs.unlinkSync(pdfPath); // Auto-delete PDF after sending
    return { success: true };
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, error: err.message };
  }
}

// Main form page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SmartDispute.ai | Free Legal Letter Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            background: #f8f9fa; 
            color: #333; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            text-align: center;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          input, textarea { 
            width: 100%; 
            padding: 12px; 
            margin: 8px 0 20px; 
            border-radius: 5px; 
            border: 1px solid #ddd; 
            box-sizing: border-box;
          }
          button { 
            background-color: #4a5568; 
            color: white; 
            padding: 12px 25px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 16px;
            transition: background-color 0.3s;
          }
          button:hover { 
            background-color: #2d3748; 
          }
          h1 { 
            color: #4a5568; 
            margin-bottom: 5px;
          }
          .tagline {
            color: #718096;
            margin-top: 0;
            margin-bottom: 30px;
          }
          form { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            text-align: left;
          }
          label {
            font-weight: 600;
            display: block;
            margin-bottom: 5px;
            color: #4a5568;
          }
          .logo {
            margin-bottom: 20px;
            font-size: 28px;
            font-weight: bold;
            color: #4a5568;
          }
          .form-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">SmartDispute.ai</div>
          <h1>Free Legal Dispute Letter Generator</h1>
          <p class="tagline">Generate and email your legal dispute letter instantly and for free.</p>
          
          <form method="POST" action="/send">
            <label for="fullName">Your Full Name</label>
            <input type="text" id="fullName" name="fullName" placeholder="e.g. John Smith" required>
            
            <label for="email">Your Email Address</label>
            <input type="email" id="email" name="email" placeholder="e.g. john@example.com" required>
            
            <label for="issue">Describe Your Legal Dispute</label>
            <textarea id="issue" name="issue" placeholder="Please provide details about your legal issue..." rows="6" required></textarea>
            
            <button type="submit">Generate & Email Letter</button>
            
            <div class="form-footer">
              Your information is kept private and secure.
            </div>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Form submission handler
app.post('/send', async (req, res) => {
  const { fullName, email, issue } = req.body;
  const result = await sendDisputeLetter(email, fullName, issue);
  
  if (result.success) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Letter Sent | SmartDispute.ai</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              background: #f8f9fa; 
              color: #333; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              text-align: center;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              margin-top: 50px;
            }
            h2 { 
              color: #4a5568; 
            }
            .success-icon {
              color: #48bb78;
              font-size: 48px;
              margin-bottom: 20px;
            }
            .back-link {
              display: inline-block;
              margin-top: 20px;
              color: #4a5568;
              text-decoration: none;
            }
            .back-link:hover {
              text-decoration: underline;
            }
            .email-highlight {
              font-weight: bold;
              color: #4a5568;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h2>Thank you, ${fullName}!</h2>
            <p>Your dispute letter has been sent to <span class="email-highlight">${email}</span>.</p>
            <p>Check your inbox (and spam folder) for your PDF letter.</p>
            <p>If you need further support, you can reply to the email you received.</p>
            <a href="/" class="back-link">Generate another letter</a>
          </div>
        </body>
      </html>
    `);
  } else {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error | SmartDispute.ai</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              background: #f8f9fa; 
              color: #333; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              text-align: center; 
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              margin-top: 50px;
            }
            h2 { 
              color: #e53e3e; 
            }
            .error-icon {
              color: #e53e3e;
              font-size: 48px;
              margin-bottom: 20px;
            }
            .back-link {
              display: inline-block;
              margin-top: 20px;
              color: #4a5568;
              text-decoration: none;
            }
            .back-link:hover {
              text-decoration: underline;
            }
            .error-details {
              background: #fff5f5;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
              text-align: left;
              font-family: monospace;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">✕</div>
            <h2>There was a problem sending your letter</h2>
            <p>We encountered an error while trying to send your dispute letter.</p>
            <div class="error-details">
              ${result.error}
            </div>
            <p>Please try again later or contact support for assistance.</p>
            <a href="/" class="back-link">Try again</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple dispute letter generator running on port ${PORT}`);
  
  // Email configuration check
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.log('⚠️  Warning: Gmail credentials not configured');
    console.log('Set GMAIL_USER and GMAIL_APP_PASS in your .env file');
  } else {
    console.log(`✅ Email service configured with: ${process.env.GMAIL_USER}`);
  }
});

module.exports = { app, sendDisputeLetter };