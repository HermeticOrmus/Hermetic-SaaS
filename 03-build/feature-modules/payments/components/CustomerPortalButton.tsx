/**
 * CustomerPortalButton Component
 *
 * Opens Stripe Customer Portal for self-service billing
 */

'use client';

import React, { useState } from 'react';

interface CustomerPortalButtonProps {
  returnUrl?: string;
  className?: string;
  children: React.ReactNode;
}

export function CustomerPortalButton({
  returnUrl = '/settings',
  className = '',
  children,
}: CustomerPortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenPortal = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}${returnUrl}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create portal session');
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
        onClick={handleOpenPortal}
        disabled={loading}
        className={
          className ||
          'px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
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
