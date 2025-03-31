import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
    
    // Notify HubSpot about consent if available
    if (window._hsq) {
      window._hsq.push(['setPath', '/']);
      window._hsq.push(['trackPageView']);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
    
    // Disable tracking if user declines
    if (window._hsq) {
      window._hsq.push(['doNotTrack']);
    }
    
    // Alert user that some features may not work properly
    alert('Some features of the site may not function properly without cookies and tracking.');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-md z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          <h3 className="font-semibold text-base mb-1">We value your privacy</h3>
          <p>
            We use cookies and similar technologies to improve your experience, analyze traffic, and for marketing purposes. 
            By clicking "Accept All", you consent to our use of cookies as described in our Cookie Policy.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAccept}
          >
            Accept All
          </Button>
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 md:hidden" 
            onClick={() => setIsVisible(false)}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;

// Add TypeScript interface for window._hsq
declare global {
  interface Window {
    _hsq: any[];
  }
}