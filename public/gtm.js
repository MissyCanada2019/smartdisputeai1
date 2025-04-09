/**
 * Google Tag Manager Integration Script for SmartDispute.ai
 * This file manages GTM integration across the application.
 */

// Google Tag Manager Configuration
const GTM_ID = 'GTM-5L7PTHJK'; // The actual GTM ID

/**
 * Initialize Google Tag Manager
 */
function initializeGTM() {
  // Create data layer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Push initial page load event
  window.dataLayer.push({
    'event': 'page_view',
    'page_path': window.location.pathname,
    'page_title': document.title
  });
  
  // Insert GTM script
  insertGTMScript();
  
  // Insert GTM noscript iframe for browsers with JavaScript disabled
  insertGTMNoScript();
  
  console.log('Google Tag Manager initialized with ID:', GTM_ID);
}

/**
 * Insert the GTM script tag
 */
function insertGTMScript() {
  // Skip if GTM is already loaded
  if (document.querySelector(`script[src*="${GTM_ID}"]`)) {
    console.log('GTM script already exists, skipping insertion');
    return;
  }
  
  // Create and insert GTM script
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',GTM_ID);
}

/**
 * Insert the GTM noscript iframe for browsers with JavaScript disabled
 */
function insertGTMNoScript() {
  // Skip if iframe already exists
  if (document.querySelector(`iframe[src*="${GTM_ID}"]`)) {
    return;
  }
  
  // Create noscript element with GTM iframe
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  
  noscript.appendChild(iframe);
  
  // Insert at the beginning of body
  document.body.insertBefore(noscript, document.body.firstChild);
}

/**
 * Track page views
 * @param {string} pagePath - The path of the page
 * @param {string} pageTitle - The title of the page
 */
function trackPageView(pagePath, pageTitle) {
  window.dataLayer.push({
    'event': 'page_view',
    'page_path': pagePath || window.location.pathname,
    'page_title': pageTitle || document.title
  });
  
  console.log('Page view tracked:', pagePath || window.location.pathname);
}

/**
 * Track document uploads
 * @param {string} documentType - The type of document uploaded
 * @param {string} fileFormat - The format of the uploaded file (e.g., PDF, DOC)
 * @param {number} fileSize - The size of the file in bytes
 */
function trackDocumentUpload(documentType, fileFormat, fileSize) {
  window.dataLayer.push({
    'event': 'document_upload',
    'document_type': documentType || 'unknown',
    'file_format': fileFormat || 'unknown',
    'file_size': fileSize || 0
  });
  
  console.log('Document upload tracked:', documentType);
}

/**
 * Track AI analysis actions
 * @param {string} analysisType - The type of analysis performed
 * @param {string} documentType - The type of document analyzed
 * @param {string} modelUsed - The AI model used for analysis
 */
function trackAIAnalysis(analysisType, documentType, modelUsed) {
  window.dataLayer.push({
    'event': 'ai_analysis',
    'analysis_type': analysisType || 'general',
    'document_type': documentType || 'unknown',
    'model_used': modelUsed || 'default'
  });
  
  console.log('AI analysis tracked:', analysisType);
}

/**
 * Track payment-related events
 * @param {string} paymentMethod - The payment method used (PayPal, Stripe, etc.)
 * @param {string} productType - The type of product purchased
 * @param {number} amount - The payment amount
 * @param {string} currency - The currency of the payment
 */
function trackPayment(paymentMethod, productType, amount, currency = 'CAD') {
  window.dataLayer.push({
    'event': 'payment',
    'payment_method': paymentMethod,
    'product_type': productType,
    'amount': amount,
    'currency': currency
  });
  
  console.log('Payment tracked:', paymentMethod, amount, currency);
}

/**
 * Track user conversions and goals
 * @param {string} conversionType - The type of conversion
 * @param {string} source - The source of the conversion
 * @param {any} additionalData - Additional data about the conversion
 */
function trackConversion(conversionType, source, additionalData = {}) {
  window.dataLayer.push({
    'event': 'conversion',
    'conversion_type': conversionType,
    'source': source,
    ...additionalData
  });
  
  console.log('Conversion tracked:', conversionType, source);
}

/**
 * Track form submissions
 * @param {string} formId - The ID of the form
 * @param {string} formType - The type of form (contact, signup, etc.)
 */
function trackFormSubmission(formId, formType) {
  window.dataLayer.push({
    'event': 'form_submission',
    'form_id': formId,
    'form_type': formType
  });
  
  console.log('Form submission tracked:', formId, formType);
}

/**
 * Update GTM ID
 * @param {string} newGtmId - The new GTM ID to use
 */
function updateGtmId(newGtmId) {
  // Only allow this in development environment for safety
  if (window.location.hostname !== 'localhost' && 
      !window.location.hostname.includes('.replit.dev')) {
    console.error('GTM ID can only be updated in development environment');
    return false;
  }
  
  // Update the GTM ID
  window.GTM_ID = newGtmId;
  console.log('GTM ID updated to:', newGtmId);
  
  // Re-initialize GTM with the new ID
  initializeGTM();
  
  return true;
}

// Expose the functions to the global scope
window.GTM = {
  initialize: initializeGTM,
  trackPageView: trackPageView,
  trackDocumentUpload: trackDocumentUpload,
  trackAIAnalysis: trackAIAnalysis,
  trackPayment: trackPayment,
  trackConversion: trackConversion,
  trackFormSubmission: trackFormSubmission,
  updateGtmId: updateGtmId
};

// Auto-initialize when the script loads
document.addEventListener('DOMContentLoaded', initializeGTM);

// Also initialize immediately if the DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeGTM();
}