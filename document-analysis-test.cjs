/**
 * Document Analysis Test Script for SmartDispute.ai
 * 
 * This script demonstrates how to use the AI document analysis service
 * to extract key information from legal documents.
 */

const fs = require('fs');
const path = require('path');
const { analyzeDocument } = require('./ai_document_analysis.cjs');

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available, using existing environment variables');
}

// Create a test document
async function createTestDocument(content, name = 'test-document.txt') {
  const documentsDir = path.join(__dirname, 'uploads', 'docs');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
  
  const documentPath = path.join(documentsDir, name);
  fs.writeFileSync(documentPath, content);
  console.log(`Test document created at: ${documentPath}`);
  return documentPath;
}

// Test document content - a simplified eviction notice
const evictionNoticeContent = `
NOTICE OF TERMINATION OF TENANCY
Date: April 1, 2025

To: John Smith
123 Main Street, Apt 4B
Toronto, ON M5V 1A1

From: Landlord Properties Inc.
456 Owner Avenue
Toronto, ON M5V 2B2

RE: TERMINATION OF TENANCY AGREEMENT

Dear Mr. Smith,

This letter constitutes formal notice that your tenancy at 123 Main Street, Apt 4B, Toronto, ON M5V 1A1 will be terminated effective May 1, 2025.

The reason for this termination is:
[ ] Nonpayment of rent
[X] Landlord's own use
[ ] Demolition/Renovation
[ ] Breach of tenancy agreement

You are required to vacate the premises and return all keys by 11:59 PM on May 1, 2025.

Please note that if you wish to dispute this notice, you have the right to file an application with the Landlord and Tenant Board within 15 days of receiving this notice.

Sincerely,
Jane Doe
Property Manager
Landlord Properties Inc.
416-555-1234
`;

// Test document content - a simplified CAS letter
const casLetterContent = `
CHILDREN'S AID SOCIETY OF TORONTO
555 Protection Avenue
Toronto, ON M5V 3C3

April 2, 2025

RE: Case #CAS-2025-1234
Child: Emily Johnson (DOB: 2020-03-15)

Dear Mr. and Mrs. Johnson,

This letter is to inform you that the Children's Aid Society of Toronto has opened an investigation regarding concerns about the wellbeing of Emily Johnson. These concerns were reported to our agency on March 30, 2025.

The reported concerns include:
- Alleged inadequate supervision
- Possible exposure to substance use in the home

Your assigned caseworker is Sarah Williams, who can be reached at 416-555-2345 or sarah.williams@casfake.org.

An initial home visit has been scheduled for April 10, 2025 at 2:00 PM. Your cooperation during this process is appreciated and will help ensure the best outcome for your family.

Please be advised that you have the right to seek legal advice. If you cannot afford a lawyer, you may qualify for legal aid services.

Sincerely,

Robert Thompson
Intake Supervisor
Children's Aid Society of Toronto
`;

// Parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = process.argv[index + 1];
      if (value && !value.startsWith('--')) {
        args[key] = value;
      } else {
        args[key] = true;
      }
    }
  });
  return args;
}

// Run the document analysis with either a provided document or test documents
async function runTest() {
  try {
    const args = parseArgs();
    
    // If a document path is provided, analyze that document
    if (args.document) {
      console.log(`Analyzing document at path: ${args.document}`);
      
      // Get parameters from command line args or use defaults
      const province = args.province || 'ON';
      const disputeType = args.dispute_type || 'landlord_tenant';
      const documentType = args.document_type || 'notice';
      const basicOnly = args.basic_only === 'true';
      
      console.log(`Analysis parameters: province=${province}, disputeType=${disputeType}, documentType=${documentType}, basicOnly=${basicOnly}`);
      
      // Run the analysis
      const results = await analyzeDocument({
        documentPath: args.document,
        documentType: documentType,
        province: province,
        disputeType: disputeType,
        basicAnalysisOnly: basicOnly
      });
      
      // Output nicely formatted results
      displayResults(results);
      return;
    }
    
    // If no document is provided, run the test suite
    console.log('Starting document analysis test suite...');
    
    // Test with eviction notice
    console.log('\n===== EVICTION NOTICE TEST =====');
    const evictionDocPath = await createTestDocument(evictionNoticeContent, 'eviction-notice.txt');
    
    console.log('Analyzing eviction notice with basic analysis (free tier)...');
    const basicEvictionResults = await analyzeDocument({
      documentPath: evictionDocPath,
      documentType: 'notice',
      province: 'ON',
      disputeType: 'landlord_tenant',
      basicAnalysisOnly: true
    });
    
    // Display nicely formatted results
    displayResults(basicEvictionResults);
    
    // Test with CAS letter
    console.log('\n===== CAS LETTER TEST =====');
    const casDocPath = await createTestDocument(casLetterContent, 'cas-letter.txt');
    
    console.log('Analyzing CAS letter with comprehensive analysis...');
    const casResults = await analyzeDocument({
      documentPath: casDocPath,
      documentType: 'letter',
      province: 'ON',
      disputeType: 'cas',
      basicAnalysisOnly: false
    });
    
    // Display nicely formatted results
    displayResults(casResults);
    
    console.log('\nDocument analysis tests completed successfully.');
  } catch (error) {
    console.error('Error running document analysis test:', error);
    process.exit(1);
  }
}

/**
 * Display nicely formatted analysis results
 * @param {Object} results The analysis results
 */
function displayResults(results) {
  console.log("\n==== DOCUMENT ANALYSIS RESULTS ====");
  
  // Check if this is a fallback analysis
  if (results.meta && results.meta.fallbackAnalysis) {
    console.log("\n⚠️  NOTE: This is fallback analysis - AI services unavailable ⚠️");
  }
  
  // Document summary
  console.log("\n📄 DOCUMENT SUMMARY:");
  console.log(results.documentSummary || "No summary available");
  
  // Key parties
  if (results.keyParties && results.keyParties.length > 0) {
    console.log("\n👥 KEY PARTIES:");
    results.keyParties.forEach(party => {
      console.log(`  • ${party.name}: ${party.role}`);
    });
  }
  
  // Critical dates
  if (results.criticalDates && results.criticalDates.length > 0) {
    console.log("\n📅 CRITICAL DATES:");
    results.criticalDates.forEach(date => {
      console.log(`  • ${date.date}: ${date.description}`);
    });
  }
  
  // Key findings
  if (results.keyFindings && results.keyFindings.length > 0) {
    console.log("\n🔍 KEY FINDINGS:");
    results.keyFindings.forEach(finding => {
      console.log(`  • ${finding}`);
    });
  }
  
  // Potential issues
  if (results.potentialIssues && results.potentialIssues.length > 0) {
    console.log("\n⚠️ POTENTIAL ISSUES:");
    results.potentialIssues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }
  
  // Recommendations
  if (results.recommendations && results.recommendations.length > 0) {
    console.log("\n💡 RECOMMENDATIONS:");
    results.recommendations.forEach(recommendation => {
      console.log(`  • ${recommendation}`);
    });
  }
  
  // Relevant legislation
  if (results.relevantLegislation && results.relevantLegislation.length > 0) {
    console.log("\n📜 RELEVANT LEGISLATION:");
    results.relevantLegislation.forEach(legislation => {
      console.log(`  • ${legislation}`);
    });
  }
  
  // Confidence score
  if (results.confidenceScore !== undefined) {
    console.log(`\n✓ CONFIDENCE SCORE: ${(results.confidenceScore * 100).toFixed(0)}%`);
  }
  
  console.log("\n==== END OF ANALYSIS ====\n");
}

// Parse command line arguments
const args = process.argv.slice(2);
const argOptions = {};
for (let i = 0; i < args.length; i += 2) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const value = args[i + 1];
    argOptions[key] = value;
  }
}

// If command line arguments are provided, run a single test
if (Object.keys(argOptions).length > 0) {
  console.log("Running document analysis with provided parameters...");
  
  if (!argOptions.document) {
    console.error("Error: --document parameter is required");
    process.exit(1);
  }
  
  // Run analysis with provided options
  analyzeDocument({
    documentPath: argOptions.document,
    province: argOptions.province || 'ON',
    disputeType: argOptions.dispute_type || 'landlord_tenant',
    documentType: argOptions.document_type || 'notice',
    basicAnalysisOnly: argOptions.basic_only === 'true'
  }).then(results => {
    displayResults(results);
    console.log(JSON.stringify(results, null, 2));
  }).catch(error => {
    console.error("Error running analysis:", error);
    process.exit(1);
  });
} else {
  // Run the full test suite
  runTest();
}