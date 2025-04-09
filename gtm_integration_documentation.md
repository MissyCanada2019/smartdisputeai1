# Google Tag Manager Integration for SmartDispute.ai

## Overview

This document outlines the Google Tag Manager (GTM) integration for SmartDispute.ai. The integration enables comprehensive tracking of user interactions, conversion events, and payment processing across the platform.

## GTM Account Information

- **GTM Container ID:** `GTM-5L7PTHJK`
- **Implementation Date:** April 9, 2024

## Integration Files

The GTM integration consists of the following key files:

1. **`public/gtm.js`** - Main GTM integration script with tracking functions
2. **HTML Files with GTM Code:**
   - `index.html` - Main landing page
   - `success.html` - Payment success page
   - `success_with_upsell.html` - Payment success page with upsell offer

## GTM Events Tracked

The integration tracks the following events:

### Page Views
- **Event Name:** `page_view`
- **Data Points:** page path, page title

### Document Uploads
- **Event Name:** `document_upload`
- **Data Points:** document type, file format, file size

### AI Analysis
- **Event Name:** `ai_analysis`
- **Data Points:** analysis type, document type, model used

### Payment Events
- **Event Name:** `payment`
- **Data Points:** payment method, product type, amount, currency
- **Purchase Event:** transaction ID, value, currency, items

### Conversion Events
- **Event Name:** `conversion`
- **Data Points:** conversion type, source, additional data

### Form Submissions
- **Event Name:** `form_submission`
- **Data Points:** form ID, form type

## Payment Checkout Tracking

### PayPal Checkout Tracking

The PayPal checkout implementation includes the following tracking points:

1. **Begin Checkout**
   - Tracks when a user initiates the checkout process

2. **Payment Processing**
   - Monitors the payment processing stage

3. **Purchase Completion**
   - Records successful purchase transactions with order details

4. **Payment Cancellation**
   - Tracks when users cancel the payment process

5. **Payment Errors**
   - Captures any errors that occur during payment

### Stripe Checkout Tracking

The Stripe checkout implementation includes the following tracking points:

1. **Begin Checkout**
   - Event: `begin_checkout`
   - Tracks when a user initiates the Stripe checkout process

2. **Stripe Redirect**
   - Event: `payment_method_selected`
   - Tracks when a user selects Stripe as payment method

3. **Purchase Completion**
   - Event: `purchase`
   - Records successful purchase transactions with order details
   - Data captured: transaction ID, amount, currency

4. **Payment Method Change**
   - Event: `payment_option_change`
   - Tracks when a user changes from Stripe to another payment method

## Success Page Tracking

The success pages include tracking for:

1. **Page View**
   - Records when users reach the success page

2. **Document Download**
   - Tracks when users download their documents

3. **Upsell Interactions**
   - Monitors engagement with upsell offers

## Testing and Validation

The integration can be tested using the `test-gtm-integration.js` script, which:

1. Verifies GTM code presence in HTML files
2. Tests tracking functions using Puppeteer
3. Validates dataLayer events

## Usage in Code

### Initializing GTM
GTM is automatically initialized when the page loads:

```javascript
// Auto-initialize when the script loads
document.addEventListener('DOMContentLoaded', initializeGTM);
```

### Tracking Events

```javascript
// Example: Track a page view
window.GTM.trackPageView('/my-page', 'My Page Title');

// Example: Track document upload
window.GTM.trackDocumentUpload('legal_form', 'pdf', 1024000);

// Example: Track payment
window.GTM.trackPayment('PayPal', 'legal_form_submission', 49.99, 'CAD');

// Example: Track a conversion
window.GTM.trackConversion('document_download', 'success_page', {
  document_type: 'legal_form'
});
```

## Maintenance

To update the GTM ID across all files, use the `update_gtm_id.js` script:

```
node update_gtm_id.js NEW-GTM-ID
```

## Privacy Considerations

- The GTM implementation respects user privacy settings
- Only essential data is collected to measure performance
- No personally identifiable information (PII) is tracked unless explicitly approved