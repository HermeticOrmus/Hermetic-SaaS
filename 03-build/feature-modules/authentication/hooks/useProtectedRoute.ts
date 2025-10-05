/**
 * useProtectedRoute Hook
 *
 * Automatically redirect unauthenticated users
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requireEmailVerified?: boolean;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { redirectTo = '/login', requireEmailVerified = false } = options;
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (requireEmailVerified && !user.email_confirmed_at) {
        router.push('/verify-email');
      }
    }
  }, [user, loading, router, redirectTo, requireEmailVerified]);

  return { user, loading };
}
