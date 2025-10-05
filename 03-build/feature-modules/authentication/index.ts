/**
 * Authentication Module - Export Index
 *
 * Import everything you need from a single entry point
 */

// Providers
export { AuthProvider } from './providers/AuthProvider';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useProtectedRoute } from './hooks/useProtectedRoute';

// Components
export { ProtectedRoute } from './components/ProtectedRoute';
export { SignInForm } from './components/SignInForm';
export { SignUpForm } from './components/SignUpForm';
export { PasswordResetForm } from './components/PasswordResetForm';

// Utils
export { checkAuth, requireAuth, hasRole, requireRole } from './utils/checkAuth';

// Lib
export { supabase, createServerClient, getSession, getUser, isAuthenticated } from './lib/supabase';

// Types
export type {
  User,
  Profile,
  AuthContextType,
  OAuthProvider,
  SignInCredentials,
  SignUpCredentials,
  AuthError,
  AuthState,
} from './types/auth';

export type { Database } from './types/database';
