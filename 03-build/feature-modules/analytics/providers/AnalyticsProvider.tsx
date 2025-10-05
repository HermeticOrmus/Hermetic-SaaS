/**
 * Analytics Provider
 *
 * Global analytics context and event batching
 */

'use client';

import React, { createContext, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AnalyticsContextType, AnalyticsEvent } from '../types';

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  batchSize?: number;
  batchInterval?: number;
  disabled?: boolean;
}

export function AnalyticsProvider({
  children,
  batchSize = 10,
  batchInterval = 5000,
  disabled = false,
}: AnalyticsProviderProps) {
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const sessionId = useRef<string>(uuidv4());
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Flush events to server
   */
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const eventsToSend = [...eventQueue.current];
    eventQueue.current = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue failed events
      eventQueue.current = [...eventsToSend, ...eventQueue.current];
    }
  }, []);

  /**
   * Queue event for sending
   */
  const queueEvent = useCallback(
    (event: AnalyticsEvent) => {
      if (disabled) return;

      eventQueue.current.push({
        ...event,
        sessionId: sessionId.current,
        createdAt: new Date(),
      });

      // Flush if batch size reached
      if (eventQueue.current.length >= batchSize) {
        flushEvents();
      }
    },
    [disabled, batchSize, flushEvents]
  );

  /**
   * Track custom event
   */
  const track = useCallback(
    (eventType: string, properties?: Record<string, any>) => {
      queueEvent({
        eventType,
        eventProperties: properties,
        pageUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      });
    },
    [queueEvent]
  );

  /**
   * Track page view
   */
  const page = useCallback(
    (pagePath: string, properties?: Record<string, any>) => {
      track('page_view', {
        page: pagePath,
        ...properties,
      });
    },
    [track]
  );

  /**
   * Identify user
   */
  const identify = useCallback(
    (userId: string, properties?: Record<string, any>) => {
      track('user_identified', {
        user_id: userId,
        ...properties,
      });

      // Store user properties separately
      fetch('/api/analytics/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, properties }),
      }).catch((error) => {
        console.error('Failed to identify user:', error);
      });
    },
    [track]
  );

  /**
   * Group users
   */
  const group = useCallback(
    (groupId: string, properties?: Record<string, any>) => {
      track('group_identified', {
        group_id: groupId,
        ...properties,
      });
    },
    [track]
  );

  /**
   * Reset session
   */
  const reset = useCallback(() => {
    sessionId.current = uuidv4();
    eventQueue.current = [];
  }, []);

  /**
   * Set up periodic flushing
   */
  useEffect(() => {
    if (disabled) return;

    flushTimer.current = setInterval(() => {
      flushEvents();
    }, batchInterval);

    return () => {
      if (flushTimer.current) {
        clearInterval(flushTimer.current);
      }
    };
  }, [disabled, batchInterval, flushEvents]);

  /**
   * Flush on page unload
   */
  useEffect(() => {
    if (disabled) return;

    const handleBeforeUnload = () => {
      flushEvents();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [disabled, flushEvents]);

  /**
   * Track initial page view
   */
  useEffect(() => {
    if (!disabled) {
      page(window.location.pathname);
    }
  }, [disabled, page]);

  const value: AnalyticsContextType = {
    track,
    page,
    identify,
    group,
    reset,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
