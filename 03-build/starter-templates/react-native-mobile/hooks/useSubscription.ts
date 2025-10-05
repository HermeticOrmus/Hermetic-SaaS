/**
 * Subscription Hook
 *
 * Hermetic Principle: Functional
 * - Manages subscription state
 * - Provides purchase methods
 */

import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '@/services/purchases';

interface SubscriptionState {
  isPro: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;
  loading: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isPro: false,
    expirationDate: null,
    willRenew: false,
    productIdentifier: null,
    loading: true,
  });

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const status = await getSubscriptionStatus();
    setState({
      ...status,
      loading: false,
    });
  }

  return {
    ...state,
    refresh: checkStatus,
  };
}
