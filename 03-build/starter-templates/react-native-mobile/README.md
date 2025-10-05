# HermeticSaaS React Native Mobile Starter Template

A production-ready React Native mobile app starter template built on Hermetic principles - Functional, Formless, Accurate, Divine, Elegant, No Schemes.

## Philosophy

This template embodies the HermeticSaaS framework:
- **Functional**: Everything serves a purpose. No bloat, only essential features.
- **Formless**: Adapts to your vision. Easy to customize and extend.
- **Accurate**: Type-safe, tested, production-ready code.
- **Divine**: Exceptional user experience, elegant architecture.
- **Elegant**: Clean code, clear patterns, simple to understand.
- **No Schemes**: Transparent pricing (RevenueCat), honest metrics, ethical growth.

## Features

- **React Native + Expo Router** - Modern, file-based routing
- **TypeScript** - Full type safety and IntelliSense
- **Supabase Auth** - Email/password + OAuth (Google, Apple)
- **Tab Navigation** - React Navigation with bottom tabs
- **Push Notifications** - Expo Notifications ready
- **In-App Purchases** - RevenueCat integration
- **Analytics Ready** - Mixpanel/Amplitude integration points
- **NativeWind** - Tailwind CSS for React Native
- **State Management** - Zustand for simple, fast state
- **Secure Storage** - expo-secure-store for sensitive data
- **Deep Linking** - Universal links configured
- **EAS Build & Submit** - Ready for App Store & Play Store

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio with SDK

### Installation

```bash
# Clone the template
cd /path/to/your/project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials
# Get these from: https://supabase.com/dashboard/project/_/settings/api

# Start development server
npx expo start
```

### Run on Device

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Expo Go App (scan QR code)
npm start
```

## Project Structure

```
hermetic-saas-mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth-protected routes
│   │   ├── _layout.tsx           # Tab navigation layout
│   │   ├── home.tsx              # Home screen
│   │   ├── profile.tsx           # Profile screen
│   │   └── settings.tsx          # Settings screen
│   ├── (public)/                 # Public routes
│   │   ├── login.tsx             # Login screen
│   │   ├── signup.tsx            # Signup screen
│   │   └── forgot-password.tsx   # Password reset
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
│
├── components/                   # Reusable components
│   ├── ui/                       # UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/
│   │   ├── AuthGuard.tsx         # Route protection
│   │   └── SocialAuthButtons.tsx # OAuth buttons
│   └── layout/
│       ├── Screen.tsx            # Screen wrapper
│       └── Header.tsx
│
├── services/                     # External integrations
│   ├── supabase.ts               # Supabase client
│   ├── notifications.ts          # Push notifications
│   ├── analytics.ts              # Analytics service
│   └── purchases.ts              # RevenueCat
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts                # Authentication
│   ├── useSubscription.ts        # Subscription status
│   ├── useAnalytics.ts           # Analytics tracking
│   └── useNotifications.ts       # Push notifications
│
├── store/                        # Zustand state
│   ├── authStore.ts              # Auth state
│   ├── userStore.ts              # User data
│   └── appStore.ts               # App settings
│
├── utils/                        # Utilities
│   ├── constants.ts              # App constants
│   ├── validation.ts             # Zod schemas
│   └── helpers.ts                # Helper functions
│
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── user.ts
│   └── subscription.ts
│
├── config/                       # Configuration
│   ├── env.ts                    # Environment variables
│   └── theme.ts                  # NativeWind theme
│
└── assets/                       # Static assets
    ├── fonts/
    └── images/
```

## Authentication Flow

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Enable Email authentication in Authentication > Providers
3. Configure OAuth providers (Google, Apple)
4. Copy your project URL and anon key to `.env`

### Email Authentication

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();
```

### OAuth Authentication

```typescript
// Google OAuth
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: AuthSession.makeRedirectUri({
      scheme: 'hermetic',
    }),
  },
});

// Open browser for OAuth
if (data?.url) {
  await WebBrowser.openAuthSessionAsync(data.url);
}
```

### Protected Routes

```typescript
// app/(auth)/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Redirect href="/login" />;

  return <TabNavigator />;
}
```

## Navigation Setup

### Tab Navigator

```typescript
// app/(auth)/_layout.tsx
import { Tabs } from 'expo-router';
import { HomeIcon, ProfileIcon, SettingsIcon } from '@/components/icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Stack Navigation

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(public)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}
```

## Push Notifications

### Setup

```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    alert('Push notifications only work on physical devices');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-eas-project-id',
  });

  // Save token to Supabase
  await saveTokenToDatabase(token.data);

  return token.data;
}

// Send local notification
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { screen: 'home' },
    },
    trigger: null, // Send immediately
  });
}
```

### Handle Notifications

```typescript
// hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export function useNotifications() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();

  useEffect(() => {
    // Handle foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received:', notification);
      }
    );

    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        const screen = response.notification.request.content.data.screen;
        if (screen) {
          router.push(screen as any);
        }
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
```

## In-App Purchases (RevenueCat)

### Setup

1. Create RevenueCat account: https://www.revenuecat.com
2. Configure products in RevenueCat dashboard
3. Add API keys to `.env`

### Implementation

```typescript
// services/purchases.ts
import Purchases, { PurchasesPackage } from 'react-native-revenuecat';
import { Platform } from 'react-native';

// Initialize RevenueCat
export async function initializePurchases(userId: string) {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!,
  });

  await Purchases.configure({ apiKey, appUserID: userId });
}

// Get available packages
export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return [];
  }
}

// Purchase a package
export async function purchasePackage(pkg: PurchasesPackage) {
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(pkg);

    // Check if user now has access
    const isPro = customerInfo.entitlements.active['pro'] !== undefined;

    return { success: true, isPro, productIdentifier };
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Purchase error:', error);
    }
    return { success: false, isPro: false };
  }
}

// Restore purchases
export async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active['pro'] !== undefined;
    return { success: true, isPro };
  } catch (error) {
    console.error('Restore error:', error);
    return { success: false, isPro: false };
  }
}

// Check subscription status
export async function getSubscriptionStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = customerInfo.entitlements.active['pro'] !== undefined;
    const expirationDate = customerInfo.entitlements.active['pro']?.expirationDate;

    return { isPro, expirationDate };
  } catch (error) {
    console.error('Status check error:', error);
    return { isPro: false, expirationDate: null };
  }
}
```

### Usage in Components

```typescript
// hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '@/services/purchases';

export function useSubscription() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const { isPro } = await getSubscriptionStatus();
    setIsPro(isPro);
    setLoading(false);
  }

  return { isPro, loading, refresh: checkStatus };
}
```

## Analytics Integration

### Setup

```typescript
// services/analytics.ts
import { Platform } from 'react-native';

// Mixpanel integration point
let mixpanel: any = null;

export async function initializeAnalytics(userId?: string) {
  if (!process.env.EXPO_PUBLIC_ENABLE_ANALYTICS) return;

  // Initialize Mixpanel
  // const Mixpanel = await import('mixpanel-react-native');
  // mixpanel = await Mixpanel.init(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!);

  if (userId) {
    // mixpanel.identify(userId);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!process.env.EXPO_PUBLIC_ENABLE_ANALYTICS) return;

  console.log('[Analytics]', eventName, properties);
  // mixpanel?.track(eventName, properties);
}

export function trackScreen(screenName: string) {
  trackEvent('Screen View', { screen: screenName });
}

export function setUserProperties(properties: Record<string, any>) {
  if (!process.env.EXPO_PUBLIC_ENABLE_ANALYTICS) return;

  // mixpanel?.getPeople().set(properties);
}
```

### Usage

```typescript
// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { trackScreen, trackEvent } from '@/services/analytics';

export function useAnalytics(screenName: string) {
  useEffect(() => {
    trackScreen(screenName);
  }, [screenName]);

  return { trackEvent };
}

// In components
function HomeScreen() {
  const { trackEvent } = useAnalytics('Home');

  const handleButtonPress = () => {
    trackEvent('Button Pressed', { button: 'CTA' });
    // ... handle action
  };

  return <Button onPress={handleButtonPress}>Click Me</Button>;
}
```

## Styling with NativeWind

### Setup

```typescript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
};
```

### Usage

```typescript
// components/ui/Button.tsx
import { Text, Pressable } from 'react-native';
import { styled } from 'nativewind';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled
}: ButtonProps) {
  return (
    <StyledPressable
      className={`
        px-6 py-3 rounded-lg
        ${variant === 'primary' ? 'bg-primary' : ''}
        ${variant === 'secondary' ? 'bg-secondary' : ''}
        ${variant === 'outline' ? 'border-2 border-primary' : ''}
        ${disabled ? 'opacity-50' : ''}
      `}
      onPress={onPress}
      disabled={disabled}
    >
      <StyledText
        className={`
          text-center font-semibold
          ${variant === 'outline' ? 'text-primary' : 'text-white'}
        `}
      >
        {title}
      </StyledText>
    </StyledPressable>
  );
}
```

## Deployment

### EAS Build Setup

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Create development build
eas build --profile development --platform all

# Create production build
eas build --profile production --platform all
```

### eas.json Configuration

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  }
}
```

### iOS Deployment

1. **App Store Connect Setup**
   - Create app in App Store Connect
   - Configure app information, screenshots, description
   - Set up App Store pricing

2. **Build for Production**
```bash
eas build --platform ios --profile production
```

3. **Submit to App Store**
```bash
eas submit --platform ios
```

### Android Deployment

1. **Google Play Console Setup**
   - Create app in Google Play Console
   - Configure store listing, content rating
   - Set up pricing and distribution

2. **Generate Service Account Key**
   - Follow: https://docs.expo.dev/submit/android/

3. **Build for Production**
```bash
eas build --platform android --profile production
```

4. **Submit to Play Store**
```bash
eas submit --platform android
```

## Testing

### Unit Tests

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

```typescript
// config/env.ts
export const ENV = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  revenueCatApiKey: Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!,
  }),
  enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  apiUrl: process.env.EXPO_PUBLIC_API_URL!,
};
```

## Hermetic Principles in Action

### Functional
- Every component serves a clear purpose
- No unused dependencies or code
- Feature flags for optional integrations
- Dead code elimination in production builds

### Formless
- Modular architecture - swap services easily
- TypeScript interfaces for flexibility
- Environment-driven configuration
- Extensible hooks and utilities

### Accurate
- Full TypeScript coverage
- Zod validation for runtime safety
- Error boundaries for graceful failures
- Type-safe routing with Expo Router

### Divine
- Smooth animations with Reanimated
- Haptic feedback for interactions
- Optimistic UI updates
- Offline-first architecture ready

### Elegant
- Clean component structure
- Consistent naming conventions
- Self-documenting code
- Minimal prop drilling with Zustand

### No Schemes
- Transparent RevenueCat integration
- Honest analytics (track what matters)
- Clear error messages
- No dark patterns

## Best Practices

### Performance
- Use `React.memo` for expensive components
- Implement `FlatList` for long lists
- Lazy load screens with dynamic imports
- Optimize images with `expo-image`
- Use `InteractionManager` for deferred work

### Security
- Store sensitive data in `expo-secure-store`
- Validate all user input with Zod
- Use HTTPS for all API calls
- Implement certificate pinning for production
- Enable App Transport Security (iOS)

### User Experience
- Add loading states for all async operations
- Implement pull-to-refresh where appropriate
- Show error messages with recovery actions
- Use skeleton screens for content loading
- Add haptic feedback for important actions

### Code Quality
- Follow React Native best practices
- Use ESLint and Prettier consistently
- Write meaningful commit messages
- Document complex logic
- Keep components under 200 lines

## Common Issues & Solutions

### Build Errors

**Issue**: `Metro bundler won't start`
```bash
# Clear cache
npx expo start -c
```

**Issue**: `iOS pod install fails`
```bash
cd ios && pod install --repo-update && cd ..
```

### Runtime Errors

**Issue**: `Supabase session not persisting`
- Ensure AsyncStorage is properly configured
- Check that autoRefreshToken is enabled
- Verify redirect URLs match in Supabase dashboard

**Issue**: `Push notifications not working`
- Confirm physical device (not simulator)
- Check notification permissions
- Verify EAS project ID in app.json

### Development Tips

- Use `console.log` sparingly - prefer `__DEV__` checks
- Test on both iOS and Android regularly
- Use TypeScript strict mode from day one
- Keep dependencies updated monthly
- Monitor bundle size with `npx expo export --dump-sourcemap`

## Resources

### Documentation
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [RevenueCat Docs](https://www.revenuecat.com/docs)
- [NativeWind Docs](https://www.nativewind.dev)

### Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Discord](https://discord.gg/react-native)
- [Supabase Discord](https://discord.supabase.com)

### Tools
- [EAS Build Dashboard](https://expo.dev)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

## License

MIT - Use this template to build your MicroSaaS and ship fast!

## Support

For issues or questions:
1. Check the documentation above
2. Search existing issues in the repo
3. Create a new issue with details
4. Join the HermeticSaaS community

---

Built with the HermeticSaaS framework - Ship faster, grow smarter, stay lean.
