import React, { useState, useEffect } from 'react';
import LeadCapturePopup from './LeadCapturePopup';

interface ExitIntentPopupProps {
  resourceName: string;
  title: string;
  description: string;
  delay?: number; // Minimum time on page before exit popup can trigger (ms)
  persistenceKey?: string; // Key for storage to remember if user already saw it
}

export default function ExitIntentPopup({
  resourceName,
  title,
  description,
  delay = 10000, // Default 10 seconds
  persistenceKey = 'smartdispute_exit_popup_shown',
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // Don't show the popup until after the delay
    const timer = setTimeout(() => {
      setCanShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    // Check if user has seen the popup
    const hasSeenPopup = localStorage.getItem(persistenceKey) === 'true';
    
    if (hasSeenPopup || !canShow) {
      return;
    }

    // Handler for mouse leaving the viewport (top of page)
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse moves to the top of the viewport
      if (e.clientY <= 20) {
        setIsVisible(true);
        localStorage.setItem(persistenceKey, 'true');
        
        // Remove the event listener once triggered
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Handler for browser history changes (about to navigate away)
    const handleBeforeUnload = () => {
      localStorage.setItem(persistenceKey, 'true');
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up event listeners
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [canShow, persistenceKey]);

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