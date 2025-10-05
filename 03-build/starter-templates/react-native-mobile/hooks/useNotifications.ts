/**
 * Notifications Hook
 *
 * Hermetic Principle: Functional
 * - Handles notification lifecycle
 * - Navigation integration
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { registerForPushNotifications } from '@/services/notifications';

export function useNotifications() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();

  useEffect(() => {
    // Register for notifications
    registerForPushNotifications();

    // Handle foreground notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

    // Handle notification taps
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;

        // Navigate based on notification data
        if (data?.screen) {
          router.push(data.screen as any);
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
