import { useState, useEffect } from 'react';

export type LeadCaptureType = 'banner' | 'popup' | 'exit_intent' | 'none';

interface LeadCaptureConfig {
  type: LeadCaptureType;
  resourceName: string;
  title: string;
  description: string;
  delay?: number;
  pageViewThreshold?: number;
  persistenceKey?: string;
}

const DEFAULT_CONFIG: LeadCaptureConfig = {
  type: 'none',
  resourceName: 'Legal Letter Template',
  title: 'Get Your Free Legal Template',
  description: 'Enter your email to receive this free resource instantly.',
  delay: 30000, // 30 seconds
  pageViewThreshold: 2,
  persistenceKey: 'smartdispute_lead_capture'
};

export function useLeadCapture(config: Partial<LeadCaptureConfig> = {}) {
  const [activeConfig, setActiveConfig] = useState<LeadCaptureConfig>({
    ...DEFAULT_CONFIG,
    ...config
  });

  // Utility function to check if user is authenticated
  const isUserAuthenticated = (): boolean => {
    // This is a simple check - use your auth mechanism here
    return !!localStorage.getItem('isAuthenticated');
  };

  // Don't show lead capture components to logged-in users
  useEffect(() => {
    if (isUserAuthenticated()) {
      setActiveConfig(prev => ({ ...prev, type: 'none' }));
    }
  }, []);

  // Method to manually change the configuration
  const setLeadCaptureConfig = (newConfig: Partial<LeadCaptureConfig>) => {
    setActiveConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Method to manually set the lead capture type
  const setLeadCaptureType = (type: LeadCaptureType) => {
    setActiveConfig(prev => ({ ...prev, type }));
  };

  // Method to manually hide all lead capture elements
  const hideLeadCapture = () => {
    setActiveConfig(prev => ({ ...prev, type: 'none' }));
  };

  // Method to mark a specific lead capture component as viewed
  const markAsViewed = (key: string = activeConfig.persistenceKey || '') => {
    if (key) {
      localStorage.setItem(key, 'true');
    }
  };

  return {
    config: activeConfig,
    setConfig: setLeadCaptureConfig,
    setType: setLeadCaptureType,
    hide: hideLeadCapture,
    markAsViewed
  };
}