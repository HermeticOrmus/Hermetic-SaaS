/**
 * Authentication Provider
 *
 * Manages global auth state and provides auth context to the app
 */

'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  AuthContextType,
  User,
  Profile,
  OAuthProvider,
  AuthState,
} from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  /**
   * Initialize auth state
   */
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted) {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setState({
              user: session.user as User,
              profile,
              loading: false,
              error: null,
            });
          } else {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: { message: 'Failed to initialize auth' },
          });
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  /**
   * Listen for auth state changes
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user as User,
            profile,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;
      } catch (error: any) {
        console.error('Sign up error:', error);
        throw new Error(error.message || 'Failed to sign up');
      }
    },
    []
  );

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with OAuth');
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }, []);

  /**
   * Request password reset email
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }, []);

  /**
   * Update user password
   */
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!state.user) throw new Error('No user logged in');

      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.user.id);

        if (error) throw error;

        // Refetch profile
        const profile = await fetchProfile(state.user.id);
        setState(prev => ({ ...prev, profile }));
      } catch (error: any) {
        console.error('Update profile error:', error);
        throw new Error(error.message || 'Failed to update profile');
      }
    },
    [state.user, fetchProfile]
  );

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error: any) {
      console.error('Refresh session error:', error);
      throw new Error(error.message || 'Failed to refresh session');
    }
  }, []);

  const value: AuthContextType = {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
