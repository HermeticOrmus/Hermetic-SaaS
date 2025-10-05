/**
 * CheckoutButton Component
 *
 * One-click checkout for Stripe payments
 */

'use client';

import React, { useState } from 'react';

interface CheckoutButtonProps {
  priceId: string;
  mode?: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  trialPeriodDays?: number;
  couponCode?: string;
  metadata?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  priceId,
  mode = 'subscription',
  successUrl = '/success',
  cancelUrl = '/pricing',
  trialPeriodDays,
  couponCode,
  metadata,
  className = '',
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode,
          successUrl: `${window.location.origin}${successUrl}`,
          cancelUrl: `${window.location.origin}${cancelUrl}`,
          trialPeriodDays,
          couponCode,
          metadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        }
      >
        {loading ? 'Loading...' : children}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
