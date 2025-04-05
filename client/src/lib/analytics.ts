/**
 * Analytics utility functions for tracking user interactions
 * This file contains all tracking methods for Google Analytics 4 (GA4) via Google Tag Manager (GTM)
 */

// Extend window interface to include dataLayer and gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Track a page view event
 * 
 * @param path The current page path
 * @param title Page title
 */
export function trackPageView(path: string, title: string): void {
  if (!window.dataLayer) {
    console.warn('Analytics not initialized: dataLayer not found');
    return;
  }
  
  try {
    // Push the page view event to dataLayer
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: title,
      page_location: window.location.href
    });
    
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Page view: ${title} (${path})`);
    }
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
}

/**
 * Track a user action event with properties
 * 
 * @param eventName Name of the event
 * @param properties Object with event properties
 */
export function trackEvent(
  eventName: string,
  properties: Record<string, any> = {}
): void {
  if (!window.dataLayer) {
    console.warn('Analytics not initialized: dataLayer not found');
    return;
  }
  
  try {
    // Prepare event data with standard properties
    const eventData = {
      event: eventName,
      ...properties
    };
    
    // Push the event to dataLayer
    window.dataLayer.push(eventData);
    
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event tracked: ${eventName}`, eventData);
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * Track a user action event with category
 * 
 * @param eventName Name of the event
 * @param category Event category
 * @param properties Additional properties to track with the event
 */
export function trackEventWithCategory(
  eventName: string,
  category: string,
  properties: Record<string, any> = {}
): void {
  trackEvent(eventName, {
    event_category: category,
    ...properties
  });
}

/**
 * Track a user conversion (goal completion)
 * 
 * @param conversionName Name of the conversion event
 * @param value Optional monetary value of the conversion
 * @param properties Additional properties to track with the conversion
 */
export function trackConversion(
  conversionName: string,
  value?: number,
  properties: Record<string, any> = {}
): void {
  trackEvent('conversion', {
    conversion_name: conversionName,
    value,
    ...properties
  });
}

/**
 * Track a resource sharing event
 * 
 * @param resourceId ID of the shared resource
 * @param resourceType Type of resource (e.g., 'document', 'template')
 * @param shareMethod How it was shared (e.g., 'email', 'facebook', 'twitter')
 */
export function trackResourceShare(
  resourceId: number,
  resourceType: string,
  shareMethod: string
): void {
  trackEvent('resource_share', {
    event_category: 'sharing',
    resource_id: resourceId,
    resource_type: resourceType,
    share_method: shareMethod
  });
}

/**
 * Track a user signup or account creation
 * 
 * @param method Signup method (e.g., 'email', 'google', 'facebook')
 * @param source Where the user signed up from (e.g., 'homepage', 'resource_page')
 */
export function trackSignup(method: string, source: string): void {
  trackEvent('sign_up', {
    event_category: 'account',
    signup_method: method,
    signup_source: source
  });
}

/**
 * Track form submission
 * 
 * @param formName Name of the form
 * @param formLocation Where the form is located
 * @param isSuccess Whether the submission was successful
 */
export function trackFormSubmission(
  formName: string,
  formLocation: string,
  isSuccess: boolean
): void {
  trackEvent('form_submit', {
    event_category: 'engagement',
    form_name: formName,
    form_location: formLocation,
    success: isSuccess
  });
}

/**
 * Track document generation
 * 
 * @param documentType Type of document generated
 * @param templateId Template ID used
 * @param isCustomized Whether the document was customized
 */
export function trackDocumentGeneration(
  documentType: string,
  templateId: number,
  isCustomized: boolean
): void {
  trackEvent('generate_document', 'document', {
    document_type: documentType,
    template_id: templateId,
    customized: isCustomized
  });
}

/**
 * Track search action
 * 
 * @param searchTerm The search term or query
 * @param category Search category (e.g., 'resources', 'templates')
 * @param resultsCount Number of results returned
 */
export function trackSearch(
  searchTerm: string,
  category: string,
  resultsCount: number
): void {
  trackEvent('search', 'engagement', {
    search_term: searchTerm,
    search_category: category,
    results_count: resultsCount
  });
}

/**
 * Track user error encounters
 * 
 * @param errorType Type of error
 * @param errorMessage Error message
 * @param errorLocation Where the error occurred
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  errorLocation: string
): void {
  trackEvent('error', 'error', {
    error_type: errorType,
    error_message: errorMessage,
    error_location: errorLocation
  });
}

/**
 * Track evidence uploads
 * 
 * @param fileCount Number of files uploaded
 * @param fileTypes Array of file types
 * @param totalSize Total size of uploaded files in bytes
 */
export function trackEvidenceUpload(
  fileCount: number,
  fileTypes: string[],
  totalSize: number
): void {
  trackEvent('evidence_upload', 'evidence', {
    file_count: fileCount,
    file_types: fileTypes.join(','),
    total_size: totalSize
  });
}

/**
 * Track tenant dispute workflow events
 * 
 * @param step Step in the workflow
 * @param details Additional details about the step
 */
export function trackTenantDisputeProgress(
  step: string,
  details: Record<string, any> = {}
): void {
  trackEvent('tenant_dispute_progress', 'workflow', {
    step,
    ...details
  });
}

/**
 * Track CAS dispute workflow events
 * 
 * @param step Step in the workflow
 * @param details Additional details about the step
 */
export function trackCASDisputeProgress(
  step: string,
  details: Record<string, any> = {}
): void {
  trackEvent('cas_dispute_progress', 'workflow', {
    step,
    ...details
  });
}

/**
 * Track legal resource interaction
 * 
 * @param resourceId ID of the resource
 * @param action Action taken (e.g., 'view', 'download', 'bookmark')
 * @param province Related province (if applicable)
 */
export function trackResourceInteraction(
  resourceId: number,
  action: string,
  province?: string
): void {
  trackEvent('resource_interaction', 'resource', {
    resource_id: resourceId,
    action,
    province
  });
}

/**
 * Track community engagement
 * 
 * @param action Action taken (e.g., 'post', 'comment', 'vote')
 * @param contentType Type of content (e.g., 'forum', 'resource', 'comment')
 * @param contentId ID of the content
 */
export function trackCommunityEngagement(
  action: string,
  contentType: string,
  contentId: number
): void {
  trackEvent('community_engagement', 'community', {
    action,
    content_type: contentType,
    content_id: contentId
  });
}

/**
 * Track completion of the AI-assisted process
 * 
 * @param processType Type of process completed
 * @param timeToComplete Time taken to complete in seconds
 * @param successRate Success rate (0-100)
 */
export function trackAIProcessCompletion(
  processType: string,
  timeToComplete: number,
  successRate: number
): void {
  trackEvent('ai_process_completion', 'ai', {
    process_type: processType,
    time_to_complete: timeToComplete,
    success_rate: successRate
  });
}

/**
 * Track document download
 * 
 * @param documentId ID of the document
 * @param documentType Type of document
 * @param format Format of the download (e.g., 'pdf', 'docx')
 */
export function trackDocumentDownload(
  documentId: number,
  documentType: string,
  format: string
): void {
  trackEvent('document_download', 'document', {
    document_id: documentId,
    document_type: documentType,
    format
  });
}

/**
 * Track payment event
 * 
 * @param amount Payment amount
 * @param currency Currency code
 * @param serviceType Type of service paid for
 * @param paymentMethod Payment method used
 */
export function trackPayment(
  amount: number,
  currency: string,
  serviceType: string,
  paymentMethod: string
): void {
  trackEvent('payment', 'ecommerce', {
    amount,
    currency,
    service_type: serviceType,
    payment_method: paymentMethod
  });
}

/**
 * Track user profile update
 * 
 * @param userId User ID
 * @param fieldsUpdated Array of fields that were updated
 */
export function trackProfileUpdate(
  userId: number,
  fieldsUpdated: string[]
): void {
  trackEvent('profile_update', 'account', {
    user_id: userId,
    fields_updated: fieldsUpdated.join(',')
  });
}

/**
 * Track CTA (Call-to-Action) clicks
 * 
 * @param ctaText Text displayed on the CTA
 * @param ctaLocation Location of the CTA (e.g., 'sticky_footer', 'header', 'sidebar')
 * @param destinationUrl Destination URL of the CTA
 */
export function trackCtaClick(
  ctaText: string,
  ctaLocation: string,
  destinationUrl: string
): void {
  trackEvent('cta_click', {
    event_category: 'conversion',
    cta_text: ctaText,
    cta_location: ctaLocation,
    destination_url: destinationUrl
  });
}