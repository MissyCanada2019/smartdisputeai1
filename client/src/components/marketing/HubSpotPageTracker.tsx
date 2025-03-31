import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackHubSpotPageView } from '@/lib/hubspotUtils';

/**
 * Component that automatically tracks page views in HubSpot
 * Place this component at the App level to track all page views
 */
export function HubSpotPageTracker() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Initialize HubSpot queue if not already initialized
    if (typeof window !== 'undefined' && !(window as any)._hsq) {
      (window as any)._hsq = [];
    }
    
    // Track page view whenever location changes
    trackHubSpotPageView();
  }, [location]);
  
  return null; // This component doesn't render anything
}