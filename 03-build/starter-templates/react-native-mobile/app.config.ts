import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_APP_NAME || 'HermeticSaaS Mobile',
  slug: 'hermetic-saas-mobile',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME || 'hermetic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.hermetic.saas',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera for profile photos.',
      NSPhotoLibraryUsageDescription:
        'This app accesses your photos for profile pictures.',
      NSUserTrackingUsageDescription:
        'This app uses tracking to provide personalized content and measure advertising effectiveness.',
    },
    config: {
      usesNonExemptEncryption: false,
    },
    associatedDomains: [
      `applinks:${process.env.EXPO_PUBLIC_DEEP_LINK_DOMAIN || 'your-domain.com'}`,
    ],
  },
  android: {
    package: 'com.hermetic.saas',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'NOTIFICATIONS',
    ],
    googleServicesFile: './google-services.json',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: process.env.EXPO_PUBLIC_DEEP_LINK_DOMAIN || 'your-domain.com',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
        sounds: ['./assets/notification-sound.wav'],
      },
    ],
    'expo-secure-store',
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-eas-project-id',
    },
  },
  updates: {
    url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-eas-project-id'}`,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
