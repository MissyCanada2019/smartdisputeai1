/**
 * Utility functions for interacting with HubSpot
 */

/**
 * Track a custom event in HubSpot
 * @param eventName The name of the event to track
 * @param properties Additional properties to include with the event
 */
export const trackHubSpotEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Ensure HubSpot script has loaded and _hsq is available
  if (typeof window !== 'undefined' && (window as any)._hsq) {
    // Push the tracking event to HubSpot's event queue
    (window as any)._hsq.push(['trackCustomBehavioralEvent', {
      name: eventName,
      properties: properties
    }]);
    console.log(`HubSpot event tracked: ${eventName}`, properties);
  } else {
    console.warn('HubSpot tracking not available');
  }
};

/**
 * Track a page view in HubSpot
 * @param path The path being viewed (defaults to current path)
 * @param title The page title (defaults to document title)
 */
export const trackHubSpotPageView = (path?: string, title?: string) => {
  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');
  const pageTitle = title || (typeof document !== 'undefined' ? document.title : '');
  
  if (typeof window !== 'undefined' && (window as any)._hsq) {
    // Set the current page in HubSpot analytics
    (window as any)._hsq.push(['setPath', currentPath]);
    (window as any)._hsq.push(['setContentType', 'standard-page']);
    
    // If we have a title, set it
    if (pageTitle) {
      (window as any)._hsq.push(['setPageName', pageTitle]);
    }
    
    // Track the page view
    (window as any)._hsq.push(['trackPageView']);
    console.log(`HubSpot page view tracked: ${currentPath}`);
  } else {
    console.warn('HubSpot tracking not available');
  }
};

/**
 * Identify a user in HubSpot
 * @param email User's email address
 * @param properties Additional user properties
 */
export const identifyHubSpotUser = (email: string, properties: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any)._hsq && email) {
    (window as any)._hsq.push(['identify', {
      email: email,
      ...properties
    }]);
    console.log(`HubSpot user identified: ${email}`);
  } else {
    console.warn('HubSpot identify not available or email not provided');
  }
};