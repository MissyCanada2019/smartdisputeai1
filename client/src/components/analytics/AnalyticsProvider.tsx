import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Analytics context definition
 */
interface AnalyticsContextType {
  trackEvent: (eventName: string, category: string, properties?: Record<string, any>) => void;
  setConsent: (consent: boolean) => void;
  hasConsent: boolean;
  isInitialized: boolean;
}

/**
 * Create the analytics context with default values
 */
export const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  setConsent: () => {},
  hasConsent: false,
  isInitialized: false
});

/**
 * Custom hook to use analytics context
 */
export const useAnalytics = () => useContext(AnalyticsContext);

/**
 * Props for AnalyticsProvider component
 */
interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Analytics state interface
 */
interface AnalyticsState {
  initialized: boolean;
  userConsent: boolean;
}

// Local storage key for saving analytics consent
const ANALYTICS_CONSENT_KEY = 'smartdispute_analytics_consent';

/**
 * Provider component that sets up analytics and tracking
 * Wrap your App with this component to enable all tracking features
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [state, setState] = useState<AnalyticsState>({
    initialized: false,
    userConsent: false
  });

  /**
   * Initialize analytics on mount
   */
  useEffect(() => {
    // Check if user has previously given consent
    const savedConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    const hasConsent = savedConsent === 'true';
    
    if (hasConsent) {
      setupAnalytics();
    } else {
      // Still initialize Google Tag Manager but with consent mode disabled
      initializeGTM();
      
      setState(prev => ({
        ...prev,
        initialized: true
      }));
    }
    
    setState(prev => ({
      ...prev,
      userConsent: hasConsent
    }));
  }, []);

  /**
   * Setup analytics and ensure Google Tag Manager and GA4 are properly loaded
   */
  function setupAnalytics() {
    try {
      initializeGTM();
      
      setState(prev => ({
        ...prev,
        initialized: true
      }));
      
      // Log initialization success for debugging
      if (import.meta.env.DEV) {
        console.log('[Analytics] Successfully initialized analytics');
      }
    } catch (error) {
      console.error('[Analytics] Failed to initialize:', error);
      
      setState(prev => ({
        ...prev,
        initialized: false
      }));
    }
  }

  /**
   * Initialize Google Tag Manager
   */
  function initializeGTM() {
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      // GTM already initialized
      return;
    }

    try {
      // Initialize the dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // Initialize GTM with consent mode if user has consented
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
        'consent': state.userConsent ? 'granted' : 'denied'
      });
      
      // Create GTM script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=GTM-5L7PTHJK`;
      
      document.head.appendChild(script);
      
      if (import.meta.env.DEV) {
        console.log('[Analytics] GTM script loaded');
      }
    } catch (error) {
      console.error('[Analytics] Failed to initialize GTM:', error);
    }
  }

  /**
   * Set user consent for analytics tracking
   */
  function setConsent(consent: boolean) {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, String(consent));
    
    setState(prev => ({
      ...prev,
      userConsent: consent
    }));
    
    if (consent && !state.initialized) {
      setupAnalytics();
    }
    
    // Update consent in dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'update_consent',
        consent: consent ? 'granted' : 'denied'
      });
    }
    
    // Log consent change for debugging
    if (import.meta.env.DEV) {
      console.log(`[Analytics] User ${consent ? 'granted' : 'denied'} consent`);
    }
  }

  /**
   * Track a custom event with the specified name and data
   */
  function trackCustomEvent(eventName: string, category: string, eventData: Record<string, any> = {}) {
    if (!state.userConsent || !state.initialized) {
      if (import.meta.env.DEV) {
        console.log(`[Analytics] Event tracking blocked - consent: ${state.userConsent}, initialized: ${state.initialized}`);
      }
      return;
    }
    
    // Use the centralized tracking function from analytics.ts
    trackEvent(eventName, category, eventData);
  }

  const contextValue: AnalyticsContextType = {
    trackEvent: trackCustomEvent,
    setConsent,
    hasConsent: state.userConsent,
    isInitialized: state.initialized
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}