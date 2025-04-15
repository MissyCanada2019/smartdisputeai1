/**
 * Mobile Document Analysis Utilities
 * Provides a simplified interface for mobile document analysis functions
 */

import Gx from './mobileApiClient';

/**
 * Upload and analyze a document from a mobile device
 * 
 * @param formData - FormData containing the document file and analysis options
 * @returns Promise with analysis results
 */
export async function analyzeDocument(formData: FormData): Promise<any> {
  try {
    // Log the formData contents for debugging
    console.log('FormData keys:');
    for (const key of Array.from(formData.keys())) {
      console.log(` - ${key}: ${formData.getAll(key).length} values`);
    }
    
    const response = await Gx.apiRequest('/api/advanced-analysis/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Document analysis failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing document:', error);
    // Re-throw to allow caller to handle
    throw error;
  }
}

/**
 * Analyze text content directly
 * 
 * @param text - Text content to analyze
 * @param options - Options including document type and jurisdiction/province
 * @returns Promise with analysis results
 */
export async function analyzeText(
  text: string, 
  options: {
    documentType?: string;
    jurisdiction?: string;
  } = {}
): Promise<any> {
  try {
    const { documentType, jurisdiction = 'Ontario' } = options;
    
    const response = await Gx.apiRequest('/api/advanced-analysis/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        documentType,
        jurisdiction
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Text analysis failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
}

// Export a simplified global handler for direct use in non-React mobile code
export const MobileDocumentAnalyzer = {
  analyzeDocument,
  analyzeText
};