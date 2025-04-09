/**
 * Google Tag Manager Integration Test Script for SmartDispute.ai
 * 
 * This script tests the Google Tag Manager integration and tracking functions
 */

// Load required modules
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function testGTMIntegration() {
  console.log('Testing Google Tag Manager Integration');
  console.log('======================================');
  
  try {
    // 1. Verify GTM initialization in gtm.js
    const gtmScript = fs.readFileSync(path.join(__dirname, 'public', 'gtm.js'), 'utf8');
    console.log('GTM script loaded successfully');
    
    // Extract the GTM ID from the script
    const gtmIdMatch = gtmScript.match(/const GTM_ID = ['"]([^'"]+)['"]/);
    const gtmId = gtmIdMatch ? gtmIdMatch[1] : null;
    
    if (gtmId) {
      console.log(`✅ GTM ID found: ${gtmId}`);
    } else {
      console.error('❌ GTM ID not found in gtm.js');
      return;
    }
    
    // 2. Check HTML files for GTM code
    const htmlFiles = ['index.html', 'success.html', 'success_with_upsell.html'];
    console.log('\nChecking HTML files for GTM code:');
    
    for (const htmlFile of htmlFiles) {
      const filePath = path.join(__dirname, htmlFile);
      
      if (fs.existsSync(filePath)) {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        
        // Check for GTM script tag
        const hasGtmScript = htmlContent.includes('googletagmanager.com/gtm.js');
        // Check for GTM noscript iframe
        const hasGtmNoscript = htmlContent.includes('googletagmanager.com/ns.html');
        // Check for GTM ID
        const hasCorrectGtmId = htmlContent.includes(gtmId);
        
        console.log(`- ${htmlFile}:`);
        console.log(`  GTM Script: ${hasGtmScript ? '✅ Present' : '❌ Missing'}`);
        console.log(`  GTM Noscript: ${hasGtmNoscript ? '✅ Present' : '❌ Missing'}`);
        console.log(`  Correct GTM ID: ${hasCorrectGtmId ? '✅ Present' : '❌ Missing'}`);
      } else {
        console.log(`- ${htmlFile}: ❌ File not found`);
      }
    }
    
    // 3. Test tracking functions with Puppeteer (headless browser)
    console.log('\nTesting tracking functions with Puppeteer:');
    
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    
    // Capture dataLayer events
    let dataLayerEvents = [];
    await page.evaluateOnNewDocument(() => {
      window.dataLayer = window.dataLayer || [];
      const originalPush = Array.prototype.push;
      window.dataLayer.push = function() {
        console.log('dataLayer.push:', JSON.stringify(arguments[0]));
        return originalPush.apply(this, arguments);
      };
    });
    
    // Listen for console messages to capture dataLayer events
    page.on('console', msg => {
      const text = msg.text();
      if (text.startsWith('dataLayer.push:')) {
        try {
          const eventData = JSON.parse(text.substring('dataLayer.push:'.length));
          dataLayerEvents.push(eventData);
        } catch (e) {
          console.error('Error parsing dataLayer event:', e);
        }
      }
    });
    
    // Navigate to the index page
    console.log('- Navigating to index page...');
    await page.goto(`file://${path.join(__dirname, 'index.html')}`);
    
    // Wait for GTM to initialize
    await page.waitForFunction(() => window.GTM !== undefined, { timeout: 5000 })
      .then(() => console.log('  ✅ GTM initialized successfully'))
      .catch(() => console.log('  ❌ GTM failed to initialize'));
    
    // Test tracking functions
    console.log('- Testing tracking functions:');
    
    await page.evaluate(() => {
      // Test page view tracking
      if (window.GTM && window.GTM.trackPageView) {
        window.GTM.trackPageView('/test-page', 'Test Page');
        return true;
      }
      return false;
    })
      .then(result => console.log(`  Page View Tracking: ${result ? '✅ Success' : '❌ Failed'}`))
      .catch(() => console.log('  ❌ Page View Tracking: Error'));
    
    await page.evaluate(() => {
      // Test conversion tracking
      if (window.GTM && window.GTM.trackConversion) {
        window.GTM.trackConversion('test_conversion', 'test_page', {
          test_value: 123,
          test_attribute: 'test'
        });
        return true;
      }
      return false;
    })
      .then(result => console.log(`  Conversion Tracking: ${result ? '✅ Success' : '❌ Failed'}`))
      .catch(() => console.log('  ❌ Conversion Tracking: Error'));
    
    // Check captured dataLayer events
    console.log('- DataLayer events captured:');
    console.log(`  Total events: ${dataLayerEvents.length}`);
    
    dataLayerEvents.forEach((event, i) => {
      console.log(`  Event ${i + 1}: ${JSON.stringify(event)}`);
    });
    
    await browser.close();
    
    console.log('\nGTM Integration Test Completed');
  } catch (error) {
    console.error('Error during GTM integration test:', error);
  }
}

// Run the test
testGTMIntegration();