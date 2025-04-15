/**
 * Tracking Service for HubSpot integration
 * This service provides methods for tracking custom events in HubSpot
 */

// Initialize HubSpot tracking queue if it doesn't exist
if (typeof window !== 'undefined' && !window._hsq) {
  window._hsq = [];
}

/**
 * Track a page view in HubSpot
 * @param path - Optional path to track. If not provided, current path will be used
 */
export const trackPageView = (path?: string) => {
  if (typeof window === 'undefined' || !window._hsq) return;
  
  if (path) {
    window._hsq.push(['setPath', path]);
  }
  window._hsq.push(['trackPageView']);
};

/**
 * Track a custom event in HubSpot
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to associate with the event
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window._hsq) return;
  
  window._hsq.push(['trackEvent', {
    id: eventName,
    value: properties,
  }]);
  
  console.log(`Tracked event: ${eventName}`, properties);
};

/**
 * Identify a user in HubSpot
 * @param email - User's email address
 * @param properties - Additional user properties
 */
export const identifyUser = (email: string, properties: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window._hsq) return;
  
  const payload = {
    email,
    ...properties
  };
  
  window._hsq.push(['identify', payload]);
};

/**
 * Common events to track in the application
 */
export const Events = {
  // User account events
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_UPDATED_PROFILE: 'user_updated_profile',
  
  // Document related events
  DOCUMENT_CREATED: 'document_created',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_SHARED: 'document_shared',
  DOCUMENT_TEMPLATE_VIEWED: 'document_template_viewed',
  DOCUMENT_FILLED: 'document_form_filled',
  DOCUMENT_GENERATED: 'document_generated',
  
  // Evidence and analysis events
  EVIDENCE_UPLOADED: 'evidence_uploaded',
  EVIDENCE_ANALYZED: 'evidence_analyzed',
  CASE_ANALYSIS_CREATED: 'case_analysis_created',
  DOCUMENT_RECOMMENDED: 'document_recommended',
  MERIT_ASSESSMENT_REQUESTED: 'merit_assessment_requested',
  MERIT_ASSESSMENT_VIEWED: 'merit_assessment_viewed',
  
  // Subscription events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Interaction events
  CHATBOT_INTERACTION: 'chatbot_interaction',
  CHATBOT_STARTED: 'chatbot_started',
  CHATBOT_COMPLETED: 'chatbot_completed',
  RESOURCE_VIEWED: 'resource_viewed',
  SEARCH_PERFORMED: 'search_performed',
  
  // E-commerce events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Lead generation events
  LEAD_CAPTURED: 'lead_captured',
  LEAD_QUALIFIED: 'lead_qualified',
  LEAD_CONVERTED: 'lead_converted'
};

// Define interface for window._hsq
declare global {
  interface Window {
    _hsq: any[];
  }
}

export default {
  trackPageView,
  trackEvent,
  identifyUser,
  Events
};