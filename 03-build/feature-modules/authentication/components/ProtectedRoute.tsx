/**
 * ProtectedRoute Component
 *
 * Wrapper component that protects routes from unauthenticated access
 */

'use client';

import React from 'react';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmailVerified?: boolean;
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireEmailVerified = false,
  loadingComponent = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { user, loading } = useProtectedRoute({
    redirectTo,
    requireEmailVerified,
  });

  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (!user) {
    return null;
  }

  if (requireEmailVerified && !user.email_confirmed_at) {
    return null;
  }

  return <>{children}</>;
}
