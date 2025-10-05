/**
 * Entry Point
 *
 * Hermetic Principle: Functional
 * - Routes to correct screen based on auth state
 */

import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on auth state
  if (user) {
    return <Redirect href="/(auth)/home" />;
  }

  return <Redirect href="/login" />;
}
