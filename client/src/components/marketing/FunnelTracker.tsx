import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

/**
 * Represents a step in a marketing funnel
 */
export interface FunnelStep {
  name: string;
  number: number;
  description?: string;
}

/**
 * Standard marketing funnel steps with their corresponding numbers and descriptions
 */
export const FUNNEL_STEPS = {
  AWARENESS: {
    name: 'awareness',
    number: 1,
    description: 'Initial discovery of the product/service',
  },
  INTEREST: {
    name: 'interest',
    number: 2,
    description: 'Engagement with content and learning more',
  },
  CONSIDERATION: {
    name: 'consideration',
    number: 3,
    description: 'Evaluating the offering as a potential solution',
  },
  INTENT: {
    name: 'intent',
    number: 4,
    description: 'Taking steps toward conversion',
  },
  CONVERSION: {
    name: 'conversion',
    number: 5,
    description: 'Completing the desired action (purchase, signup, etc.)',
  },
  RETENTION: {
    name: 'retention',
    number: 6,
    description: 'Ongoing engagement and loyalty',
  },
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
  
  const trackEvent = useCallback(async () => {
    try {
      await apiRequest('POST', '/api/marketing/track-event', {
        funnelName,
        eventName,
        stepName,
        stepNumber,
        metadata,
        path: window.location.pathname,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to track funnel event:', error);
    }
  }, [funnelName, eventName, stepName, stepNumber, metadata]);

  useEffect(() => {
    if (trackOnMount) {
      trackEvent();
    }
  }, [trackOnMount, trackEvent]);

  return null; // This component doesn't render anything
}

/**
 * A hook that returns a function to track marketing funnel events
 * @param funnelName The name of the marketing funnel
 */
export function useFunnelTracker(funnelName: string) {
  return useCallback(
    async (
      eventName: string,
      metadata: Record<string, any> = {},
      step: FunnelStep = FUNNEL_STEPS.AWARENESS
    ) => {
      try {
        await apiRequest('POST', '/api/marketing/track-event', {
          funnelName,
          eventName,
          stepName: step.name,
          stepNumber: step.number,
          metadata,
          path: window.location.pathname,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        console.error('Failed to track funnel event:', error);
      }
    },
    [funnelName]
  );
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
  const trackFunnelEvent = useFunnelTracker(funnelName);

  useEffect(() => {
    const eventName = pageName || `page_view_${location.replace(/\//g, '_')}`;
    
    trackFunnelEvent(
      eventName,
      {
        path: location,
        title: document.title,
      },
      stepInfo
    );

    // Also track time spent on page when the user leaves
    const startTime = new Date();

    return () => {
      const endTime = new Date();
      const timeSpentMs = endTime.getTime() - startTime.getTime();
      
      trackFunnelEvent(
        `${eventName}_exit`,
        {
          path: location,
          title: document.title,
          timeSpentMs,
          timeSpentSeconds: Math.round(timeSpentMs / 1000),
        },
        stepInfo
      );
    };
  }, [location, funnelName, pageName, trackFunnelEvent, stepInfo]);
}

/**
 * Helper component to track conversion events in a marketing funnel
 */
export function FunnelConversion({
  funnelName,
  conversionType,
  conversionValue,
  metadata = {},
}: {
  funnelName: string;
  conversionType: string;
  conversionValue?: number;
  metadata?: Record<string, any>;
}) {
  const trackFunnelEvent = useFunnelTracker(funnelName);

  useEffect(() => {
    trackFunnelEvent(
      `conversion_${conversionType}`,
      {
        ...metadata,
        value: conversionValue,
      },
      FUNNEL_STEPS.CONVERSION
    );
  }, [funnelName, conversionType, conversionValue, metadata, trackFunnelEvent]);

  return null;
}