# HermeticSaaS React Native Mobile - Project Index

Complete file structure and quick reference for the mobile app starter template.

## Core Configuration Files

### Package & Dependencies
- **package.json** - All dependencies, scripts, and project metadata
- **tsconfig.json** - TypeScript configuration with path aliases
- **babel.config.js** - Babel config with NativeWind and Reanimated
- **metro.config.js** - Metro bundler configuration
- **tailwind.config.js** - Tailwind CSS / NativeWind theming
- **app.json** - Basic Expo configuration
- **app.config.ts** - Dynamic Expo configuration with env vars

### Build & Deploy
- **eas.json** - EAS Build profiles (dev, preview, production)
- **.env.example** - Environment variables template
- **.gitignore** - Git ignore patterns

### Testing & Quality
- **jest.config.js** - Jest test configuration
- **jest.setup.js** - Jest setup with mocks
- **.eslintrc.js** - ESLint rules for React Native + TypeScript
- **.prettierrc** - Prettier code formatting rules

## Documentation

- **README.md** - Complete setup, usage, and deployment guide
- **QUICKSTART.md** - 5-minute getting started guide
- **ARCHITECTURE.md** - Architecture patterns and best practices
- **PROJECT_INDEX.md** - This file - complete project reference

## Source Code Structure

### `/app` - Screens & Routing
```
app/
├── _layout.tsx              # Root layout with global providers
├── index.tsx                # Entry point with auth routing
├── (auth)/                  # Protected routes
│   ├── _layout.tsx          # Tab navigation
│   ├── home.tsx             # Home screen
│   ├── profile.tsx          # Profile screen
│   └── settings.tsx         # Settings screen
├── (public)/                # Public routes
│   ├── login.tsx            # Login screen
│   ├── signup.tsx           # Sign up screen
│   └── forgot-password.tsx  # Password reset
└── modal.tsx                # Example modal screen
```

### `/components` - UI Components
```
components/
├── ui/                      # Reusable UI primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── LoadingSpinner.tsx
├── auth/
│   ├── AuthGuard.tsx        # Route protection
│   └── SocialAuthButtons.tsx
└── layout/
    ├── Screen.tsx           # Screen wrapper
    └── Header.tsx
```

### `/services` - External Integrations
```
services/
├── supabase.ts              # Supabase client + auth helpers
├── notifications.ts         # Push notifications service
├── analytics.ts             # Analytics tracking (Mixpanel/Amplitude)
└── purchases.ts             # RevenueCat in-app purchases
```

### `/hooks` - Custom Hooks
```
hooks/
├── useAuth.ts               # Authentication state & methods
├── useSubscription.ts       # Subscription status
├── useAnalytics.ts          # Screen tracking & events
└── useNotifications.ts      # Notification handling
```

### `/store` - Global State (Zustand)
```
store/
├── authStore.ts             # Auth state
├── userStore.ts             # User profile data
└── appStore.ts              # App-wide settings
```

### `/utils` - Utilities
```
utils/
├── constants.ts             # App constants
├── validation.ts            # Zod validation schemas
└── helpers.ts               # Helper functions
```

### `/types` - TypeScript Types
```
types/
├── auth.ts                  # Authentication types
├── user.ts                  # User types
└── subscription.ts          # Subscription types
```

### `/config` - Configuration
```
config/
├── env.ts                   # Type-safe environment variables
└── theme.ts                 # Theme configuration
```

## Key Features Implementation

### Authentication (Supabase)
- **File**: `/services/supabase.ts`
- **Hook**: `/hooks/useAuth.ts`
- **Screens**: `/app/(public)/login.tsx`, `signup.tsx`
- Email/password + OAuth (Google, Apple)
- Session persistence with AsyncStorage
- Auto-refresh tokens

### Push Notifications (Expo)
- **File**: `/services/notifications.ts`
- **Hook**: `/hooks/useNotifications.ts`
- Permission handling
- Token registration
- Deep linking support
- Foreground & background handling

### In-App Purchases (RevenueCat)
- **File**: `/services/purchases.ts`
- **Hook**: `/hooks/useSubscription.ts`
- Offering fetching
- Purchase flow
- Restore purchases
- Subscription status

### Analytics
- **File**: `/services/analytics.ts`
- **Hook**: `/hooks/useAnalytics.ts`
- Screen tracking
- Event tracking
- User properties
- Conversion tracking

### Navigation (Expo Router)
- File-based routing
- Type-safe navigation
- Tab navigation in `(auth)/_layout.tsx`
- Stack navigation in `_layout.tsx`
- Modal support

### Styling (NativeWind)
- Tailwind CSS for React Native
- Custom theme in `tailwind.config.js`
- Consistent design system
- Dark mode ready

## Environment Variables

All environment variables are prefixed with `EXPO_PUBLIC_` to be accessible in the app.

### Required
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### Optional (Enable features as needed)
```
# OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID
EXPO_PUBLIC_APPLE_CLIENT_ID

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID

# Analytics
EXPO_PUBLIC_MIXPANEL_TOKEN
EXPO_PUBLIC_AMPLITUDE_API_KEY

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_IN_APP_PURCHASES=true
```

## NPM Scripts

### Development
```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
```

### Quality
```bash
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
npm test               # Run Jest tests
```

### Build & Deploy
```bash
npm run prebuild       # Generate native projects
npm run build:ios      # Build for iOS (EAS)
npm run build:android  # Build for Android (EAS)
npm run submit:ios     # Submit to App Store
npm run submit:android # Submit to Play Store
```

## Development Workflow

### 1. Initial Setup
```bash
npm install
cp .env.example .env
# Configure Supabase credentials
npm start
```

### 2. Development
- Edit files in `/app` for screens
- Add components to `/components`
- Use hooks from `/hooks`
- Services in `/services` for integrations

### 3. Testing
```bash
npm test                # Unit tests
npm run type-check      # Type safety
npm run lint            # Code quality
```

### 4. Build & Deploy
```bash
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

## Path Aliases

Configured in `tsconfig.json` for clean imports:

```typescript
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { ENV } from '@/config/env';
```

## Integration Checklist

### Supabase
- [ ] Create project at supabase.com
- [ ] Enable email auth in dashboard
- [ ] Configure OAuth providers
- [ ] Add credentials to `.env`
- [ ] Test auth flow

### RevenueCat
- [ ] Create account at revenuecat.com
- [ ] Create app in dashboard
- [ ] Configure products
- [ ] Add API keys to `.env`
- [ ] Test purchase flow

### Push Notifications
- [ ] Run `eas build:configure`
- [ ] Generate push credentials
- [ ] Test on physical device
- [ ] Configure deep linking

### App Stores
- [ ] Create App Store Connect app
- [ ] Create Google Play Console app
- [ ] Configure bundle identifiers
- [ ] Upload screenshots & metadata
- [ ] Submit for review

## Hermetic Principles Map

### Functional
- Services with single responsibilities
- Pure utility functions
- Clear separation of concerns

### Formless
- Modular architecture
- Swappable services
- Feature flags for flexibility

### Accurate
- TypeScript everywhere
- Zod validation
- Type-safe routing

### Divine
- Smooth animations (Reanimated ready)
- Optimistic UI updates
- Exceptional UX

### Elegant
- Clean code structure
- Consistent patterns
- Minimal abstractions

### No Schemes
- Transparent pricing (RevenueCat)
- Ethical analytics
- Clear error messages
- No dark patterns

## Quick Reference

### Add a new screen
1. Create file in `/app` (e.g., `/app/about.tsx`)
2. Export default component
3. Access via `router.push('/about')`

### Add a new service
1. Create file in `/services` (e.g., `/services/email.ts`)
2. Export client and helper functions
3. Use in components or hooks

### Add a new hook
1. Create file in `/hooks` (e.g., `/hooks/useFeature.ts`)
2. Export hook function
3. Use in components

### Add global state
1. Create store in `/store` (e.g., `/store/featureStore.ts`)
2. Use `create()` from zustand
3. Use in components with `useFeatureStore()`

## Support Resources

- **Expo Docs**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **RevenueCat Docs**: https://www.revenuecat.com/docs
- **React Navigation**: https://reactnavigation.org
- **NativeWind**: https://www.nativewind.dev

## Common Tasks

### Update app name
- Edit `app.json` or `app.config.ts`
- Update `EXPO_PUBLIC_APP_NAME` in `.env`

### Change bundle identifier
- Update in `app.json`:
  - `ios.bundleIdentifier`
  - `android.package`

### Add a font
1. Place font files in `/assets/fonts/`
2. Add to `app.json` plugins
3. Load with `expo-font`

### Configure deep linking
- Update `scheme` in `app.json`
- Update `EXPO_PUBLIC_DEEP_LINK_DOMAIN` in `.env`
- Configure associated domains (iOS) / intent filters (Android)

### Enable dark mode
- Update `userInterfaceStyle` in `app.json`
- Use `useColorScheme()` hook
- Configure colors in `tailwind.config.js`

---

**Last Updated**: 2025-10-05
**Template Version**: 1.0.0
**Minimum Requirements**: Node.js 18+, Expo SDK 51+
