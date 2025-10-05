/**
 * Analytics Hook
 *
 * Hermetic Principle: No Schemes
 * - Track user interactions ethically
 * - Easy to use in components
 */

import { useEffect, useCallback } from 'react';
import { trackScreen, trackEvent } from '@/services/analytics';

export function useAnalytics(screenName: string) {
  useEffect(() => {
    trackScreen(screenName);
  }, [screenName]);

  const track = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      trackEvent(eventName, {
        screen: screenName,
        ...properties,
      });
    },
    [screenName]
  );

  return { trackEvent: track };
}
