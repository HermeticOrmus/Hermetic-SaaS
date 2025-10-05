/**
 * Server-side Authentication Utilities
 *
 * Helper functions for checking auth in API routes and server components
 */

import { createServerClient } from '../lib/supabase';
import type { User } from '../types/auth';

/**
 * Check authentication in API routes (Next.js App Router)
 */
export async function checkAuth(request: Request): Promise<User | null> {
  const supabase = createServerClient();

  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user as User;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(request: Request): Promise<User> {
  const user = await checkAuth(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  request: Request,
  role: string
): Promise<boolean> {
  const user = await checkAuth(request);
  if (!user) return false;

  // Implement your role checking logic here
  // This is a placeholder - adjust based on your role system
  const userRole = user.user_metadata?.role || 'user';
  return userRole === role;
}

/**
 * Require specific role
 */
export async function requireRole(request: Request, role: string): Promise<User> {
  const user = await requireAuth(request);
  const hasRequiredRole = await hasRole(request, role);

  if (!hasRequiredRole) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}
