import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';
import { useAnalytics } from './AnalyticsProvider';

/**
 * Component to track route changes and send them to analytics
 * Place this component in your App.tsx to enable automatic page tracking
 */
export function RouteTracker() {
  const [location] = useLocation();
  const { hasConsent, isInitialized } = useAnalytics();

  useEffect(() => {
    // Only track page views if the user has given consent and analytics is initialized
    if (hasConsent && isInitialized) {
      const pageTitle = getPageTitle(location);
      trackPageView(location, pageTitle);
    }
  }, [location, hasConsent, isInitialized]);

  // The component doesn't render anything visible
  return null;
}

/**
 * Helper function to determine page title based on route
 */
function getPageTitle(path: string): string {
  // Strip leading slash and split by segments
  const routePath = path.startsWith('/') ? path.substring(1) : path;
  
  if (routePath === '') {
    return 'Home';
  }

  // Handle dynamic routes with IDs
  if (routePath.includes('/')) {
    const segments = routePath.split('/');
    
    // Special case for resource detail pages
    if (segments[0] === 'resources' && segments.length > 1) {
      return 'Resource Detail';
    }
    
    // Special case for document pages
    if (segments[0] === 'documents' && segments.length > 1) {
      return 'Document';
    }
    
    // Default handling for other route patterns
    return toTitleCase(segments[0]);
  }

  // Map specific routes to titles
  const routeTitles: Record<string, string> = {
    'login': 'Login',
    'signup': 'Sign Up',
    'resources': 'Resources',
    'documents': 'Documents',
    'dashboard': 'Dashboard',
    'profile': 'User Profile',
    'evidence': 'Evidence Upload',
    'tenant-dispute': 'Tenant Dispute',
    'cas-dispute': 'CAS Dispute',
    'legal-resources': 'Legal Resources',
    'community': 'Community',
    'about': 'About Us',
    'contact': 'Contact Us',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
    'faq': 'FAQ',
    'help': 'Help Center'
  };

  return routeTitles[routePath] || toTitleCase(routePath);
}

/**
 * Converts a string to title case format
 */
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}