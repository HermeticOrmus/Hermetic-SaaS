# Quick Start Guide

Get your HermeticSaaS mobile app running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] iOS: Xcode 14+ (Mac only)
- [ ] Android: Android Studio with SDK

## Step 1: Install Dependencies (2 min)

```bash
cd /path/to/this/template
npm install
```

## Step 2: Setup Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Go to Settings > API
4. Copy these values:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step 3: Start Development Server (30 sec)

```bash
npx expo start
```

## Step 4: Run on Device (1 min)

### Option A: Physical Device (Recommended)

1. Install "Expo Go" app from App Store / Play Store
2. Scan QR code from terminal
3. App will open in Expo Go

### Option B: Simulator/Emulator

**iOS Simulator (Mac only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

## Step 5: Test Authentication (30 sec)

1. App should open to login screen
2. Click "Sign Up"
3. Enter email and password
4. You should be logged in!

## Next Steps

### Enable OAuth Login

**Google:**
1. Go to Google Cloud Console
2. Create OAuth client IDs for iOS and Android
3. Add to `.env`:
```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
```

**Apple:**
1. Go to Apple Developer Portal
2. Create App ID with Sign in with Apple
3. Add to `.env`:
```
EXPO_PUBLIC_APPLE_CLIENT_ID=...
```

### Setup In-App Purchases

1. Create RevenueCat account: https://www.revenuecat.com
2. Create app in dashboard
3. Add products in App Store Connect / Play Console
4. Configure products in RevenueCat
5. Add API keys to `.env`:
```
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=...
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=...
```

### Enable Push Notifications

1. Run: `eas build:configure`
2. Get push credentials
3. Test with:
```typescript
import { registerForPushNotifications } from '@/services/notifications';
const token = await registerForPushNotifications();
```

### Deploy to App Stores

```bash
# Setup EAS
eas login
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit
eas submit --platform ios
eas submit --platform android
```

## Common First-Time Issues

**Issue:** `Metro bundler won't start`
```bash
npx expo start -c  # Clear cache
```

**Issue:** `Module not found`
```bash
rm -rf node_modules
npm install
```

**Issue:** `Expo Go won't connect`
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`

**Issue:** `iOS build fails`
```bash
cd ios
pod install --repo-update
cd ..
```

## File Structure Overview

```
├── app/              # Screens (file-based routing)
├── components/       # Reusable UI components
├── services/         # Supabase, notifications, etc.
├── hooks/           # Custom React hooks
├── store/           # Zustand state management
└── utils/           # Helper functions
```

## Development Workflow

1. **Create a screen**: Add file to `app/` directory
2. **Create a component**: Add to `components/` directory
3. **Add state**: Use Zustand in `store/`
4. **Call API**: Use Supabase client in `services/`
5. **Test**: `npm test`
6. **Build**: `eas build`

## Customization Checklist

- [ ] Update app name in `app.json`
- [ ] Replace icon in `assets/icon.png`
- [ ] Replace splash screen in `assets/splash.png`
- [ ] Update bundle identifiers (iOS/Android)
- [ ] Configure deep linking domain
- [ ] Setup custom fonts
- [ ] Configure theme colors in `tailwind.config.js`
- [ ] Add your logo/branding

## Support

- **Documentation:** See full README.md
- **Expo Docs:** https://docs.expo.dev
- **Supabase Docs:** https://supabase.com/docs
- **RevenueCat Docs:** https://www.revenuecat.com/docs

## Pro Tips

1. **Fast Refresh**: Edit code and see changes instantly
2. **Logs**: Shake device to open dev menu
3. **Debugging**: Use React DevTools browser extension
4. **Testing**: Test on real devices early and often
5. **Performance**: Use Flipper for performance monitoring

---

You're ready to build! Open `app/(auth)/home.tsx` and start coding.
