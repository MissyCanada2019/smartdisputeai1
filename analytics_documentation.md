# SmartDispute.ai Analytics & Tracking Documentation

## Overview

This document provides a comprehensive overview of all analytics and tracking implementations within SmartDispute.ai. The platform uses multiple tracking systems to monitor user behavior, document processing, and payment flows.

## Tracking Systems

### 1. Google Tag Manager (GTM)

**Container ID:** `GTM-5L7PTHJK`

GTM serves as the primary tracking management system, allowing for centralized control of various tracking scripts and pixels.

#### Key Features:
- Centralized tag management
- Event tracking across the application
- Integration with Google Analytics
- Custom event tracking
- E-commerce tracking

### 2. Google Analytics 4 (GA4)

**Property ID:** `G-484252740`

GA4 provides comprehensive analytics on user behavior, traffic sources, and conversion metrics.

#### Key Data Tracked:
- User demographics and interests
- Traffic sources and channels
- Page views and engagement metrics
- Event completions
- Conversion funnels
- E-commerce transactions

## Tracked User Journeys

### Document Upload Flow

1. **Landing Page View**
   - Event: `page_view`
   - Data: Page path, page title

2. **Document Upload Initiation**
   - Event: `document_upload_initiated`
   - Data: Upload page visited

3. **Document Upload Completion**
   - Event: `document_upload`
   - Data: Document type, file format, file size

4. **Document Analysis**
   - Event: `ai_analysis`
   - Data: Analysis type, document type, model used

5. **Analysis Results View**
   - Event: `analysis_results_view`
   - Data: Analysis completion time, result type

### Payment Flow

#### General Payment Flow

1. **Checkout Initiation**
   - Event: `begin_checkout`
   - Data: Product type, price, currency

2. **Payment Selection**
   - Event: `payment_method_selected`
   - Data: Payment method (PayPal, Stripe)

3. **Payment Processing**
   - Event: `payment_processing`
   - Data: Payment method, amount

4. **Purchase Completion**
   - Event: `purchase`
   - Data: Transaction ID, value, currency, items

5. **Purchase Cancellation**
   - Event: `payment_cancelled`
   - Data: Product type, payment method

#### Stripe-Specific Flow

1. **Stripe Checkout Page View**
   - Event: `page_view`
   - Data: Page path (`/stripe-checkout`), page title

2. **Stripe Button Click**
   - Event: `begin_checkout`
   - Data: Payment method ("Stripe"), product type, value

3. **Stripe Payment Method Selection**
   - Event: `payment_method_selected`
   - Data: "Stripe", product details

4. **Alternative Payment Selection**
   - Event: `payment_option_change`
   - Data: Selected payment, original payment

### Post-Purchase Flow

1. **Success Page View**
   - Event: `purchase_confirmation_viewed`
   - Data: Order ID, page type

2. **Document Download**
   - Event: `document_download`
   - Data: Document type

3. **Upsell Interaction**
   - Event: `upsell_clicked` / `upsell_dismissed`
   - Data: Offer type, discount amount, price

4. **Email Support Contact**
   - Event: `support_contact`
   - Data: Contact method

## Conversion Tracking

### Primary Conversion Points

1. **Document Uploads**
   - Tracks successful document uploads
   - Monitors upload abandonment

2. **Document Analysis Completions**
   - Tracks AI analysis completion
   - Monitors analysis duration

3. **Purchases**
   - Tracks payment completions
   - Monitors checkout abandonment
   - Captures transaction values

4. **Document Downloads**
   - Tracks document retrieval
   - Monitors time to download

### Secondary Conversion Points

1. **Email Signups**
   - Tracks newsletter subscriptions
   - Monitors form completion rate

2. **Support Queries**
   - Tracks support contact attempts
   - Monitors response engagement

## E-commerce Tracking

### Product Data

Each service offered is tracked with standardized product data:

1. **Basic Analysis**
   - ID: `basic_analysis`
   - Price: $4.99
   - Category: Document Analysis

2. **Full Analysis**
   - ID: `full_analysis`
   - Price: $14.99
   - Category: Document Analysis

3. **Legal Form Submission**
   - ID: `legal_form_submission`
   - Price: $49.99
   - Category: Legal Documents

### Transaction Data

Each payment completion captures:

- Transaction ID
- Total value
- Currency
- Payment method
- Products purchased
- Discount applied (if any)

## Implementation Details

### Client-Side Tracking

1. **GTM Integration**
   - File: `public/gtm.js`
   - Load Points: All HTML pages

2. **Tracking Functions**
   - `trackPageView`: Track page visits
   - `trackDocumentUpload`: Track file uploads
   - `trackAIAnalysis`: Track AI processing
   - `trackPayment`: Track payment events
   - `trackConversion`: Track conversion points
   - `trackFormSubmission`: Track form submissions

### Server-Side Tracking

1. **Payment Verification**
   - PayPal IPN (Instant Payment Notification)
   - Stripe Webhooks

2. **Email Tracking**
   - Open tracking
   - Click tracking on links

## Privacy Considerations

The analytics implementation follows these privacy guidelines:

1. **Consent Management**
   - Users are informed about tracking via the privacy policy
   - Essential cookies only are used by default

2. **Data Minimization**
   - Only necessary data is collected
   - PII is not stored in analytics systems

3. **Data Retention**
   - Analytics data is retained according to platform policies
   - User can request data deletion

## Testing and Validation

Analytics implementation can be validated using:

1. **GTM Preview Mode**
   - For testing tag firing and data collection

2. **Google Analytics Realtime**
   - For confirming event receipt

3. **Test Script**
   - File: `test-gtm-integration.js`
   - Purpose: Automated verification of tracking setup

## Reporting and Dashboard

The analytics setup provides data for:

1. **Performance Dashboard**
   - Daily/weekly/monthly transaction summary
   - Conversion rates by document type
   - Revenue by service type

2. **User Behavior Reports**
   - Upload completion rates
   - Analysis request patterns
   - Payment method preferences

3. **Marketing Effectiveness**
   - Campaign attribution
   - Channel performance
   - Landing page effectiveness

## Maintenance and Updates

The analytics implementation can be maintained through:

1. **GTM ID Updates**
   - Use `update_gtm_id.js` to change GTM container ID

2. **Event Schema Updates**
   - Modify tracking functions in `gtm.js`

3. **New Event Addition**
   - Add new tracking functions to the GTM interface