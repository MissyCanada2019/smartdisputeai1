/**
 * Document Notification Service for SmartDispute.ai
 * 
 * Handles notifications related to documents:
 * - Sending document analysis results via email
 * - Delivering legal documents to users
 * - Sending notifications about document status changes
 */

const emailService = require('./emailService');
const fs = require('fs');
const path = require('path');

class DocumentNotificationService {
  /**
   * Sends document analysis results via email
   * 
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.documentName - Name of the analyzed document
   * @param {Object} options.analysisResults - Results of the document analysis
   * @param {string} options.documentPath - Optional path to the original document
   * @returns {Promise} - Resolves with sending info
   */
  async sendAnalysisResults({ to, documentName, analysisResults, documentPath = null }) {
    try {
      // Prepare email data
      const templateData = {
        recipientEmail: to,
        documentName,
        analysisDate: new Date().toISOString(),
        analysisId: `AN${Math.floor(Math.random() * 10000000)}`,
        
        // Analysis results
        keyPoints: analysisResults.keyPoints || [],
        legalIssues: analysisResults.legalIssues || [],
        recommendations: analysisResults.recommendations || [],
        score: analysisResults.score || null,
        summary: analysisResults.summary || 'No summary available',
        
        // Dashboard link
        dashboardUrl: `${process.env.SITE_URL || 'https://smartdispute.ai'}/dashboard/documents/${analysisResults.id || 'latest'}`
      };
      
      // Prepare attachments
      const attachments = [];
      
      // If original document path is provided, attach it
      if (documentPath && fs.existsSync(documentPath)) {
        attachments.push({
          filename: documentName,
          path: documentPath
        });
      }
      
      // Send the email
      return await emailService.sendTemplateEmail({
        to,
        subject: `SmartDispute.ai - Analysis Results: ${documentName}`,
        templateName: 'test-template', // In production, use a proper analysis template
        data: templateData,
        attachments
      });
    } catch (error) {
      console.error('Failed to send analysis results:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Sends a notification when a document is ready for review
   * 
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.documentName - Name of the document
   * @param {string} options.documentId - ID of the document
   * @returns {Promise} - Resolves with sending info
   */
  async sendDocumentReadyNotification({ to, documentName, documentId }) {
    try {
      // Prepare email data
      const templateData = {
        name: to.split('@')[0], // Simple name extraction - improve in production
        documentName,
        date: new Date().toISOString(),
        buttonUrl: `${process.env.SITE_URL || 'https://smartdispute.ai'}/documents/${documentId}`
      };
      
      // Send the email
      return await emailService.sendTemplateEmail({
        to,
        subject: `SmartDispute.ai - Document Ready: ${documentName}`,
        templateName: 'test-template', // In production, use a proper notification template
        data: templateData
      });
    } catch (error) {
      console.error('Failed to send document ready notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Sends a batch of documents via email
   * 
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {Array} options.documents - Array of document objects with paths and names
   * @param {string} options.subject - Email subject
   * @param {string} options.message - Custom message to include
   * @returns {Promise} - Resolves with sending info
   */
  async sendDocumentBatch({ to, documents, subject, message }) {
    try {
      if (!Array.isArray(documents) || documents.length === 0) {
        throw new Error('No documents provided for batch sending');
      }
      
      // Prepare email data
      const templateData = {
        name: to.split('@')[0], // Simple name extraction - improve in production
        documentCount: documents.length,
        documentNames: documents.map(doc => doc.name).join(', '),
        message: message || `You have received ${documents.length} documents from SmartDispute.ai`,
        date: new Date().toISOString()
      };
      
      // Prepare attachments
      const attachments = documents.map(doc => ({
        filename: doc.name,
        path: doc.path
      }));
      
      // Send the email
      return await emailService.sendTemplateEmail({
        to,
        subject: subject || `SmartDispute.ai - ${documents.length} Documents Delivered`,
        templateName: 'test-template', // In production, use a proper batch document template
        data: templateData,
        attachments
      });
    } catch (error) {
      console.error('Failed to send document batch:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const documentNotificationService = new DocumentNotificationService();
module.exports = documentNotificationService;