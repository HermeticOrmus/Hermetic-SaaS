/**
 * Environment Configuration
 *
 * Hermetic Principle: Accurate
 * - Type-safe environment variables
 * - Fail fast on missing config
 */

import { Platform } from 'react-native';

function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || '';
}

export const ENV = {
  // App
  appEnv: getEnv('EXPO_PUBLIC_APP_ENV', false) || 'development',
  appName: getEnv('EXPO_PUBLIC_APP_NAME', false) || 'HermeticSaaS',
  appVersion: getEnv('EXPO_PUBLIC_APP_VERSION', false) || '1.0.0',

  // Supabase
  supabase: {
    url: getEnv('EXPO_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  },

  // RevenueCat
  revenueCat: {
    apiKey: Platform.select({
      ios: getEnv('EXPO_PUBLIC_REVENUECAT_API_KEY_IOS', false),
      android: getEnv('EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID', false),
    }),
  },

  // Analytics
  analytics: {
    enabled: getEnv('EXPO_PUBLIC_ENABLE_ANALYTICS', false) === 'true',
    mixpanelToken: getEnv('EXPO_PUBLIC_MIXPANEL_TOKEN', false),
    amplitudeKey: getEnv('EXPO_PUBLIC_AMPLITUDE_API_KEY', false),
  },

  // Features
  features: {
    pushNotifications:
      getEnv('EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS', false) === 'true',
    inAppPurchases:
      getEnv('EXPO_PUBLIC_ENABLE_IN_APP_PURCHASES', false) === 'true',
    biometricAuth:
      getEnv('EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH', false) === 'true',
  },

  // API
  api: {
    url: getEnv('EXPO_PUBLIC_API_URL', false),
    timeout: parseInt(getEnv('EXPO_PUBLIC_API_TIMEOUT', false) || '30000'),
  },

  // Deep Linking
  deepLink: {
    scheme: getEnv('EXPO_PUBLIC_DEEP_LINK_SCHEME', false) || 'hermetic',
    domain: getEnv('EXPO_PUBLIC_DEEP_LINK_DOMAIN', false),
  },
} as const;

// Type-safe environment check
export const isDevelopment = ENV.appEnv === 'development';
export const isProduction = ENV.appEnv === 'production';
export const isStaging = ENV.appEnv === 'staging';
