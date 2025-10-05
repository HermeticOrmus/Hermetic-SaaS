# Feature Modules Structure

Complete directory structure of all HermeticSaaS feature modules.

## Directory Tree

```
feature-modules/
├── README.md                          # Main documentation
├── STRUCTURE.md                       # This file
│
├── authentication/                    # Authentication Module
│   ├── README.md                      # Module documentation
│   ├── index.ts                       # Main exports
│   ├── package.example.json           # Dependencies list
│   ├── components/
│   │   ├── ProtectedRoute.tsx         # Route protection wrapper
│   │   ├── SignInForm.tsx             # Login form with OAuth
│   │   ├── SignUpForm.tsx             # Registration form
│   │   └── PasswordResetForm.tsx      # Password reset flow
│   ├── hooks/
│   │   ├── useAuth.ts                 # Main auth hook
│   │   └── useProtectedRoute.ts       # Auto-redirect hook
│   ├── providers/
│   │   └── AuthProvider.tsx           # Global auth context
│   ├── lib/
│   │   └── supabase.ts                # Supabase client config
│   ├── types/
│   │   ├── auth.ts                    # Auth type definitions
│   │   └── database.ts                # Database schema types
│   └── utils/
│       └── checkAuth.ts               # Server-side auth checks
│
├── payments/                          # Payments Module
│   ├── README.md                      # Module documentation
│   ├── index.ts                       # Main exports
│   ├── package.example.json           # Dependencies list
│   ├── components/
│   │   ├── CheckoutButton.tsx         # One-click checkout
│   │   ├── CustomerPortalButton.tsx   # Billing portal access
│   │   └── PricingTable.tsx           # Multi-tier pricing UI
│   ├── api/
│   │   ├── checkout.ts                # Create checkout sessions
│   │   └── portal.ts                  # Create portal sessions
│   ├── lib/
│   │   └── stripe.ts                  # Stripe client config
│   ├── types/
│   │   └── index.ts                   # Payment type definitions
│   └── utils/
│       ├── subscription.ts            # Subscription management
│       ├── usage.ts                   # Usage-based billing
│       └── webhook-handler.ts         # Webhook event processing
│
├── ai-chat/                           # AI Chat Module
│   ├── README.md                      # Module documentation
│   ├── index.ts                       # Main exports
│   ├── package.example.json           # Dependencies list
│   ├── components/
│   │   ├── ChatInterface.tsx          # Full chat UI
│   │   ├── ChatMessage.tsx            # Message display
│   │   └── ChatInput.tsx              # Message input
│   ├── hooks/
│   │   └── useChat.ts                 # Chat state management
│   ├── api/
│   │   ├── openai.ts                  # OpenAI integration
│   │   ├── claude.ts                  # Claude integration
│   │   └── chat-handler.ts            # Unified request handler
│   ├── types/
│   │   └── index.ts                   # Chat type definitions
│   └── utils/
│       └── pricing.ts                 # Cost calculation
│
└── analytics/                         # Analytics Module
    ├── README.md                      # Module documentation
    ├── index.ts                       # Main exports
    ├── package.example.json           # Dependencies list
    ├── components/
    │   ├── AnalyticsDashboard.tsx     # Complete dashboard
    │   ├── MetricCard.tsx             # Metric display
    │   └── EventsChart.tsx            # Chart visualization
    ├── hooks/
    │   └── useAnalytics.ts            # Analytics tracking hook
    ├── providers/
    │   └── AnalyticsProvider.tsx      # Global analytics context
    ├── types/
    │   └── index.ts                   # Analytics type definitions
    └── utils/
        ├── export.ts                  # Data export utilities
        └── privacy.ts                 # Privacy & consent management
```

## File Count by Module

| Module | Components | Hooks | Utils | API | Types | Total Files |
|--------|-----------|-------|-------|-----|-------|-------------|
| Authentication | 4 | 2 | 1 | 0 | 2 | 13 |
| Payments | 3 | 0 | 3 | 2 | 1 | 12 |
| AI Chat | 3 | 1 | 1 | 3 | 1 | 12 |
| Analytics | 3 | 1 | 2 | 0 | 1 | 11 |

## Quick File Reference

### Authentication Module Files

**User-Facing Components:**
- `SignInForm.tsx` - Login form with email/password and OAuth
- `SignUpForm.tsx` - Registration with validation
- `PasswordResetForm.tsx` - Password reset flow
- `ProtectedRoute.tsx` - Route protection HOC

**Hooks:**
- `useAuth.ts` - Access user state and auth methods
- `useProtectedRoute.ts` - Auto-redirect unauthenticated users

**Server-Side:**
- `checkAuth.ts` - Verify auth in API routes
- `supabase.ts` - Client configuration

### Payments Module Files

**User-Facing Components:**
- `CheckoutButton.tsx` - Stripe checkout trigger
- `CustomerPortalButton.tsx` - Billing management
- `PricingTable.tsx` - Pricing tiers display

**API Utilities:**
- `checkout.ts` - Create checkout sessions
- `portal.ts` - Create portal sessions

**Server-Side:**
- `webhook-handler.ts` - Process Stripe events
- `subscription.ts` - Manage subscriptions
- `usage.ts` - Track usage-based billing

### AI Chat Module Files

**User-Facing Components:**
- `ChatInterface.tsx` - Complete chat UI
- `ChatMessage.tsx` - Message bubble
- `ChatInput.tsx` - Input with auto-resize

**API Integration:**
- `openai.ts` - OpenAI GPT integration
- `claude.ts` - Anthropic Claude integration
- `chat-handler.ts` - Unified API handler

**Hooks:**
- `useChat.ts` - Chat state and streaming

**Utilities:**
- `pricing.ts` - Calculate AI costs

### Analytics Module Files

**User-Facing Components:**
- `AnalyticsDashboard.tsx` - Full dashboard
- `MetricCard.tsx` - Metric display
- `EventsChart.tsx` - Time-series chart

**Core:**
- `AnalyticsProvider.tsx` - Event batching
- `useAnalytics.ts` - Track events

**Utilities:**
- `export.ts` - Export to CSV/JSON
- `privacy.ts` - GDPR compliance

## Import Patterns

### Single Component Import
```tsx
import { SignInForm } from '@/features/authentication/components/SignInForm';
```

### Multiple Imports from Module
```tsx
import { useAuth, ProtectedRoute, SignInForm } from '@/features/authentication';
```

### All Module Exports
```tsx
import * as Auth from '@/features/authentication';
// Use as: Auth.useAuth(), Auth.SignInForm, etc.
```

## File Size Estimates

| Module | Lines of Code | Estimated Size |
|--------|--------------|----------------|
| Authentication | ~1,200 | 35 KB |
| Payments | ~1,100 | 32 KB |
| AI Chat | ~900 | 28 KB |
| Analytics | ~800 | 25 KB |
| **Total** | **~4,000** | **~120 KB** |

## Dependency Graph

```
Your App
├── AuthProvider (authentication)
│   └── Supabase Client
│
├── AnalyticsProvider (analytics)
│   ├── Event Queue
│   └── Optional: PostHog/GA4
│
├── Payment Components (payments)
│   ├── Stripe Client
│   └── AuthProvider (requires user)
│
└── AI Chat Components (ai-chat)
    ├── OpenAI SDK
    ├── Anthropic SDK
    └── AuthProvider (requires user)
```

## Module Relationships

```
┌─────────────────┐
│  Authentication │ ◄── Required by all other modules
└────────┬────────┘
         │
    ┌────▼────┐
    │ Modules │
    └─────────┘
         │
    ┌────┼────┬────────┐
    │    │    │        │
┌───▼──┐ │ ┌──▼───┐ ┌─▼────────┐
│ Pay- │ │ │ AI   │ │Analytics │
│ments │ │ │ Chat │ │          │
└──────┘ │ └──────┘ └──────────┘
         │
    Optional: Can track payment events
```

## TypeScript Configuration

Each module exports comprehensive types. Example tsconfig paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/features/*": ["./src/features/*"]
    }
  }
}
```

## Code Organization Best Practices

1. **Keep modules independent** - Each module should work standalone
2. **Use index.ts exports** - Always import from module root
3. **Follow consistent patterns** - All modules use same structure
4. **Maintain type safety** - Use TypeScript strictly
5. **Document changes** - Update README when modifying

## Adding New Files

When extending modules, follow these guidelines:

### New Component
```
module-name/components/YourComponent.tsx
```

### New Hook
```
module-name/hooks/useYourHook.ts
```

### New Utility
```
module-name/utils/your-util.ts
```

### New Type
Add to existing `types/index.ts` or create:
```
module-name/types/your-types.ts
```

Always update `index.ts` to export new additions!

## Version Control

Recommended `.gitignore` additions:
```
# Don't commit these
*.example.json.local
.env.local
.env.development.local

# Do commit these
*.example.json
README.md
```

## Documentation Maintenance

Each module has:
- ✅ README.md with full documentation
- ✅ Inline code comments
- ✅ TypeScript JSDoc comments
- ✅ Usage examples
- ✅ Troubleshooting guide

## Support

For help with any module:
1. Check module's README.md
2. Review code comments
3. Check STRUCTURE.md (this file)
4. Review example implementations
