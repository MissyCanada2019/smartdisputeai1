import { useCallback } from 'react';

type EventProperties = Record<string, any>;

/**
 * Hook to provide analytics tracking functionality
 */
export function useAnalytics() {
  /**
   * Track a custom event
   * @param eventName Name of the event to track
   * @param properties Additional properties for the event
   */
  const trackEvent = useCallback((eventName: string, properties: EventProperties = {}) => {
    try {
      // Check if gtag function exists (Google Analytics)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, properties);
        console.log('Analytics event tracked:', eventName, properties);
      } else {
        console.log('Analytics tracking not available');
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }, []);

  /**
   * Track a page view
   * @param pagePath Path of the page being viewed
   * @param pageTitle Title of the page
   */
  const trackPageView = useCallback((pagePath: string, pageTitle: string) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', 'G-YOUR-MEASUREMENT-ID', {
          page_path: pagePath,
          page_title: pageTitle
        });
        console.log('Page view tracked:', pagePath, pageTitle);
      } else {
        console.log('Analytics tracking not available');
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, []);

  /**
   * Track an e-commerce transaction
   * @param transactionId Unique transaction ID
   * @param amount Transaction amount
   * @param currency Currency code (e.g., USD)
   * @param productName Name of the product or service
   */
  const trackTransaction = useCallback((
    transactionId: string,
    amount: number,
    currency: string = 'USD',
    productName: string = 'Service'
  ) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        // Send a purchase event to Google Analytics
        (window as any).gtag('event', 'purchase', {
          transaction_id: transactionId,
          value: amount,
          currency: currency,
          items: [{
            id: transactionId,
            name: productName,
            price: amount,
            quantity: 1
          }]
        });
        console.log('Transaction tracked:', transactionId, amount, currency, productName);
      } else {
        console.log('Analytics tracking not available');
      }
    } catch (error) {
      console.error('Error tracking transaction:', error);
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackTransaction
  };
}