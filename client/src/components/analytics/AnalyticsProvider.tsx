import { ReactNode, useEffect } from 'react';

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Provider component that sets up analytics and tracking
 * Wrap your App with this component to enable all tracking features
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    setupAnalytics();
  }, []);

  /**
   * Setup analytics and ensure Google Tag Manager and GA4 are properly loaded
   */
  function setupAnalytics() {
    // Ensure dataLayer exists
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];

      // Initialize Tag Manager
      initializeGTM();
      
      // Log analytics initialization
      console.log('Analytics initialized successfully');
    }
  }

  /**
   * Initialize Google Tag Manager
   */
  function initializeGTM() {
    if (typeof window !== 'undefined' && !window.document.getElementById('gtm-script')) {
      const script = document.createElement('script');
      script.id = 'gtm-script';
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-5L7PTHJK');
      `;

      document.head.appendChild(script);

      // Add noscript iframe for tracking when JS is disabled
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5L7PTHJK"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;

      if (document.body) {
        document.body.appendChild(noscript);
      }
    }
  }

  return <>{children}</>;
}