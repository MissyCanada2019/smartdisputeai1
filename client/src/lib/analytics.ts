// Type augmentation for Window
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Push an event to the dataLayer
 */
export const trackEvent = (eventName: string, eventData = {}) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  
  window.dataLayer.push({
    event: eventName,
    ...eventData
  });
  
  console.log(`Event tracked: ${eventName}`, eventData);
};

/**
 * Track page views
 */
export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmission = (formName: string, formData: Record<string, any> = {}) => {
  const safeFormData = { ...formData };
  
  // Remove sensitive data
  delete safeFormData.password;
  delete safeFormData.creditCard;
  delete safeFormData.ssn;
  
  trackEvent('form_submission', {
    form_name: formName,
    form_data: safeFormData
  });
};

/**
 * Track document generation
 */
export const trackDocumentGeneration = (documentType: string, documentId: string, province: string) => {
  trackEvent('document_generation', {
    document_type: documentType,
    document_id: documentId,
    province: province,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track evidence uploads
 */
export const trackEvidenceUpload = (fileCount: number, fileTypes: string[], caseType: string) => {
  trackEvent('evidence_upload', {
    file_count: fileCount,
    file_types: fileTypes,
    case_type: caseType,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track resource viewing
 */
export const trackResourceView = (resourceId: string, resourceTitle: string, resourceType: string) => {
  trackEvent('resource_view', {
    resource_id: resourceId,
    resource_title: resourceTitle,
    resource_type: resourceType,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track community engagement
 */
export const trackCommunityEngagement = (actionType: 'post'|'comment'|'like'|'bookmark', contentId: string) => {
  trackEvent('community_engagement', {
    action_type: actionType,
    content_id: contentId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track user authentication events
 */
export const trackAuthEvent = (eventType: 'login'|'signup'|'logout', userId?: string) => {
  trackEvent('auth_event', {
    event_type: eventType,
    user_id: userId || 'anonymous',
    timestamp: new Date().toISOString()
  });
};

/**
 * Track payment and subscription events
 */
export const trackPaymentEvent = (
  eventType: 'purchase'|'subscription_created'|'subscription_cancelled',
  amount: number,
  currency: string = 'CAD',
  productInfo: Record<string, any> = {}
) => {
  trackEvent('payment_event', {
    event_type: eventType,
    amount: amount,
    currency: currency,
    product_info: productInfo,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track user searches
 */
export const trackSearch = (searchTerm: string, searchType: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    search_type: searchType,
    results_count: resultsCount,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (featureName: string, featureCategory: string) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    feature_category: featureCategory,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track error events
 */
export const trackError = (errorType: string, errorMessage: string, errorSource: string) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    error_source: errorSource,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track social sharing
 */
export const trackSocialShare = (platform: string, contentType: string, contentId: string) => {
  trackEvent('social_share', {
    platform: platform,
    content_type: contentType,
    content_id: contentId,
    timestamp: new Date().toISOString()
  });
};