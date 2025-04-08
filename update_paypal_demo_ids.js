/**
 * PayPal Demo Configuration Update Script
 * 
 * This script updates the PayPal client ID in the demo app templates.
 * It ensures consistent PayPal credentials across all payment-related pages.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Configuration
const TEMPLATES_DIR = './templates';
const FILES_TO_UPDATE = [
  'paypal_payment_page.html',
  'payment.html',
  'document_analysis_payment.html'
];

// Get PayPal client ID from environment
const paypalClientId = process.env.PAYPAL_CLIENT_ID;

if (!paypalClientId) {
  console.error('Error: PAYPAL_CLIENT_ID environment variable is not set.');
  console.error('Please set it in your .env file.');
  process.exit(1);
}

console.log('Updating PayPal client ID in templates...');

// Process each template file
FILES_TO_UPDATE.forEach(filename => {
  const filePath = path.join(TEMPLATES_DIR, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filename} - file not found`);
    return;
  }

  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern to match PayPal SDK script src with client-id parameter
    const sdkScriptPattern = /src="https:\/\/www\.paypal\.com\/sdk\/js\?client-id=([^&"]+)/g;
    
    // Update the client-id in the SDK script
    const updatedContent = content.replace(sdkScriptPattern, function(match, capturedId) {
      console.log(`In ${filename}: Replacing PayPal client ID ${capturedId} with environment variable`);
      return `src="https://www.paypal.com/sdk/js?client-id={{ paypal_client_id }}"`;
    });
    
    // Pattern to match hardcoded client IDs in JavaScript
    const jsClientIdPattern = /clientId: ['"]([^'"]+)['"]/g;
    
    // Update any JavaScript clientId references
    const finalContent = updatedContent.replace(jsClientIdPattern, function(match, capturedId) {
      console.log(`In ${filename}: Replacing JavaScript clientId ${capturedId} with environment variable`);
      return `clientId: "{{ paypal_client_id }}"`;
    });
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`Updated ${filename} successfully`);
    
  } catch (error) {
    console.error(`Error updating ${filename}:`, error.message);
  }
});

console.log('PayPal client ID update complete.');
console.log('Remember to pass the PayPal client ID to templates using the "paypal_client_id" variable.');