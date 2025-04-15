/**
 * Document Notification Service
 * Handles sending notifications about document analysis and generation
 */

import { emailService } from './emailService';
import * as advancedNlpService from './advancedNlpService';
import { DocumentAnalysisResult } from './advancedNlpService';
import path from 'path';
import { promises as fs } from 'fs';

/**
 * Document notification service class
 */
class DocumentNotificationService {
  /**
   * Notify user about completed document analysis
   * @param email User email
   * @param name User name
   * @param documentPath Path to the original document
   * @param analysisResult Analysis result
   * @param userId User ID
   * @returns Promise with notification status
   */
  async notifyAnalysisComplete(
    email: string,
    name: string,
    documentName: string,
    analysisResult: DocumentAnalysisResult,
    userId: string | number,
    analysisId: string | number
  ): Promise<boolean> {
    try {
      // Save analysis result to PDF if needed
      // This would involve implementing a PDF generation service
      // For now, we'll just send the email notification
      
      return await emailService.sendAnalysisComplete(
        email,
        name,
        analysisId,
        documentName,
        userId
      );
    } catch (error) {
      console.error('Failed to send analysis completion notification:', error);
      return false;
    }
  }

  /**
   * Send document and analysis to user
   * @param email User email
   * @param name User name
   * @param documentPath Path to the document file
   * @param documentType Type of document
   * @param documentId Document ID
   * @param userId User ID
   * @returns Promise with notification status
   */
  async sendDocumentToUser(
    email: string,
    name: string,
    documentPath: string,
    documentType: string,
    documentId: string | number,
    userId: string | number
  ): Promise<boolean> {
    try {
      return await emailService.sendDocumentDelivery(
        email,
        name,
        documentPath,
        documentType,
        documentId,
        userId
      );
    } catch (error) {
      console.error('Failed to send document to user:', error);
      return false;
    }
  }
  
  /**
   * Analyze document and notify user (combined operation)
   * @param email User email
   * @param name User name
   * @param filePath Path to document file
   * @param documentType Optional document type
   * @param jurisdiction Optional jurisdiction
   * @param userId User ID
   * @returns Promise with analysis result and notification status
   */
  async analyzeDocumentAndNotify(
    email: string,
    name: string,
    filePath: string,
    documentType: string | null,
    jurisdiction: string,
    userId: string | number,
    analysisId: string | number
  ): Promise<{ analysisResult: DocumentAnalysisResult; notificationSent: boolean }> {
    try {
      // Analyze the document
      const analysisResult = await advancedNlpService.analyzeDocumentFile(
        filePath,
        documentType,
        jurisdiction
      );
      
      // Get document name from file path
      const documentName = path.basename(filePath);
      
      // Send notification
      const notificationSent = await this.notifyAnalysisComplete(
        email,
        name,
        documentName,
        analysisResult,
        userId,
        analysisId
      );
      
      return {
        analysisResult,
        notificationSent
      };
    } catch (error) {
      console.error('Error in document analysis and notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const documentNotificationService = new DocumentNotificationService();