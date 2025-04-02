/**
 * Google Analytics 4 (GA4) initialization script
 * 
 * This file is loaded in the HTML to initialize Google Analytics 4
 * with the GA4 measurement ID: G-HLQJ5B43NJ
 */

// Initialize dataLayer if not already done
window.dataLayer = window.dataLayer || [];

// Define the gtag function
function gtag(){dataLayer.push(arguments);}

// Initialize GA4 with the measurement ID
gtag('js', new Date());
gtag('config', 'G-HLQJ5B43NJ', {
  send_page_view: false, // We'll handle page views manually with our RouteTracker
  cookie_flags: 'secure;samesite=strict',
  anonymize_ip: true // Helps with privacy regulations
});