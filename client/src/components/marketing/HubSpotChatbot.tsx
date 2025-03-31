import React, { useEffect } from 'react';

interface HubSpotChatbotProps {
  /**
   * Delay in milliseconds before initializing the chatbot
   * This can be useful to prevent the chatbot from immediately appearing
   */
  initDelay?: number;
  
  /**
   * Whether to load the chatbot on mount
   * Set to false if you want to manually load the chatbot later
   */
  loadOnMount?: boolean;
  
  /**
   * Whether to hide the chatbot initially
   * The user will need to click an icon to open it
   */
  hideInitially?: boolean;
  
  /**
   * Set Canadian legal context for the chatbot
   * This helps ensure the chatbot is aware of Canadian legal system specifics
   */
  canadianLegalContext?: boolean;
}

/**
 * Component to manage the HubSpot chatbot
 * This component provides configuration options for the HubSpot chatbot
 * which is automatically loaded by the HubSpot tracking script
 */
export function HubSpotChatbot({
  initDelay = 2000,
  loadOnMount = true,
  hideInitially = true,
  canadianLegalContext = true,
}: HubSpotChatbotProps) {
  useEffect(() => {
    if (!loadOnMount) return;
    
    // Initialize HubSpot queue if not already initialized
    if (typeof window !== 'undefined' && !(window as any)._hsq) {
      (window as any)._hsq = [];
    }
    
    // Delay initialization to prevent the chatbot from immediately appearing
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any)._hsq) {
        // Configure the chatbot
        (window as any)._hsq.push(['chatbot:config', {
          // Set initial visibility
          initiallyHidden: hideInitially,
          
          // Set Canadian legal context if specified
          // This sets metadata that can be used in HubSpot to configure the chatbot's responses
          metadata: {
            ...(canadianLegalContext ? {
              legalContext: 'canadian',
              jurisdictionType: 'canada',
              legalSystemType: 'common_law_civil_law_hybrid'
            } : {})
          }
        }]);
        
        // Load the chatbot
        (window as any)._hsq.push(['chatbot:load']);
      }
    }, initDelay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [initDelay, loadOnMount, hideInitially, canadianLegalContext]);
  
  return null; // This component doesn't render anything visible
}

// Export functions to control the chatbot programmatically
export const hubSpotChatbotControls = {
  /**
   * Open the HubSpot chatbot
   */
  open: () => {
    if (typeof window !== 'undefined' && (window as any)._hsq) {
      (window as any)._hsq.push(['chatbot:open']);
    }
  },
  
  /**
   * Close the HubSpot chatbot
   */
  close: () => {
    if (typeof window !== 'undefined' && (window as any)._hsq) {
      (window as any)._hsq.push(['chatbot:close']);
    }
  },
  
  /**
   * Send a message to the HubSpot chatbot
   * @param message The message to send
   */
  sendMessage: (message: string) => {
    if (typeof window !== 'undefined' && (window as any)._hsq && message) {
      (window as any)._hsq.push(['chatbot:send', message]);
    }
  },
  
  /**
   * Set context for the chatbot
   * This can be used to provide additional context about the user or their situation
   * @param context Additional context information
   */
  setContext: (context: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any)._hsq) {
      (window as any)._hsq.push(['chatbot:context', context]);
    }
  },
  
  /**
   * Reset the chatbot conversation
   */
  resetConversation: () => {
    if (typeof window !== 'undefined' && (window as any)._hsq) {
      (window as any)._hsq.push(['chatbot:reset']);
    }
  }
};