/**
 * Root Layout
 *
 * Hermetic Principle: Formless
 * - Adapts to authentication state
 * - Handles global providers
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export default function RootLayout() {
  const { user } = useAuth();
  useNotifications();

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Modal',
          }}
        />
      </Stack>
    </>
  );
}
