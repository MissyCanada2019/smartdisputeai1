import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackHubSpotPageView, trackHubSpotEvent } from '@/lib/hubspotUtils';

/**
 * Hook to automatically track page views in HubSpot
 */
export function useHubSpotPageViewTracking() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Track page view whenever location changes
    trackHubSpotPageView();
  }, [location]);
  
  return null;
}

/**
 * Hook that returns functions for tracking HubSpot events
 * @returns Functions for tracking HubSpot events
 */
export function useHubSpotTracking() {
  // Return an object with tracking functions
  return {
    /**
     * Track a custom event in HubSpot
     * @param eventName The name of the event
     * @param properties Additional properties
     */
    trackEvent: (eventName: string, properties: Record<string, any> = {}) => {
      trackHubSpotEvent(eventName, properties);
    },
    
    /**
     * Track a form submission event
     * @param formName The name of the form
     * @param formData The form data
     */
    trackFormSubmission: (formName: string, formData: Record<string, any> = {}) => {
      trackHubSpotEvent('form_submission', {
        formName,
        ...formData
      });
    },
    
    /**
     * Track a button click event
     * @param buttonName The name of the button
     * @param properties Additional properties
     */
    trackButtonClick: (buttonName: string, properties: Record<string, any> = {}) => {
      trackHubSpotEvent('button_click', {
        buttonName,
        ...properties
      });
    },
    
    /**
     * Identify a user in HubSpot
     * @param email User's email
     * @param properties Additional user properties
     */
    identifyUser: (email: string, properties: Record<string, any> = {}) => {
      if (typeof window !== 'undefined' && (window as any)._hsq && email) {
        (window as any)._hsq.push(['identify', {
          email: email,
          ...properties
        }]);
      }
    }
  };
}