/**
 * Dispute Letter Routes for SmartDispute.ai
 * 
 * Handles generation and delivery of province-specific dispute letters
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import the template generator service
import templateGenerator from '../services/templateGenerator.js';

// Import the email sender module
import sendDisputeLetter from '../../send_email_gmail.js';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/evidence');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: function (req, file, cb) {
    // Accept common document types
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|rtf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only document files are allowed'));
  }
});

// Define legislation mapping
const legislationMap = {
  "ON": {
    "landlord_tenant": "Residential Tenancies Act, 2006",
    "credit_dispute": "Consumer Reporting Act (ON)",
    "cas": "Child, Youth and Family Services Act, 2017"
  },
  "BC": {
    "landlord_tenant": "Residential Tenancy Act",
    "credit_dispute": "Business Practices and Consumer Protection Act",
    "cas": "Child, Family and Community Service Act"
  },
  "AB": {
    "landlord_tenant": "Residential Tenancies Act",
    "credit_dispute": "Consumer Protection Act (AB)",
    "cas": "Child, Youth and Family Enhancement Act"
  },
  "QC": {
    "landlord_tenant": "Civil Code of Québec (articles 1851-1978)",
    "credit_dispute": "Consumer Protection Act (QC)",
    "cas": "Youth Protection Act"
  }
};

const router = express.Router();

/**
 * GET route for legislation mapping
 * Returns the legislation for each province and dispute type combination
 */
router.get('/legislation-map', (req, res) => {
  res.json(legislationMap);
});

/**
 * GET route for province list
 */
router.get('/provinces', (req, res) => {
  res.json(Object.keys(legislationMap));
});

/**
 * GET route for dispute types for a specific province
 */
router.get('/dispute-types/:province', (req, res) => {
  const province = req.params.province;
  if (legislationMap[province]) {
    res.json(Object.keys(legislationMap[province]));
  } else {
    res.status(404).json({ error: 'Province not found' });
  }
});

/**
 * POST route for generating a dispute letter
 * Accepts user information and optional document upload
 */
router.post('/generate', upload.array('documents', 5), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      province,
      disputeType,
      issueDescription,
      additionalNotes,
      recipientName,
      recipientEmail,
      recipientAddress
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !province || !disputeType || !issueDescription) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // File paths for uploaded evidence
    const uploadedFiles = req.files ? req.files.map(file => file.path) : [];

    // Generate the dispute document
    const userData = {
      fullName,
      email,
      phone,
      province,
      disputeType,
      issueDescription,
      additionalNotes,
      recipientName,
      recipientAddress,
      evidenceFiles: uploadedFiles
    };

    const documentResult = await templateGenerator.createDisputeDocument(userData);

    if (!documentResult.success) {
      return res.status(500).json({
        success: false,
        error: documentResult.error || 'Failed to generate dispute document'
      });
    }

    res.json({
      success: true,
      documentPath: documentResult.path,
      documentName: documentResult.filename,
      message: 'Dispute document generated successfully'
    });
  } catch (error) {
    console.error('Error generating dispute letter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * POST route for sending a dispute letter via email
 * Accepts the path to a generated document and sends it to specified recipients
 */
router.post('/send', async (req, res) => {
  try {
    const {
      documentPath,
      recipientEmail,
      recipientName,
      userEmail,
      userName,
      subject,
      message
    } = req.body;

    // Validate required fields
    if (!documentPath || !recipientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if the document exists
    if (!fs.existsSync(documentPath)) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Send email to recipient
    const emailResult = await sendDisputeLetter(
      recipientEmail,
      recipientName || 'Recipient',
      documentPath,
      {
        subject: subject || 'Important: Legal Dispute Notification',
        customMessage: message || ''
      }
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: emailResult.error || 'Failed to send dispute letter'
      });
    }

    // Also send a copy to the user if requested
    if (userEmail) {
      await sendDisputeLetter(
        userEmail,
        userName || 'User',
        documentPath,
        {
          subject: 'Copy of Your Dispute Letter',
          customMessage: 'This is a copy of the dispute letter you sent using SmartDispute.ai.'
        }
      );
    }

    res.json({
      success: true,
      messageId: emailResult.messageId,
      message: 'Dispute letter sent successfully'
    });
  } catch (error) {
    console.error('Error sending dispute letter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * POST route for generating and sending a dispute letter in one step
 */
router.post('/generate-and-send', upload.array('documents', 5), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      province,
      disputeType,
      issueDescription,
      additionalNotes,
      recipientName,
      recipientEmail,
      recipientAddress,
      subject,
      message,
      sendCopyToSelf
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !province || !disputeType || !issueDescription || !recipientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // File paths for uploaded evidence
    const uploadedFiles = req.files ? req.files.map(file => file.path) : [];

    // Generate the dispute document
    const userData = {
      fullName,
      email,
      phone,
      province,
      disputeType,
      issueDescription,
      additionalNotes,
      recipientName,
      recipientAddress,
      evidenceFiles: uploadedFiles
    };

    const documentResult = await templateGenerator.createDisputeDocument(userData);

    if (!documentResult.success) {
      return res.status(500).json({
        success: false,
        error: documentResult.error || 'Failed to generate dispute document'
      });
    }

    // Send email to recipient
    const emailResult = await sendDisputeLetter(
      recipientEmail,
      recipientName || 'Recipient',
      documentResult.path,
      {
        subject: subject || 'Important: Legal Dispute Notification',
        customMessage: message || ''
      }
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: emailResult.error || 'Failed to send dispute letter'
      });
    }

    // Also send a copy to the user if requested
    if (sendCopyToSelf) {
      await sendDisputeLetter(
        email,
        fullName,
        documentResult.path,
        {
          subject: 'Copy of Your Dispute Letter',
          customMessage: 'This is a copy of the dispute letter you sent using SmartDispute.ai.'
        }
      );
    }

    // Clean up the generated file after sending
    if (fs.existsSync(documentResult.path)) {
      fs.unlinkSync(documentResult.path);
    }

    res.json({
      success: true,
      messageId: emailResult.messageId,
      message: 'Dispute letter generated and sent successfully'
    });
  } catch (error) {
    console.error('Error generating and sending dispute letter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
});

export default router;