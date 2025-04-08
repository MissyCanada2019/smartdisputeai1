/**
 * AI Document Analysis Service for SmartDispute.ai
 * 
 * This module provides advanced NLP capabilities for document analysis
 * using OpenAI's GPT-4o model to extract key information from legal documents.
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback to Anthropic if available
let anthropic = null;
try {
  const Anthropic = require('@anthropic-ai/sdk');
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log('Anthropic SDK initialized as fallback');
  }
} catch (error) {
  console.log('Anthropic SDK not available, only using OpenAI');
}

/**
 * Analyzes a document using OpenAI's GPT-4o model
 * Extracts key information, identifies legal issues, and provides recommendations
 * 
 * @param {Object} options Configuration options
 * @param {string} options.documentPath Path to the document file
 * @param {string} options.documentType Type of document (e.g., 'lease', 'notice', 'letter')
 * @param {string} options.province Canadian province code (e.g., 'ON', 'BC')
 * @param {string} options.disputeType Type of dispute (e.g., 'landlord_tenant', 'cas')
 * @param {boolean} options.basicAnalysisOnly Whether to run only basic analysis (free tier)
 * @returns {Promise<Object>} Analysis results with extracted information and recommendations
 */
async function analyzeDocument(options) {
  try {
    const {
      documentPath,
      documentType = 'unknown',
      province = 'unknown',
      disputeType = 'unknown',
      basicAnalysisOnly = false
    } = options;

    // Check if file exists
    if (!fs.existsSync(documentPath)) {
      throw new Error(`Document not found at path: ${documentPath}`);
    }

    // Read document content - implementation depends on file type
    // This is a simplification - real implementation would handle different file types
    const fileExtension = path.extname(documentPath).toLowerCase();
    let documentContent = '';
    
    if (fileExtension === '.txt') {
      documentContent = fs.readFileSync(documentPath, 'utf8');
    } else if (fileExtension === '.pdf') {
      // In a production environment, we would use pdf-parse or similar library
      documentContent = `[This is a placeholder for PDF content from ${path.basename(documentPath)}]`;
    } else if (fileExtension === '.docx' || fileExtension === '.doc') {
      // In a production environment, we would use mammoth.js or similar library
      documentContent = `[This is a placeholder for Word document content from ${path.basename(documentPath)}]`;
    } else if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
      // In a production environment, we would use OCR like tesseract.js
      documentContent = `[This is a placeholder for text extracted from image ${path.basename(documentPath)}]`;
    } else {
      // For other file types
      documentContent = `[Content of ${path.basename(documentPath)}]`;
    }

    // Check if API keys are valid before making API calls
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log('OpenAI API key not available, using fallback analysis');
      return createFallbackAnalysis(options);
    }

    // Create prompt based on document type and dispute type
    const systemPrompt = getSystemPrompt(disputeType, province, documentType, basicAnalysisOnly);
    
    // Call OpenAI API
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: documentContent }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the response
      const analysisResult = JSON.parse(response.choices[0].message.content);
      
      // Add metadata to the result
      return {
        ...analysisResult,
        meta: {
          documentType,
          province,
          disputeType,
          analysisDate: new Date().toISOString(),
          analysisLevel: basicAnalysisOnly ? 'basic' : 'comprehensive',
          analysisProvider: 'openai'
        }
      };
    } catch (openaiError) {
      console.error('Error analyzing document with OpenAI:', openaiError);
      
      // Try fallback to Anthropic if available
      if (anthropic && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== '') {
        return fallbackToAnthropic(options);
      }
      
      // If OpenAI failed and no valid Anthropic setup, use static fallback
      return createFallbackAnalysis(options);
    }
  } catch (error) {
    console.error('Error in document analysis:', error);
    
    // Return fallback analysis if anything goes wrong
    return createFallbackAnalysis(options);
  }
}

/**
 * Fallback document analysis using Anthropic Claude
 * @param {Object} options The original analysis options
 * @returns {Promise<Object>} Analysis results
 */
async function fallbackToAnthropic(options) {
  try {
    const {
      documentPath,
      documentType = 'unknown',
      province = 'unknown',
      disputeType = 'unknown',
      basicAnalysisOnly = false
    } = options;

    // Read document content
    const documentContent = fs.readFileSync(documentPath, 'utf8');
    
    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(disputeType, province, documentType, basicAnalysisOnly);
    
    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      system: systemPrompt,
      max_tokens: 2000,
      messages: [
        { role: "user", content: documentContent }
      ],
    });

    // Parse response - Claude tends to wrap JSON in markdown code blocks, handle that
    let responseText = response.content[0].text;
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].split('```')[0].trim();
    }

    try {
      const analysisResult = JSON.parse(responseText);
      
      return {
        ...analysisResult,
        meta: {
          documentType,
          province,
          disputeType,
          analysisDate: new Date().toISOString(),
          analysisLevel: basicAnalysisOnly ? 'basic' : 'comprehensive',
          model: 'claude' // Mark that this was processed by the fallback model
        }
      };
    } catch (jsonError) {
      throw new Error(`Failed to parse Claude response as JSON: ${jsonError.message}`);
    }
  } catch (error) {
    console.error('Error with Anthropic fallback:', error);
    
    // Return fallback static analysis with a warning that it's not AI-generated
    return createFallbackAnalysis(options);
  }
}

/**
 * Get the appropriate system prompt based on document type
 * @param {string} disputeType Type of dispute
 * @param {string} province Canadian province
 * @param {string} documentType Type of document
 * @param {boolean} basicAnalysisOnly Whether to run only basic analysis
 * @returns {string} System prompt
 */
function getSystemPrompt(disputeType, province, documentType, basicAnalysisOnly) {
  const basePrompt = `You are an expert legal document analyzer for SmartDispute.ai, specializing in Canadian ${disputeType.replace('_', ' ')} issues in ${province}.
  
Analyze the provided ${documentType} document and extract key information.

${basicAnalysisOnly ? 
  `Perform a BASIC analysis that identifies:
  1. Document type and purpose
  2. Key dates and deadlines
  3. Basic requirements or obligations
  4. Simple red flags or concerns` 
  : 
  `Perform a COMPREHENSIVE analysis that identifies:
  1. Document type, purpose, and full context
  2. All parties involved with complete details
  3. All dates, deadlines, and time-sensitive elements
  4. All requirements, obligations, and conditions
  5. Legal terminology and implications
  6. Potential concerns, risks, and vulnerabilities
  7. Missing information or incomplete elements
  8. Precedent or statutory references
  9. Detailed recommendations for response or action`
}

Respond with JSON that includes:
{
  "documentSummary": "Brief overview of the document",
  "keyParties": [{"name": "Party name", "role": "Role in document"}],
  "criticalDates": [{"date": "YYYY-MM-DD", "description": "What happens on this date"}],
  "keyFindings": ["Finding 1", "Finding 2"],
  "potentialIssues": ["Issue 1", "Issue 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "relevantLegislation": ["Legislation 1", "Legislation 2"],
  "confidenceScore": 0.95 // 0-1 score indicating confidence in analysis
}`;

  // Add dispute-specific guidance to the prompt
  if (disputeType === 'landlord_tenant') {
    return basePrompt + `
    
For tenant issues, pay special attention to:
- Notice periods required by ${getProvinceRTA(province)}
- Condition issues and maintenance responsibilities
- Security deposit rules specific to ${province}
- Tenant rights regarding entry and privacy
- Proper documentation of communication history`;
  } else if (disputeType === 'cas') {
    return basePrompt + `
    
For child welfare issues, pay special attention to:
- Standards of service under ${getProvinceCAS(province)}
- Procedural fairness in decision-making
- Documentation of allegations and evidence
- Parent and child rights to information and participation
- Timeframes for response and administrative remedies`;
  }
  
  return basePrompt;
}

/**
 * Get the appropriate Residential Tenancies Act name for a province
 * @param {string} province Province code
 * @returns {string} Name of the province's RTA
 */
function getProvinceRTA(province) {
  const rtaMap = {
    'ON': 'Residential Tenancies Act',
    'BC': 'Residential Tenancy Act',
    'AB': 'Residential Tenancies Act',
    'QC': 'Civil Code of Québec (sections governing residential leases)',
    'MB': 'Residential Tenancies Act',
    'SK': 'Residential Tenancies Act',
    'NS': 'Residential Tenancies Act',
    'NB': 'Residential Tenancies Act',
    'NL': 'Residential Tenancies Act',
    'PE': 'Rental of Residential Property Act',
    'YT': 'Residential Landlord and Tenant Act',
    'NT': 'Residential Tenancies Act',
    'NU': 'Residential Tenancies Act'
  };
  
  return rtaMap[province] || 'applicable residential tenancy legislation';
}

/**
 * Get the appropriate Child Protection legislation name for a province
 * @param {string} province Province code
 * @returns {string} Name of the province's Child Protection Act
 */
function getProvinceCAS(province) {
  const casMap = {
    'ON': 'Child, Youth and Family Services Act',
    'BC': 'Child, Family and Community Service Act',
    'AB': 'Child, Youth and Family Enhancement Act',
    'QC': 'Youth Protection Act',
    'MB': 'Child and Family Services Act',
    'SK': 'Child and Family Services Act',
    'NS': 'Children and Family Services Act',
    'NB': 'Family Services Act',
    'NL': 'Children, Youth and Families Act',
    'PE': 'Child Protection Act',
    'YT': 'Child and Family Services Act',
    'NT': 'Child and Family Services Act',
    'NU': 'Child and Family Services Act'
  };
  
  return casMap[province] || 'applicable child protection legislation';
}

/**
 * Create fallback analysis when AI services are not available
 * @param {Object} options Analysis options
 * @returns {Object} Fallback analysis result
 */
function createFallbackAnalysis(options) {
  const { 
    documentType = 'unknown', 
    province = 'unknown', 
    disputeType = 'unknown',
    basicAnalysisOnly = false
  } = options;
  
  // Get appropriate legislation based on dispute type and province
  let relevantLegislation = [];
  if (disputeType === 'landlord_tenant') {
    relevantLegislation.push(getProvinceRTA(province));
  } else if (disputeType === 'cas') {
    relevantLegislation.push(getProvinceCAS(province));
  }
  
  // Create generic document summary based on document type
  let documentSummary = '';
  let keyParties = [];
  let criticalDates = [];
  let keyFindings = [];
  let potentialIssues = [];
  let recommendations = [];
  
  // Fallback for different document types
  if (disputeType === 'landlord_tenant') {
    if (documentType === 'notice') {
      documentSummary = `This appears to be a notice related to a residential tenancy in ${province}. The document contains important dates and information regarding your tenancy.`;
      keyParties = [
        { "name": "Landlord/Property Manager", "role": "Sender of notice" },
        { "name": "Tenant", "role": "Recipient of notice" }
      ];
      criticalDates = [
        { "date": "Not specified", "description": "Potential deadline for response or action" }
      ];
      keyFindings = [
        "This is a formal notice that may affect your tenancy rights",
        "The document appears to be related to a residential tenancy matter"
      ];
      potentialIssues = [
        "Time-sensitive deadlines may apply to your response",
        "There may be specific legal requirements for this type of notice in your province"
      ];
      recommendations = [
        `Review your rights under the ${getProvinceRTA(province)}`,
        "Check for any specified deadlines in the document",
        "Consider contacting a tenant advocacy organization for support",
        "Keep records of all communications with your landlord"
      ];
    } else if (documentType === 'agreement') {
      documentSummary = `This appears to be a rental agreement or lease document for a property in ${province}.`;
      keyParties = [
        { "name": "Landlord/Property Owner", "role": "Property owner/manager" },
        { "name": "Tenant", "role": "Renter of property" }
      ];
      keyFindings = [
        "This is a legal contract establishing a landlord-tenant relationship",
        "The document likely contains terms and conditions for the rental"
      ];
      potentialIssues = [
        "There may be clauses that are not enforceable under provincial law",
        "Important details about your rights and responsibilities may be included"
      ];
      recommendations = [
        "Read the entire document carefully before signing",
        `Verify that all terms comply with the ${getProvinceRTA(province)}`,
        "Ensure all verbal agreements are included in writing",
        "Keep a copy of the signed agreement for your records"
      ];
    }
  } else if (disputeType === 'cas') {
    documentSummary = `This appears to be a document related to a child welfare matter in ${province}, possibly from ${getAgencyName(province)}.`;
    keyParties = [
      { "name": "Child Protection Agency", "role": "Investigating authority" },
      { "name": "Parent/Guardian", "role": "Subject of documentation" },
      { "name": "Child(ren)", "role": "Protected party" }
    ];
    keyFindings = [
      "This document contains information about a child welfare matter",
      "There may be specific allegations or concerns addressed"
    ];
    potentialIssues = [
      "Time-sensitive response requirements may apply",
      "Legal rights and procedural safeguards should be considered"
    ];
    recommendations = [
      `Review your rights under the ${getProvinceCAS(province)}`,
      "Consider seeking legal advice immediately",
      "Document all interactions with agency workers",
      "Respond to any requests for information or meetings promptly"
    ];
  }
  
  // Add disclaimer about this being fallback analysis
  keyFindings.unshift("NOTE: This is an automated general analysis as our AI service is currently unavailable");
  
  return {
    documentSummary,
    keyParties,
    criticalDates,
    keyFindings,
    potentialIssues,
    recommendations,
    relevantLegislation,
    confidenceScore: 0.6, // Lower confidence score for fallback analysis
    meta: {
      documentType,
      province,
      disputeType,
      analysisDate: new Date().toISOString(),
      analysisLevel: basicAnalysisOnly ? 'basic' : 'comprehensive',
      fallbackAnalysis: true // Flag to indicate this is fallback analysis
    }
  };
}

/**
 * Get agency name based on province code
 * @param {string} province Province code
 * @returns {string} Agency name
 */
function getAgencyName(province) {
  const agencyMap = {
    "ON": "Children's Aid Society",
    "BC": "Ministry of Children and Family Development",
    "AB": "Children's Services",
    "QC": "Direction de la protection de la jeunesse (DPJ)",
    "MB": "Child and Family Services",
    "SK": "Ministry of Social Services",
    "NS": "Department of Community Services",
    "NB": "Department of Social Development",
    "NL": "Department of Children, Seniors and Social Development",
    "PE": "Child Protection Services",
    "NT": "Child and Family Services",
    "NU": "Department of Family Services",
    "YT": "Family and Children's Services"
  };
  
  return agencyMap[province] || "Child Protection Agency";
}

module.exports = {
  analyzeDocument
};