import React, { createContext, useContext, ReactNode } from 'react';
import { useLeadCapture } from '@/hooks/use-lead-capture';
import LeadCaptureBanner from './LeadCaptureBanner';
import TimedLeadPopup from './TimedLeadPopup';
import ExitIntentPopup from './ExitIntentPopup';

// Create context for the lead capture system
type LeadCaptureContextType = ReturnType<typeof useLeadCapture>;

const LeadCaptureContext = createContext<LeadCaptureContextType | null>(null);

// Hook to access the lead capture context
export const useLeadCaptureContext = () => {
  const context = useContext(LeadCaptureContext);
  if (!context) {
    throw new Error('useLeadCaptureContext must be used within a LeadCaptureProvider');
  }
  return context;
};

interface LeadCaptureProviderProps {
  children: ReactNode;
  initialConfig?: Parameters<typeof useLeadCapture>[0];
}

export function LeadCaptureProvider({ 
  children, 
  initialConfig 
}: LeadCaptureProviderProps) {
  const leadCaptureState = useLeadCapture(initialConfig);
  const { config } = leadCaptureState;

  // Render the appropriate lead capture component based on the current config
  const renderLeadCaptureComponent = () => {
    switch (config.type) {
      case 'banner':
        return (
          <LeadCaptureBanner
            resourceName={config.resourceName}
            headline={config.description}
            delay={config.delay}
            persistenceKey={config.persistenceKey}
          />
        );
      case 'popup':
        return (
          <TimedLeadPopup
            resourceName={config.resourceName}
            title={config.title}
            description={config.description}
            delay={config.delay}
            pageViewThreshold={config.pageViewThreshold}
            persistenceKey={config.persistenceKey}
          />
        );
      case 'exit_intent':
        return (
          <ExitIntentPopup
            resourceName={config.resourceName}
            title={config.title}
            description={config.description}
            delay={config.delay}
            persistenceKey={config.persistenceKey}
          />
        );
      case 'none':
      default:
        return null;
    }
  };

  return (
    <LeadCaptureContext.Provider value={leadCaptureState}>
      {children}
      {renderLeadCaptureComponent()}
    </LeadCaptureContext.Provider>
  );
}