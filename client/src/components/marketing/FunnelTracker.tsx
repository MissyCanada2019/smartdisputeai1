import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

/**
 * Represents a step in a marketing funnel
 */
export interface FunnelStep {
  name: string;
  number: number;
  description: string;
}

/**
 * Standard marketing funnel steps with their corresponding numbers and descriptions
 */
export const FUNNEL_STEPS = {
  AWARENESS: {
    name: 'awareness',
    number: 1,
    description: 'First exposure to product or brand'
  },
  INTEREST: {
    name: 'interest',
    number: 2,
    description: 'Engaged with content or requested more information'
  },
  CONSIDERATION: {
    name: 'consideration',
    number: 3,
    description: 'Evaluating product or service for purchase'
  },
  INTENT: {
    name: 'intent',
    number: 4,
    description: 'Demonstrated intention to purchase'
  },
  CONVERSION: {
    name: 'conversion',
    number: 5,
    description: 'Completed purchase or desired action'
  },
  RETENTION: {
    name: 'retention',
    number: 6,
    description: 'Ongoing engagement after conversion'
  }
};

interface FunnelTrackerProps {
  funnelName: string;
  eventName: string;
  stepName: string;
  stepNumber: number;
  metadata?: Record<string, any>;
  trackOnMount?: boolean;
}

/**
 * A component that tracks marketing funnel events
 * @param funnelName The name of the marketing funnel
 * @param eventName The name of the event to track
 * @param stepName The name of the funnel step (e.g., 'awareness', 'consideration')
 * @param stepNumber The number of the funnel step (e.g., 1, 2, 3)
 * @param metadata Additional metadata to store with the event
 * @param trackOnMount Whether to track the event when the component mounts (default: true)
 */
export function FunnelTracker({ 
  funnelName,
  eventName,
  stepName,
  stepNumber,
  metadata = {},
  trackOnMount = true
}: FunnelTrackerProps) {
  useEffect(() => {
    if (trackOnMount) {
      trackFunnelEvent(funnelName, eventName, metadata, {
        name: stepName,
        number: stepNumber,
        description: `Custom step: ${stepName}`
      });
    }
  }, [funnelName, eventName, stepName, stepNumber, metadata, trackOnMount]);
  
  return null; // This component doesn't render anything
}

/**
 * Track a marketing funnel event
 * @param funnelName The name of the marketing funnel
 * @param eventName The name of the event to track
 * @param metadata Additional metadata to store with the event
 * @param step The funnel step information
 */
export async function trackFunnelEvent(
  funnelName: string,
  eventName: string,
  metadata: Record<string, any> = {},
  step: FunnelStep = FUNNEL_STEPS.AWARENESS
): Promise<void> {
  try {
    // Get current URL path
    const path = typeof window !== 'undefined' ? window.location.pathname : null;
    
    // Get referrer if available
    const referrer = typeof document !== 'undefined' ? document.referrer : null;
    
    // Get user agent
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    
    const eventData = {
      funnelName,
      eventName,
      stepName: step.name,
      stepNumber: step.number,
      path,
      metadata,
      referrer,
      userAgent
    };
    
    await apiRequest('POST', '/api/marketing/track-event', eventData);
    
  } catch (error) {
    console.error('Error tracking funnel event:', error);
  }
}

/**
 * A hook that returns a function to track marketing funnel events
 * @param funnelName The name of the marketing funnel
 */
export function useFunnelTracker(funnelName: string) {
  return async (
    eventName: string,
    metadata: Record<string, any> = {},
    step: FunnelStep = FUNNEL_STEPS.AWARENESS
  ) => {
    return trackFunnelEvent(funnelName, eventName, metadata, step);
  };
}

/**
 * Custom hook to track page views in a marketing funnel
 * @param funnelName The name of the marketing funnel
 * @param pageName Optional name for the page view event (defaults to the pathname)
 * @param stepInfo The funnel step info (defaults to AWARENESS)
 */
export function usePageViewTracker(
  funnelName: string,
  pageName?: string,
  stepInfo: FunnelStep = FUNNEL_STEPS.AWARENESS
) {
  const [location] = useLocation();
  
  useEffect(() => {
    const track = async () => {
      // Use provided page name or extract from pathname
      const eventName = pageName || `page_view_${location.replace(/\//g, '_')}`;
      
      await trackFunnelEvent(
        funnelName,
        eventName,
        { path: location },
        stepInfo
      );
    };
    
    track();
  }, [funnelName, location, pageName, stepInfo]);
}

interface FunnelConversionProps {
  funnelName: string;
  conversionType: string;
  value?: number;
  metadata?: Record<string, any>;
  children?: ReactNode;
}

/**
 * Helper component to track conversion events in a marketing funnel
 */
export function FunnelConversion({
  funnelName,
  conversionType,
  value = 0,
  metadata = {},
  children
}: FunnelConversionProps) {
  const handleConversion = async () => {
    await trackFunnelEvent(
      funnelName,
      `conversion_${conversionType}`,
      {
        ...metadata,
        conversionValue: value
      },
      FUNNEL_STEPS.CONVERSION
    );
  };
  
  // If children exist, clone them and add the onClick handler
  if (children) {
    const child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(child, {
      onClick: async (e: React.MouseEvent) => {
        // Call the original onClick if it exists
        if (child.props.onClick) {
          child.props.onClick(e);
        }
        // Track the conversion
        await handleConversion();
      }
    });
  }
  
  // If no children, return null (invisible component)
  return null;
}