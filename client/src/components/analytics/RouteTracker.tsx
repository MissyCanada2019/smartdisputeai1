import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';

/**
 * Component to track route changes and send them to analytics
 * Place this component in your App.tsx to enable automatic page tracking
 */
export function RouteTracker() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view when location changes
    const pageTitle = getPageTitle(location);
    trackPageView(location, pageTitle);
    
    // For Google Analytics direct integration (as backup)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      window.gtag('config', 'G-HLQJ5B43NJ', {
        page_path: location,
        page_title: pageTitle
      });
    }
  }, [location]);

  return null;
}

/**
 * Helper function to determine page title based on route
 */
function getPageTitle(path: string): string {
  if (path === '/') return 'Home | SmartDispute.ai';
  
  // Extract page name from path
  const pageName = path.split('/').filter(Boolean).pop() || '';
  const formattedPageName = toTitleCase(pageName.replace(/-/g, ' '));
  
  return `${formattedPageName} | SmartDispute.ai`;
}

/**
 * Converts a string to title case format
 */
function toTitleCase(str: string): string {
  if (!str) return 'Page';
  
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}