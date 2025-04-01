import React, { useState, useEffect } from 'react';
import LeadCapturePopup from './LeadCapturePopup';

interface TimedLeadPopupProps {
  resourceName: string;
  title: string;
  description: string;
  delay?: number; // Delay in milliseconds before showing popup
  pageViewThreshold?: number; // Number of page views before showing
  persistenceKey?: string; // Key for storage to remember if user already saw it
}

export default function TimedLeadPopup({
  resourceName,
  title,
  description,
  delay = 30000, // Default 30 seconds
  pageViewThreshold = 2, // Default show after 2 page views
  persistenceKey = 'smartdispute_popup_shown',
}: TimedLeadPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup
    const hasSeenPopup = localStorage.getItem(persistenceKey) === 'true';
    
    // Check page view count
    const pageViews = parseInt(localStorage.getItem('smartdispute_page_views') || '0', 10);
    const newPageViews = pageViews + 1;
    
    // Save updated page view count
    localStorage.setItem('smartdispute_page_views', newPageViews.toString());
    
    // If user hasn't seen popup and has viewed enough pages
    if (!hasSeenPopup && newPageViews >= pageViewThreshold) {
      // Set a timeout to show the popup after the specified delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem(persistenceKey, 'true');
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay, pageViewThreshold, persistenceKey]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <LeadCapturePopup
      title={title}
      description={description}
      resourceName={resourceName}
      funnelSource="exit_intent_popup"
      onClose={handleClose}
    />
  );
}