/**
 * Email Service for SmartDispute.ai
 * Handles email delivery with secure credentials, templates, and tracking
 */

import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';

// Email Templates
const EMAIL_TEMPLATES = {
  DOCUMENT_DELIVERY: 'document-delivery',
  ACCOUNT_WELCOME: 'account-welcome',
  PASSWORD_RESET: 'password-reset',
  ANALYSIS_COMPLETE: 'analysis-complete'
};

// Email tracking pixel (Base64 encoded 1x1 transparent GIF)
const TRACKING_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Interface for email options
 */
interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  templateData: Record<string, any>;
  attachments?: Attachment[];
  cc?: string | string[];
  bcc?: string | string[];
  trackOpens?: boolean;
  trackLinks?: boolean;
}

/**
 * Interface for email attachments
 */
interface Attachment {
  filename: string;
  path: string;
  contentType?: string;
}

/**
 * Interface for email tracking data
 */
interface EmailTrackingData {
  recipientId: string | number;
  emailType: string;
  documentId?: string | number;
  timestamp: Date;
}

/**
 * Email Service Class
 */
class EmailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;
  private siteUrl: string;
  
  /**
   * Create email service instance
   */
  constructor() {
    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email service credentials missing. Emails will not be sent.');
    }
    
    // Create transporter
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || ''
      }
    });
    
    this.fromAddress = process.env.EMAIL_FROM || 'SmartDispute.ai <support@smartdispute.ai>';
    this.siteUrl = process.env.SITE_URL || 'https://smartdispute.ai';
  }
  
  /**
   * Send email using template
   * @param options Email options
   * @returns Promise with sending result
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Load and compile email template
      const htmlContent = await this.compileTemplate(options.template, {
        ...options.templateData,
        siteUrl: this.siteUrl,
        trackingPixel: options.trackOpens ? TRACKING_PIXEL : null,
        currentYear: new Date().getFullYear()
      });
      
      // Create text version (simple conversion)
      const textContent = this.createTextVersion(htmlContent);
      
      // Add tracking IDs to links if enabled
      const trackingId = `${options.templateData.userId || 'guest'}-${Date.now()}`;
      const processedHtml = options.trackLinks 
        ? this.addLinkTracking(htmlContent, trackingId) 
        : htmlContent;
        
      // Prepare mail options
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.fromAddress,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: textContent,
        html: processedHtml,
        attachments: options.attachments,
      };
      
      // Save tracking data if needed
      if (options.trackOpens || options.trackLinks) {
        await this.saveTrackingData({
          recipientId: options.templateData.userId || 'guest',
          emailType: options.template,
          documentId: options.templateData.documentId,
          timestamp: new Date()
        });
      }
      
      // Send the email
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
  
  /**
   * Send document delivery email
   * @param to Recipient email
   * @param name Recipient name
   * @param documentPath Path to document file
   * @param documentType Type of document
   * @param documentId Document ID
   * @param userId User ID
   * @returns Promise with sending result
   */
  async sendDocumentDelivery(
    to: string, 
    name: string, 
    documentPath: string, 
    documentType: string,
    documentId: string | number,
    userId: string | number
  ): Promise<boolean> {
    // Validate document existence
    try {
      await fs.access(documentPath);
    } catch (error) {
      console.error(`Document not found at path: ${documentPath}`);
      return false;
    }
    
    // Get document filename
    const filename = path.basename(documentPath);
    
    // Send email
    return this.sendEmail({
      to,
      subject: `Your ${documentType} Document from SmartDispute.ai`,
      template: EMAIL_TEMPLATES.DOCUMENT_DELIVERY,
      templateData: {
        name,
        documentType,
        documentId,
        userId,
        documentDate: new Date().toLocaleDateString(),
        helpLink: `${this.siteUrl}/document/${documentId}/help`,
        dashboardLink: `${this.siteUrl}/dashboard`
      },
      attachments: [
        {
          filename: filename,
          path: documentPath
        }
      ],
      trackOpens: true,
      trackLinks: true
    });
  }
  
  /**
   * Send document analysis completion email
   * @param to Recipient email
   * @param name Recipient name
   * @param analysisId Analysis ID
   * @param documentName Document name
   * @param userId User ID
   * @returns Promise with sending result
   */
  async sendAnalysisComplete(
    to: string,
    name: string,
    analysisId: string | number,
    documentName: string,
    userId: string | number
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Your Document Analysis is Complete',
      template: EMAIL_TEMPLATES.ANALYSIS_COMPLETE,
      templateData: {
        name,
        documentName,
        analysisId,
        userId,
        analysisDate: new Date().toLocaleDateString(),
        analysisLink: `${this.siteUrl}/analysis/${analysisId}`,
        dashboardLink: `${this.siteUrl}/dashboard`
      },
      trackOpens: true,
      trackLinks: true
    });
  }
  
  /**
   * Compile email template with data
   * @param templateName Template name
   * @param data Template data
   * @returns Compiled HTML
   */
  private async compileTemplate(templateName: string, data: any): Promise<string> {
    try {
      // Load template
      const templatePath = path.join(process.cwd(), 'server', 'email-templates', `${templateName}.mjml`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Convert MJML to HTML
      const { html } = mjml2html(templateContent);
      
      // Compile with Handlebars
      const template = Handlebars.compile(html);
      return template(data);
    } catch (error) {
      console.error(`Error compiling email template ${templateName}:`, error);
      
      // Fallback to basic template
      const fallbackTemplate = `
        <html>
          <body>
            <h1>SmartDispute.ai</h1>
            <p>Hello {{name}},</p>
            <p>{{message}}</p>
            <p>Thank you for using SmartDispute.ai</p>
            <p><a href="{{siteUrl}}">Visit Dashboard</a></p>
            {{#if trackingPixel}}<img src="{{trackingPixel}}" alt="" width="1" height="1">{{/if}}
          </body>
        </html>
      `;
      
      const template = Handlebars.compile(fallbackTemplate);
      return template(data);
    }
  }
  
  /**
   * Create plain text version from HTML
   * @param html HTML content
   * @returns Plain text content
   */
  private createTextVersion(html: string): string {
    // Basic HTML to text conversion
    return html
      .replace(/<style([\s\S]*?)<\/style>/gi, '')
      .replace(/<script([\s\S]*?)<\/script>/gi, '')
      .replace(/<\/div>/ig, '\n')
      .replace(/<\/li>/ig, '\n')
      .replace(/<li>/ig, '  * ')
      .replace(/<\/ul>/ig, '\n')
      .replace(/<\/p>/ig, '\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/ig, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&');
  }
  
  /**
   * Add tracking parameters to links
   * @param html HTML content
   * @param trackingId Tracking ID
   * @returns HTML with tracking links
   */
  private addLinkTracking(html: string, trackingId: string): string {
    // Add tracking parameters to all links in the HTML
    return html.replace(
      /<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/gi,
      (match, url, rest) => {
        // Skip if already has tracking or is a mailto link
        if (url.includes('utm_source') || url.includes('mailto:')) {
          return match;
        }
        
        const separator = url.includes('?') ? '&' : '?';
        const trackedUrl = `${url}${separator}utm_source=email&utm_medium=sendout&utm_campaign=smartdispute&utm_content=${trackingId}`;
        return `<a href="${trackedUrl}"${rest}>`;
      }
    );
  }
  
  /**
   * Save email tracking data
   * @param trackingData Tracking data
   */
  private async saveTrackingData(trackingData: EmailTrackingData): Promise<void> {
    // In a real implementation, save to database
    // For now, just log
    console.log('Email tracking data:', trackingData);
    
    // TODO: Implement database storage with proper schema
  }
}

// Export singleton instance
export const emailService = new EmailService();