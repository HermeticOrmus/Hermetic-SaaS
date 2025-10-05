/**
 * Authentication Type Definitions
 */

import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  // Extended user properties
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export type OAuthProvider =
  | 'google'
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'azure'
  | 'facebook'
  | 'twitter'
  | 'discord'
  | 'slack';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: AuthError | null;
}
