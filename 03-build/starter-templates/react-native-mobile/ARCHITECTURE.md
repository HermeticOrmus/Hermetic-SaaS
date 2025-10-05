# Architecture Guide

## Overview

This template follows a modular, feature-based architecture designed for rapid development and easy maintenance.

## Directory Structure Explained

### `/app` - Expo Router Pages
File-based routing using Expo Router. Each file becomes a route automatically.

```
app/
├── _layout.tsx              # Root layout, handles global state
├── index.tsx                # Entry point, redirects based on auth
├── (auth)/                  # Protected routes (authenticated users only)
│   ├── _layout.tsx          # Tab navigation layout
│   ├── home.tsx             # Home screen
│   ├── profile.tsx          # User profile
│   └── settings.tsx         # App settings
├── (public)/                # Public routes (unauthenticated)
│   ├── login.tsx            # Login screen
│   ├── signup.tsx           # Sign up screen
│   └── forgot-password.tsx  # Password reset
└── modal.tsx                # Example modal
```

**Naming Conventions:**
- `(folder)` - Group routes without affecting URL
- `_layout.tsx` - Layout component for nested routes
- `[param].tsx` - Dynamic route parameter

### `/components` - Reusable Components

```
components/
├── ui/                      # UI primitives (Button, Input, etc.)
├── auth/                    # Auth-specific components
├── layout/                  # Layout components (Screen, Header)
└── features/                # Feature-specific components
```

**Component Guidelines:**
- Keep components under 200 lines
- Use TypeScript interfaces for props
- Export as named exports
- Include JSDoc comments for complex logic

### `/services` - External Integrations

Single responsibility: Each service manages one external integration.

```
services/
├── supabase.ts              # Supabase client + auth helpers
├── notifications.ts         # Push notifications
├── analytics.ts             # Analytics tracking
└── purchases.ts             # In-app purchases
```

**Service Pattern:**
```typescript
// Export configured client
export const client = initializeClient();

// Export helper functions
export async function doSomething() {
  // Implementation
}
```

### `/hooks` - Custom React Hooks

Encapsulate stateful logic for reuse across components.

```
hooks/
├── useAuth.ts               # Authentication state
├── useSubscription.ts       # Subscription status
├── useAnalytics.ts          # Analytics tracking
└── useNotifications.ts      # Notification handling
```

**Hook Pattern:**
```typescript
export function useFeature() {
  const [state, setState] = useState();

  // Effects, logic, etc.

  return {
    // Return values
  };
}
```

### `/store` - Global State (Zustand)

Minimal global state. Prefer local state when possible.

```
store/
├── authStore.ts             # Auth state
├── userStore.ts             # User data
└── appStore.ts              # App settings
```

**Store Pattern:**
```typescript
export const useStore = create<StoreType>(set => ({
  value: null,
  setValue: (value) => set({ value }),
  reset: () => set(initialState),
}));
```

### `/utils` - Utilities & Helpers

Pure functions, constants, and helpers.

```
utils/
├── constants.ts             # App constants
├── validation.ts            # Zod schemas
├── helpers.ts               # Helper functions
└── formatters.ts            # Date, number formatters
```

### `/types` - TypeScript Types

Shared types and interfaces.

```
types/
├── auth.ts                  # Auth-related types
├── user.ts                  # User types
├── subscription.ts          # Subscription types
└── api.ts                   # API response types
```

### `/config` - Configuration

App configuration and environment setup.

```
config/
├── env.ts                   # Environment variables
└── theme.ts                 # Theme configuration
```

## Data Flow

### Authentication Flow

```
1. App starts → index.tsx
2. Check auth state → useAuth hook
3. Route to appropriate screen
   - Authenticated → (auth)/home
   - Unauthenticated → login
4. Auth state changes → onAuthStateChange listener
5. Re-route automatically
```

### API Call Flow

```
1. Component triggers action
2. Call service function (e.g., supabase.ts)
3. Service makes API call
4. Update local state or Zustand store
5. Component re-renders with new data
```

### Navigation Flow

```
1. User taps button/link
2. Call router.push('/route')
3. Expo Router handles navigation
4. New screen mounts
5. Track screen view (analytics)
```

## Hermetic Principles in Architecture

### Functional
- Each module has one clear purpose
- Pure functions in utils/
- Side effects isolated in services/
- No circular dependencies

### Formless
- Modular architecture - swap any piece
- Service interfaces allow easy provider changes
- Component composition over inheritance
- Feature flags for flexibility

### Accurate
- Full TypeScript coverage
- Zod validation for runtime safety
- Type-safe routing with Expo Router
- Error boundaries for graceful failures

### Divine
- Exceptional user experience
- Optimistic UI updates
- Smooth transitions
- Loading states everywhere

### Elegant
- Clear naming conventions
- Consistent file structure
- Self-documenting code
- Minimal abstractions

### No Schemes
- Transparent data flow
- No hidden magic
- Clear error messages
- Honest metrics

## Best Practices

### Component Structure

```typescript
/**
 * Component description
 */

import { ... } from 'react-native';
import { ... } from 'external-libs';
import { ... } from '@/local-imports';

interface Props {
  // Props interface
}

export function ComponentName({ prop }: Props) {
  // 1. Hooks
  const [state, setState] = useState();
  const { data } = useHook();

  // 2. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 3. Event handlers
  const handlePress = () => {
    // Logic
  };

  // 4. Render helpers
  const renderItem = () => {
    // JSX
  };

  // 5. Main render
  return (
    <View>
      {/* JSX */}
    </View>
  );
}
```

### Error Handling

```typescript
try {
  const result = await riskyOperation();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly message
  Alert.alert('Error', 'Something went wrong. Please try again.');
}
```

### Loading States

```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />;
}

return <Content data={data} />;
```

### Performance Optimization

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensive(data);
}, [data]);

// Memoize callbacks
const handlePress = useCallback(() => {
  doSomething();
}, []);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

## Testing Strategy

### Unit Tests
- Test utilities and helpers
- Test pure functions
- Test custom hooks

### Integration Tests
- Test service integrations
- Test navigation flows
- Test auth flows

### E2E Tests
- Test critical user journeys
- Test payment flows
- Test onboarding

## Deployment Pipeline

```
1. Development
   - Local testing
   - Hot reload
   - Debug builds

2. Preview
   - Internal testing
   - Staging environment
   - TestFlight/Internal testing

3. Production
   - App Store review
   - Play Store review
   - Over-the-air updates (Expo)
```

## Security Considerations

### Sensitive Data Storage
- Use `expo-secure-store` for tokens, keys
- Never store passwords
- Clear sensitive data on logout

### API Security
- Always use HTTPS
- Implement certificate pinning (production)
- Validate all inputs
- Sanitize outputs

### Auth Security
- Use Supabase Row Level Security
- Implement session timeouts
- Handle expired tokens gracefully
- Support biometric authentication

## Performance Monitoring

### Metrics to Track
- App launch time
- Screen transition time
- API response time
- Crash rate
- User retention

### Tools
- Expo Application Services (EAS)
- RevenueCat Analytics
- Supabase Analytics
- Custom analytics events

## Scaling Considerations

### Code Splitting
- Lazy load heavy screens
- Use dynamic imports for large libraries
- Optimize bundle size

### State Management
- Keep Zustand stores minimal
- Use React Context for theme, i18n
- Prefer local state when possible

### Database Optimization
- Index frequently queried fields
- Use pagination for lists
- Implement caching strategies
- Use Supabase Realtime sparingly

---

This architecture is designed to scale with your app while maintaining simplicity and speed of development.
