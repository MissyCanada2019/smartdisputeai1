/**
 * Enhanced Google Analytics 4 Tracking for SmartDispute.ai
 * 
 * This file provides optimized e-commerce tracking for payment flows
 * with accurate transaction data capture from PayPal API responses.
 */

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}

// Basic GA4 initialization
function initializeAnalytics(measurementId) {
  gtag('js', new Date());
  gtag('config', measurementId);
}

// Track page view with enhanced parameters
function trackPageView(pageTitle, pageCategory) {
  gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_category: pageCategory || 'general'
  });
}

// E-commerce: View Item event
function trackViewItem(item, options = {}) {
  const defaultItem = {
    item_id: 'unknown',
    item_name: 'Unknown Item',
    price: 0,
    quantity: 1,
    item_category: 'Services'
  };

  const trackingItem = { ...defaultItem, ...item };
  
  gtag('event', 'view_item', {
    currency: options.currency || 'CAD',
    value: parseFloat(trackingItem.price),
    items: [trackingItem]
  });
}

// E-commerce: Begin Checkout event
function trackBeginCheckout(items, options = {}) {
  const itemsArray = Array.isArray(items) ? items : [items];
  const totalValue = itemsArray.reduce((sum, item) => 
    sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
  
  gtag('event', 'begin_checkout', {
    currency: options.currency || 'CAD',
    value: totalValue,
    items: itemsArray,
    checkout_step: options.step || 1
  });
}

// E-commerce: Add Payment Info event
function trackAddPaymentInfo(items, paymentMethod, options = {}) {
  const itemsArray = Array.isArray(items) ? items : [items];
  const totalValue = itemsArray.reduce((sum, item) => 
    sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
  
  gtag('event', 'add_payment_info', {
    currency: options.currency || 'CAD',
    value: totalValue,
    payment_type: paymentMethod,
    items: itemsArray,
    checkout_step: options.step || 2
  });
}

// E-commerce: Purchase event with detailed transaction data
function trackPurchase(transactionData, items, options = {}) {
  const itemsArray = Array.isArray(items) ? items : [items];
  
  // Use actual transaction amount if available, otherwise calculate from items
  const totalValue = transactionData.value || 
    itemsArray.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
  
  gtag('event', 'purchase', {
    transaction_id: transactionData.transaction_id,
    value: parseFloat(totalValue),
    currency: transactionData.currency || options.currency || 'CAD',
    tax: parseFloat(transactionData.tax || 0),
    shipping: parseFloat(transactionData.shipping || 0),
    items: itemsArray,
    payment_method: transactionData.payment_method || options.payment_method || 'unknown'
  });
  
  // Also track purchase confirmation as a custom event for funnel tracking
  gtag('event', 'purchase_confirmation_viewed', {
    event_category: 'ecommerce',
    event_label: 'Success Page Viewed',
    transaction_id: transactionData.transaction_id,
    payment_method: transactionData.payment_method || options.payment_method || 'unknown'
  });
}

// User engagement: Form submission events
function trackFormSubmission(formName, formData = {}) {
  gtag('event', 'form_submit', {
    form_name: formName,
    form_length: Object.keys(formData).length,
    ...formData
  });
}

// User engagement: Document generation events
function trackDocumentGeneration(documentType, options = {}) {
  gtag('event', 'document_generated', {
    document_type: documentType,
    service_tier: options.tier || 'standard',
    province: options.province || 'unknown',
    ...options
  });
}

// Error tracking
function trackError(errorType, errorDetails) {
  gtag('event', 'error', {
    error_type: errorType,
    error_details: errorDetails,
    page_location: window.location.href
  });
}

// Export all tracking functions
window.sdAnalytics = {
  initializeAnalytics,
  trackPageView,
  trackViewItem,
  trackBeginCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackFormSubmission,
  trackDocumentGeneration,
  trackError
};