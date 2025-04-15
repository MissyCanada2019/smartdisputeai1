/**
 * Template Generator Service for SmartDispute.ai
 * 
 * This service handles generating dispute letters based on province and dispute type
 * by selecting the appropriate template and filling in user data.
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base directory for templates
const templatesDir = path.join(__dirname, '../../templates/disputes');

// Temp directory for generated PDFs
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Get the appropriate legislation text based on province and dispute type
 */
function getLegislationText(province, disputeType) {
  const legislationMap = {
    ON: {
      landlord_tenant: 'Residential Tenancies Act, 2006, S.O. 2006, c. 17',
      credit_dispute: 'Consumer Reporting Act, R.S.O. 1990, c. C.33',
      cas: 'Child, Youth and Family Services Act, 2017, S.O. 2017, c. 14, Sched. 1',
    },
    BC: {
      landlord_tenant: 'Residential Tenancy Act, S.B.C. 2002, c. 78',
      credit_dispute: 'Business Practices and Consumer Protection Act, S.B.C. 2004, c. 2',
      cas: 'Child, Family and Community Service Act, R.S.B.C. 1996, c. 46',
    },
    AB: {
      landlord_tenant: 'Residential Tenancies Act, S.A. 2004, c. R-17.1',
      credit_dispute: 'Consumer Protection Act, R.S.A. 2000, c. C-26.3',
      cas: 'Child, Youth and Family Enhancement Act, R.S.A. 2000, c. C-12',
    },
    QC: {
      landlord_tenant: 'Civil Code of Québec, CQLR c CCQ-1991, arts. 1851-1978',
      credit_dispute: 'Consumer Protection Act, CQLR c P-40.1',
      cas: 'Youth Protection Act, CQLR c P-34.1',
    },
  };

  return (legislationMap[province] && legislationMap[province][disputeType]) || 
         'Applicable provincial legislation';
}

/**
 * Get the appropriate regulator/authority based on province and dispute type
 */
function getAuthority(province, disputeType) {
  const authorityMap = {
    ON: {
      landlord_tenant: 'Landlord and Tenant Board',
      credit_dispute: 'Financial Services Regulatory Authority of Ontario',
      cas: 'Ontario Association of Children's Aid Societies',
    },
    BC: {
      landlord_tenant: 'Residential Tenancy Branch',
      credit_dispute: 'Consumer Protection BC',
      cas: 'Ministry of Children and Family Development',
    },
    AB: {
      landlord_tenant: 'Residential Tenancy Dispute Resolution Service',
      credit_dispute: 'Service Alberta, Consumer Investigations Unit',
      cas: 'Alberta Children's Services',
    },
    QC: {
      landlord_tenant: 'Tribunal administratif du logement',
      credit_dispute: 'Office de la protection du consommateur',
      cas: 'Direction de la protection de la jeunesse',
    },
  };

  return (authorityMap[province] && authorityMap[province][disputeType]) || 
         'Relevant provincial authority';
}

/**
 * Generate a PDF document with dispute information
 * 
 * @param {Object} userData User information and dispute details
 * @returns {Promise<string>} Path to the generated PDF
 */
export async function generateDisputeDocument(userData) {
  return new Promise((resolve, reject) => {
    try {
      // Validate required user data
      if (!userData.fullName || !userData.email || !userData.province || !userData.disputeType) {
        throw new Error('Missing required user information');
      }

      // Normalize dispute type for file paths
      const normalizedDisputeType = userData.disputeType.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Create a unique filename
      const timestamp = Date.now();
      const userInitials = userData.fullName.split(' ').map(name => name[0]).join('').toUpperCase();
      const pdfFilename = `dispute_${normalizedDisputeType}_${userData.province}_${userInitials}_${timestamp}.pdf`;
      const pdfPath = path.join(tempDir, pdfFilename);
      
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(pdfPath);
      
      writeStream.on('finish', () => resolve(pdfPath));
      writeStream.on('error', reject);
      
      doc.pipe(writeStream);
      
      // Get legislation and authority information
      const legislation = getLegislationText(userData.province, normalizedDisputeType);
      const authority = getAuthority(userData.province, normalizedDisputeType);
      
      // Add letterhead
      doc.fontSize(16).font('Helvetica-Bold').text('SmartDispute.ai', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Legal Dispute Resolution Document', { align: 'center' });
      doc.moveDown();
      
      // Add current date
      const today = new Date();
      doc.text(`Date: ${today.toLocaleDateString()}`);
      doc.moveDown();
      
      // Add recipient name (if provided)
      if (userData.recipientName) {
        doc.text(`TO: ${userData.recipientName}`);
        if (userData.recipientAddress) {
          userData.recipientAddress.split('\n').forEach(line => {
            doc.text(line);
          });
        }
        doc.moveDown();
      }
      
      // Add sender information
      doc.text(`FROM: ${userData.fullName}`);
      if (userData.address) {
        userData.address.split('\n').forEach(line => {
          doc.text(line);
        });
      }
      doc.text(`Email: ${userData.email}`);
      if (userData.phone) {
        doc.text(`Phone: ${userData.phone}`);
      }
      doc.moveDown();
      
      // Add reference line
      doc.font('Helvetica-Bold').text(`RE: DISPUTE NOTIFICATION - ${userData.disputeType.toUpperCase()} MATTER`);
      doc.font('Helvetica').moveDown();
      
      // Add legislation reference
      doc.text(`Under the authority of the ${legislation}, I am writing to formally dispute the following matter:`);
      doc.moveDown();
      
      // Add dispute description
      doc.font('Helvetica-Bold').text('DISPUTE DETAILS:');
      doc.font('Helvetica').moveDown();
      doc.text(userData.issueDescription || 'No details provided', { align: 'justify' });
      doc.moveDown();
      
      // Add additional notes if provided
      if (userData.additionalNotes) {
        doc.font('Helvetica-Bold').text('ADDITIONAL INFORMATION:');
        doc.font('Helvetica').moveDown();
        doc.text(userData.additionalNotes, { align: 'justify' });
        doc.moveDown();
      }
      
      // Add request for resolution
      doc.text('I request that this matter be resolved in accordance with the applicable legislation and regulations. Please respond to this notice within 14 days of receipt.');
      doc.moveDown();
      
      // Add reference to authority
      doc.text(`If this matter cannot be resolved directly, I reserve the right to escalate this dispute to the ${authority} or other appropriate legal channels.`);
      doc.moveDown();
      
      // Add closing
      doc.text('Sincerely,');
      doc.moveDown();
      doc.moveDown();
      
      doc.text('____________________');
      doc.text(`${userData.fullName}`);
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
}

/**
 * Generate a dispute document and return metadata
 * 
 * @param {Object} userData User information and dispute details
 * @returns {Promise<Object>} Object containing file path and metadata
 */
export async function createDisputeDocument(userData) {
  try {
    const pdfPath = await generateDisputeDocument(userData);
    
    return {
      success: true,
      path: pdfPath,
      filename: path.basename(pdfPath),
      timestamp: Date.now(),
      metadata: {
        user: userData.fullName,
        province: userData.province,
        disputeType: userData.disputeType,
        created: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error generating dispute document:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate dispute document'
    };
  }
}

export default {
  createDisputeDocument,
  generateDisputeDocument
};