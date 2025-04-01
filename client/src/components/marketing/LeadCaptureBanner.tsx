import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadCapturePopup from './LeadCapturePopup';

interface LeadCaptureBannerProps {
  resourceName: string;
  headline: string;
  delay?: number; // Delay in milliseconds before showing banner
  persistenceKey?: string; // Key for storage to remember if user closed
}

export default function LeadCaptureBanner({
  resourceName,
  headline,
  delay = 5000, // Default 5 seconds
  persistenceKey = 'smartdispute_banner_closed',
}: LeadCaptureBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    // Check if the banner was previously closed
    const isBannerClosed = localStorage.getItem(persistenceKey) === 'true';
    
    if (!isBannerClosed) {
      // Set a timeout to show the banner after the specified delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay, persistenceKey]);

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user closed the banner
    localStorage.setItem(persistenceKey, 'true');
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-primary text-primary-foreground shadow-lg z-40 animate-slide-up">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="flex-1 font-medium text-center sm:text-left mb-3 sm:mb-0">
            {headline}
          </div>
          <div className="flex space-x-2 items-center">
            <Button 
              variant="secondary" 
              className="whitespace-nowrap"
              onClick={handleOpenPopup}
            >
              Get Free Template
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <LeadCapturePopup
          title={`Get Your Free ${resourceName}`}
          description={`Enter your email to receive your free ${resourceName.toLowerCase()} template immediately.`}
          resourceName={resourceName}
          funnelSource="banner"
          onClose={handleClosePopup}
        />
      )}
    </>
  );
}