/**
 * Update Google Analytics Measurement ID across all template files
 * 
 * This script updates the placeholder Google Analytics Measurement ID 
 * with the actual ID in all template files.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const PLACEHOLDER_ID = 'G-MEASUREMENT-ID';
const ACTUAL_GA_ID = process.env.GA_MEASUREMENT_ID || 'G-YOUR-MEASUREMENT-ID'; // Replace with your actual GA ID or use environment variable

// Files to update (add more as needed)
const FILES_TO_UPDATE = [
  'payment.html',
  'document_analysis_payment.html',
  'success.html',
  'document_analysis_result.html'
];

/**
 * Updates Google Analytics ID in a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - Whether the file was updated
 */
async function updateGAIDInFile(filePath) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains the placeholder
    if (!content.includes(PLACEHOLDER_ID)) {
      console.log(`No placeholder found in ${filePath}`);
      return false;
    }
    
    // Replace placeholder with actual GA ID
    const updatedContent = content.replace(
      new RegExp(PLACEHOLDER_ID, 'g'), 
      ACTUAL_GA_ID
    );
    
    // Write updated content back to file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`✅ Updated GA ID in ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function to update GA ID in all template files
 */
async function updateGAID() {
  console.log(`Updating Google Analytics ID from "${PLACEHOLDER_ID}" to "${ACTUAL_GA_ID}"`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  // Process each file
  for (const fileName of FILES_TO_UPDATE) {
    const filePath = path.join(TEMPLATES_DIR, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      continue;
    }
    
    // Update GA ID in file
    const updated = await updateGAIDInFile(filePath);
    if (updated) {
      updatedCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log(`\nUpdate complete! Updated ${updatedCount} files. Errors: ${errorCount}`);
}

// Run the update
updateGAID();