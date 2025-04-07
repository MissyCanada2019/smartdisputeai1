/**
 * Email Service for SmartDispute.ai
 * 
 * Handles all email functionality including:
 * - Template rendering using MJML and Handlebars
 * - Secure email sending with credentials from environment variables
 * - Attachment handling for documents
 * - Email tracking capability
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const mjml2html = require('mjml');
const handlebars = require('handlebars');

class EmailService {
  constructor() {
    // Initialize the transporter if we have the necessary credentials
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      console.warn('Email service credentials not provided. Email functionality will be disabled.');
    }
    
    // Register Handlebars helpers
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });
  }
  
  /**
   * Renders an email template with given context data
   * 
   * @param {string} templateName - Name of the template file (without extension)
   * @param {Object} data - Context data to render in the template
   * @returns {string} Rendered HTML
   */
  async renderTemplate(templateName, data = {}) {
    try {
      // Add default data
      const context = {
        ...data,
        year: new Date().getFullYear(),
        siteUrl: process.env.SITE_URL || 'https://smartdispute.ai',
      };
      
      // Read the MJML template
      const templatePath = path.join(__dirname, '..', 'email-templates', `${templateName}.mjml`);
      const mjmlTemplate = fs.readFileSync(templatePath, 'utf8');
      
      // Compile with Handlebars
      const compiledTemplate = handlebars.compile(mjmlTemplate);
      const mjmlContent = compiledTemplate(context);
      
      // Convert MJML to HTML
      const { html } = mjml2html(mjmlContent);
      return html;
    } catch (error) {
      console.error(`Error rendering email template ${templateName}:`, error);
      throw new Error(`Failed to render email template: ${error.message}`);
    }
  }
  
  /**
   * Sends an email using a template
   * 
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.templateName - Template name to use
   * @param {Object} options.data - Data for template rendering
   * @param {Array} options.attachments - Email attachments
   * @param {string} options.text - Plain text fallback (optional)
   * @returns {Promise} - Resolves with sending info
   */
  async sendTemplateEmail({ to, subject, templateName, data = {}, attachments = [], text = '' }) {
    if (!this.transporter) {
      throw new Error('Email service not configured. Check environment variables.');
    }
    
    try {
      // Render the HTML template
      const html = await this.renderTemplate(templateName, data);
      
      // Generate plain text fallback if not provided
      if (!text) {
        // Basic fallback - in production, consider using html-to-text package
        text = `${subject}\n\nPlease view this email in an HTML-compatible email client.`;
      }
      
      // Send the email
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
        attachments
      });
      
      return {
        success: true,
        messageId: info.messageId,
        info
      };
    } catch (error) {
      console.error('Failed to send template email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Sends a simple email without a template
   * 
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content (optional)
   * @param {Array} options.attachments - Email attachments (optional)
   * @returns {Promise} - Resolves with sending info
   */
  async sendEmail({ to, subject, text, html = '', attachments = [] }) {
    if (!this.transporter) {
      throw new Error('Email service not configured. Check environment variables.');
    }
    
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
        attachments
      });
      
      return {
        success: true,
        messageId: info.messageId,
        info
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Sends a document via email
   * 
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.documentPath - Path to the document
   * @param {string} options.documentName - Name of the document
   * @param {string} options.message - Custom message to include
   * @returns {Promise} - Resolves with sending info
   */
  async sendDocument({ to, subject, documentPath, documentName, message = '' }) {
    try {
      // Prepare template data
      const templateData = {
        recipientEmail: to,
        documentName,
        message: message || 'Please find your requested document attached.',
        date: new Date().toISOString(),
        testId: Math.floor(Math.random() * 1000000)
      };
      
      // Prepare attachments
      const attachments = [{
        filename: documentName,
        path: documentPath
      }];
      
      // Send email with template
      return await this.sendTemplateEmail({
        to,
        subject: subject || `Your requested document: ${documentName}`,
        templateName: 'test-template', // In production, use a proper document template
        data: templateData,
        attachments
      });
    } catch (error) {
      console.error('Failed to send document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verifies SMTP connection and credentials
   * @returns {Promise<boolean>} True if connection is successful
   */
  async verifyConnection() {
    if (!this.transporter) {
      console.error('Email transporter not initialized.');
      return false;
    }
    
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;