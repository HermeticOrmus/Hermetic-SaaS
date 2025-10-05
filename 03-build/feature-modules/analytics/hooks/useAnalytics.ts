/**
 * useAnalytics Hook
 *
 * Access analytics context
 */

'use client';

import { useContext } from 'react';
import { AnalyticsContext } from '../providers/AnalyticsProvider';

export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}
