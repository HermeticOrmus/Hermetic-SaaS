# React Native Mobile Template - Summary

## What You Got

A production-ready React Native mobile app starter template for the HermeticSaaS framework. Everything you need to build and ship a mobile MicroSaaS app in days, not months.

## Template Contents

### 📱 Core Features
✅ React Native with Expo Router (file-based routing)
✅ TypeScript with full type safety
✅ Supabase authentication (email + OAuth)
✅ Tab navigation with React Navigation
✅ Push notifications (Expo Notifications)
✅ In-app purchases (RevenueCat)
✅ Analytics ready (Mixpanel/Amplitude)
✅ NativeWind styling (Tailwind for RN)
✅ State management (Zustand)
✅ Form validation (Zod)

### 📂 File Count
- **28 files** total
- **9 TypeScript/TSX** source files (services, hooks, config, app)
- **7 Configuration** files (build, test, lint, format)
- **4 Documentation** files (README, QUICKSTART, ARCHITECTURE, INDEX)
- **8 Config/Setup** files (package.json, tsconfig, etc.)

### 🎯 Production Ready
- EAS Build configuration
- Jest testing setup
- ESLint + Prettier configured
- TypeScript strict mode
- Environment variable management
- Error boundaries ready
- Security best practices

## Quick Start (5 Minutes)

```bash
# 1. Navigate to template
cd "/c/Users/ormus/Projects/(10) HermeticSaas/03-build/starter-templates/react-native-mobile"

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start dev server
npx expo start

# 5. Run on device
# - Scan QR with Expo Go app
# - Or press 'i' for iOS simulator
# - Or press 'a' for Android emulator
```

## Documentation Guide

1. **Start here**: `QUICKSTART.md` - Get running in 5 minutes
2. **Full guide**: `README.md` - Complete documentation
3. **Architecture**: `ARCHITECTURE.md` - How everything works
4. **Reference**: `PROJECT_INDEX.md` - File structure reference

## Key Integrations

### Supabase (Auth & Database)
- Email/password authentication
- Google OAuth ready
- Apple OAuth ready
- Row-level security support
- Real-time subscriptions ready

**Setup**: Get credentials from https://supabase.com/dashboard

### RevenueCat (Subscriptions)
- iOS in-app purchases
- Android in-app purchases
- Subscription management
- Purchase restoration
- Cross-platform support

**Setup**: Configure at https://www.revenuecat.com

### Push Notifications
- Permission handling
- Token management
- Deep linking
- Foreground/background handling
- Local notifications

**Setup**: Automatic with EAS Build

### Analytics
- Screen tracking
- Event tracking
- User properties
- Conversion tracking
- Privacy-first design

**Setup**: Add Mixpanel or Amplitude token

## Hermetic Principles

This template embodies all six Hermetic principles:

1. **Functional** - Every file serves a clear purpose
2. **Formless** - Easy to customize and extend
3. **Accurate** - Type-safe, validated, tested
4. **Divine** - Exceptional UX, smooth performance
5. **Elegant** - Clean code, clear patterns
6. **No Schemes** - Transparent, ethical, honest

## File Structure

```
react-native-mobile/
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry point
│   └── (auth)/            # Protected routes
│
├── services/              # External integrations
│   ├── supabase.ts       # Auth & DB
│   ├── notifications.ts  # Push notifications
│   ├── analytics.ts      # Tracking
│   └── purchases.ts      # RevenueCat
│
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   ├── useAnalytics.ts
│   └── useNotifications.ts
│
├── config/               # Configuration
│   └── env.ts           # Environment vars
│
├── utils/               # Utilities
│   └── validation.ts    # Zod schemas
│
└── store/              # Global state
    └── authStore.ts    # Zustand stores
```

## Next Steps

### Immediate (First Hour)
1. ✅ Install dependencies: `npm install`
2. ✅ Configure Supabase in `.env`
3. ✅ Start dev server: `npx expo start`
4. ✅ Test on device with Expo Go

### Setup (First Day)
1. ⚙️ Create Supabase project
2. ⚙️ Enable authentication providers
3. ⚙️ Create RevenueCat account
4. ⚙️ Configure products in App Store/Play Store
5. ⚙️ Setup EAS Build: `eas build:configure`

### Customization (First Week)
1. 🎨 Replace app icon and splash screen
2. 🎨 Update app name and bundle ID
3. 🎨 Customize theme in `tailwind.config.js`
4. 🎨 Add your screens in `/app`
5. 🎨 Build components in `/components`

### Deployment (Second Week)
1. 🚀 Build for iOS: `eas build --platform ios`
2. 🚀 Build for Android: `eas build --platform android`
3. 🚀 Test with TestFlight (iOS)
4. 🚀 Test with Internal Testing (Android)
5. 🚀 Submit to stores: `eas submit`

## Environment Variables Needed

### Required
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Optional (enable as needed)
```env
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=...
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=...
EXPO_PUBLIC_MIXPANEL_TOKEN=...
EXPO_PUBLIC_ENABLE_ANALYTICS=true
```

## Common Commands

```bash
# Development
npm start              # Start Expo
npm run ios           # iOS simulator
npm run android       # Android emulator

# Quality
npm run lint          # Check code
npm run type-check    # TypeScript
npm test              # Run tests

# Build
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

## Tech Stack

- **Framework**: React Native + Expo SDK 51
- **Language**: TypeScript 5.3
- **Routing**: Expo Router 3.5
- **Styling**: NativeWind (Tailwind CSS)
- **State**: Zustand 4.5
- **Auth**: Supabase 2.45
- **Payments**: RevenueCat 8.2
- **Testing**: Jest 29 + React Native Testing Library
- **Build**: EAS Build
- **Analytics**: Mixpanel/Amplitude ready

## What's Included

### Services
- ✅ Supabase client with auth helpers
- ✅ Push notification service
- ✅ Analytics service (pluggable)
- ✅ In-app purchase service

### Hooks
- ✅ useAuth - Authentication state
- ✅ useSubscription - Payment status
- ✅ useAnalytics - Event tracking
- ✅ useNotifications - Push handling

### Configuration
- ✅ Type-safe environment variables
- ✅ EAS Build profiles (dev, preview, prod)
- ✅ Jest with React Native preset
- ✅ ESLint + Prettier rules
- ✅ TypeScript path aliases

### App Structure
- ✅ Root layout with providers
- ✅ Authentication routing
- ✅ Tab navigation setup
- ✅ Modal example
- ✅ Loading states

## What's NOT Included (Add as Needed)

- UI components (add from your library)
- API client (use Supabase or add fetch wrapper)
- Form library (use react-hook-form if needed)
- i18n (add expo-localization if needed)
- Maps (add react-native-maps if needed)
- Camera (add expo-camera if needed)

## Support Resources

### Documentation
- Full README: `README.md`
- Quick Start: `QUICKSTART.md`
- Architecture: `ARCHITECTURE.md`
- File Index: `PROJECT_INDEX.md`

### External Docs
- [Expo Docs](https://docs.expo.dev)
- [Supabase Docs](https://supabase.com/docs)
- [RevenueCat Docs](https://www.revenuecat.com/docs)
- [NativeWind Docs](https://www.nativewind.dev)

### Community
- [Expo Discord](https://discord.gg/expo)
- [Supabase Discord](https://discord.supabase.com)

## Success Metrics

After setup, you should be able to:

- ✅ Run app on iOS/Android in < 5 minutes
- ✅ Sign up new users via Supabase
- ✅ Navigate between tab screens
- ✅ Receive push notifications
- ✅ Make test purchases (sandbox)
- ✅ Track analytics events
- ✅ Build production app
- ✅ Submit to app stores

## Template Philosophy

Built for **speed** and **quality**:

1. **Ship Fast** - Get to market in weeks, not months
2. **Production Ready** - No cutting corners on quality
3. **Type Safe** - Catch bugs before they ship
4. **Documented** - Clear guides for every feature
5. **Hermetic** - Follow the six principles
6. **Lean** - Only what you need, nothing more

## License

MIT - Use this template to build your MicroSaaS and ship fast!

## Questions?

1. Check the documentation (4 comprehensive guides)
2. Review example code in `/services` and `/hooks`
3. Join the HermeticSaaS community
4. Open an issue in the repo

---

**Built with ❤️ for the HermeticSaaS framework**

*Now go build something amazing!* 🚀
