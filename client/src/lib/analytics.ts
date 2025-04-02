/**
 * Analytics utility functions for tracking user behavior
 */

// Extend Window interface to include Google Analytics and GTM properties
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
  if (!window.gtag) {
    console.warn('[Analytics] gtag not available for page view tracking');
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.origin + path,
    send_to: 'G-HLQJ5B43NJ'
  });

  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: title
    });
  }

  if (import.meta.env.DEV) {
    console.log(`[Analytics] Page View: ${title} (${path})`);
  }
}

/**
 * Track a user action event
 * 
 * @param eventName Name of the event
 * @param category Event category
 * @param properties Additional properties to track with the event
 */
export function trackEvent(
  eventName: string,
  category: string,
  properties: Record<string, any> = {}
): void {
  if (!window.gtag) {
    console.warn(`[Analytics] gtag not available for event tracking: ${eventName}`);
    return;
  }

  const eventData = {
    ...properties,
    event_category: category,
    send_to: 'G-HLQJ5B43NJ'
  };

  window.gtag('event', eventName, eventData);

  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      event_category: category,
      ...properties
    });
  }

  if (import.meta.env.DEV) {
    console.log(`[Analytics] Event: ${eventName} (${category})`, properties);
  }
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
  if (!window.gtag) {
    console.warn(`[Analytics] gtag not available for conversion tracking: ${conversionName}`);
    return;
  }

  const conversionData = {
    ...properties,
    event_category: 'conversion',
    value: value,
    send_to: 'G-HLQJ5B43NJ'
  };

  window.gtag('event', conversionName, conversionData);

  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'conversion',
      conversion_name: conversionName,
      conversion_value: value,
      ...properties
    });
  }

  if (import.meta.env.DEV) {
    console.log(`[Analytics] Conversion: ${conversionName}`, { value, ...properties });
  }
}

/**
 * Track a resource sharing event
 * 
 * @param resourceId ID of the shared resource
 * @param resourceType Type of resource (e.g., 'document', 'template')
 * @param shareMethod How it was shared (e.g., 'email', 'facebook', 'twitter')
 */
export function trackResourceShare(
  resourceId: number | string,
  resourceType: string,
  shareMethod: string
): void {
  trackEvent('share', 'engagement', {
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
  trackConversion('sign_up', undefined, {
    method,
    source
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
  trackEvent('form_submit', 'engagement', {
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
  templateId: number | string,
  isCustomized: boolean
): void {
  trackEvent('document_generate', 'engagement', {
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
  trackEvent('evidence_upload', 'engagement', {
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
  resourceId: number | string,
  action: string,
  province?: string
): void {
  trackEvent('resource_interaction', 'engagement', {
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
  contentId: number | string
): void {
  trackEvent('community_engagement', 'engagement', {
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
  trackEvent('ai_process_complete', 'engagement', {
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
  documentId: number | string,
  documentType: string,
  format: string
): void {
  trackEvent('document_download', 'engagement', {
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
  trackConversion('purchase', amount, {
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
  userId: number | string,
  fieldsUpdated: string[]
): void {
  trackEvent('profile_update', 'account', {
    user_id: userId,
    fields_updated: fieldsUpdated.join(',')
  });
}