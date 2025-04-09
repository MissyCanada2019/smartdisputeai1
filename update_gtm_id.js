/**
 * Update GTM ID Script
 * 
 * This script updates the Google Tag Manager ID across all necessary files.
 * Usage: node update_gtm_id.js NEW_GTM_ID
 * 
 * Example: node update_gtm_id.js GTM-ABC123XYZ
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get the new GTM ID from command line arguments
const newGtmId = process.argv[2];

// Validate input
if (!newGtmId || !newGtmId.startsWith('GTM-')) {
  console.error('❌ Error: Please provide a valid GTM ID (e.g., GTM-ABC123XYZ)');
  process.exit(1);
}

console.log(`🔍 Updating GTM ID to: ${newGtmId}`);

// Files to update
const filesToUpdate = [
  // Main GTM script
  { 
    path: 'public/gtm.js',
    pattern: /const GTM_ID = ['"]GTM-[A-Z0-9]+['"]/,
    replacement: `const GTM_ID = '${newGtmId}'`
  },
  // Any HTML files with GTM script tags
  ...glob.sync('**/*.html').map(htmlFile => ({
    path: htmlFile,
    pattern: /['"]https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=GTM-[A-Z0-9]+['"]/g,
    replacement: `"https://www.googletagmanager.com/gtm.js?id=${newGtmId}"`
  })),
  // Any HTML files with GTM noscript iframes
  ...glob.sync('**/*.html').map(htmlFile => ({
    path: htmlFile,
    pattern: /['"]https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-[A-Z0-9]+['"]/g,
    replacement: `"https://www.googletagmanager.com/ns.html?id=${newGtmId}"`
  }))
];

// Track updates
let updatedFiles = 0;
let errors = 0;

// Update each file
filesToUpdate.forEach(file => {
  try {
    // Check if file exists
    if (!fs.existsSync(file.path)) {
      console.log(`⚠️ File not found, skipping: ${file.path}`);
      return;
    }
    
    // Read file content
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Check if pattern exists in file
    if (!content.match(file.pattern)) {
      console.log(`⚠️ No GTM ID found in file, skipping: ${file.path}`);
      return;
    }
    
    // Replace GTM ID
    const updatedContent = content.replace(file.pattern, file.replacement);
    
    // Write updated content back to file
    fs.writeFileSync(file.path, updatedContent, 'utf8');
    
    console.log(`✅ Updated GTM ID in: ${file.path}`);
    updatedFiles++;
  } catch (error) {
    console.error(`❌ Error updating ${file.path}:`, error.message);
    errors++;
  }
});

// Summary
console.log('\n=== GTM ID Update Summary ===');
console.log(`✅ Files updated: ${updatedFiles}`);
if (errors > 0) {
  console.log(`❌ Errors encountered: ${errors}`);
}
console.log('=============================');

// Warning about package installation
if (!fs.existsSync('./node_modules/glob')) {
  console.log('\n⚠️ Note: This script requires the "glob" package. If you encounter an error, please install it with:');
  console.log('npm install glob');
}