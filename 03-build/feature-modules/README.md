# HermeticSaaS Feature Modules

Production-ready, plug-and-play modules for building MicroSaaS applications. Each module is self-contained, well-documented, and follows best practices.

## Available Modules

### 1. Authentication Module
Complete authentication solution using Supabase.

**Features:**
- Email/Password authentication
- OAuth providers (Google, GitHub, etc.)
- Password reset flow
- Email verification
- Protected routes
- Session management

**Quick Start:**
```tsx
import { AuthProvider, useAuth, SignInForm } from '@/features/authentication';

// Wrap your app
<AuthProvider>
  <App />
</AuthProvider>

// Use in components
const { user, signOut } = useAuth();
```

[Read full documentation](./authentication/README.md)

---

### 2. Payments Module
Stripe integration for subscriptions and one-time payments.

**Features:**
- Checkout flow
- Subscription management
- Customer portal
- Webhook handling
- Usage-based billing
- Invoice management

**Quick Start:**
```tsx
import { CheckoutButton, PricingTable } from '@/features/payments';

<CheckoutButton priceId="price_123" mode="subscription">
  Subscribe Now
</CheckoutButton>
```

[Read full documentation](./payments/README.md)

---

### 3. AI Chat Module
AI-powered chat interface with OpenAI and Claude support.

**Features:**
- Chat UI components
- OpenAI GPT-4 integration
- Anthropic Claude integration
- Streaming responses
- Conversation memory
- Token tracking

**Quick Start:**
```tsx
import { ChatInterface, useChat } from '@/features/ai-chat';

<ChatInterface
  userId={user.id}
  systemPrompt="You are a helpful assistant."
/>
```

[Read full documentation](./ai-chat/README.md)

---

### 4. Analytics Module
Privacy-compliant analytics and event tracking.

**Features:**
- Event tracking
- Analytics dashboard
- Metrics visualization
- Data export
- Privacy controls
- Real-time metrics

**Quick Start:**
```tsx
import { AnalyticsProvider, useAnalytics } from '@/features/analytics';

// Wrap your app
<AnalyticsProvider>
  <App />
</AnalyticsProvider>

// Track events
const { track } = useAnalytics();
track('button_clicked', { button_id: 'cta' });
```

[Read full documentation](./analytics/README.md)

---

## Installation Guide

### 1. Copy Module to Your Project

Copy the desired module folder to your project:

```bash
# Example: Copy authentication module
cp -r feature-modules/authentication your-project/src/features/
```

### 2. Install Dependencies

Each module has its own dependencies listed in its README. Install them:

```bash
# Example: Authentication module
npm install @supabase/supabase-js @supabase/auth-ui-react
```

### 3. Set Environment Variables

Add required environment variables to your `.env.local`:

```env
# Authentication
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# AI Chat
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### 4. Set Up Database Schema

Run the SQL schema provided in each module's README:

```sql
-- Example: Authentication schema
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  -- ... more fields
);
```

### 5. Use in Your Application

Import and use the module components:

```tsx
import { AuthProvider } from '@/features/authentication';
import { AnalyticsProvider } from '@/features/analytics';

export default function App({ children }) {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </AuthProvider>
  );
}
```

## Module Structure

Each module follows this structure:

```
module-name/
├── README.md              # Complete documentation
├── index.ts               # Main export file
├── types/                 # TypeScript type definitions
├── components/            # React components
├── hooks/                 # Custom React hooks
├── providers/             # Context providers
├── api/                   # API utilities
├── utils/                 # Helper functions
└── lib/                   # Third-party integrations
```

## Design Principles

### 1. Hermetic
Each module is self-contained with no external dependencies on your codebase.

### 2. Copy-Paste Ready
Simply copy the module folder and start using it. No complex setup required.

### 3. Type-Safe
Full TypeScript support with comprehensive type definitions.

### 4. Production-Ready
Battle-tested code following industry best practices.

### 5. Well-Documented
Extensive documentation with examples and troubleshooting guides.

### 6. Zero Conflicts
Designed to work together without dependency conflicts.

## Combining Modules

Modules are designed to work together seamlessly:

```tsx
import { AuthProvider, useAuth } from '@/features/authentication';
import { AnalyticsProvider, useAnalytics } from '@/features/analytics';
import { CheckoutButton } from '@/features/payments';

function App() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const handleCheckout = () => {
    track('checkout_initiated', { plan: 'pro' });
  };

  return (
    <AuthProvider>
      <AnalyticsProvider>
        {user && (
          <CheckoutButton
            priceId="price_123"
            onClick={handleCheckout}
          >
            Upgrade to Pro
          </CheckoutButton>
        )}
      </AnalyticsProvider>
    </AuthProvider>
  );
}
```

## Common Patterns

### Protected Route with Analytics
```tsx
import { ProtectedRoute } from '@/features/authentication';
import { useAnalytics } from '@/features/analytics';

function Dashboard() {
  const { track } = useAnalytics();

  useEffect(() => {
    track('dashboard_viewed');
  }, []);

  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Subscription with AI Features
```tsx
import { useAuth } from '@/features/authentication';
import { ChatInterface } from '@/features/ai-chat';
import { useSubscription } from '@/features/payments';

function AIChat() {
  const { user } = useAuth();
  const { subscription } = useSubscription(user.id);

  if (subscription?.status !== 'active') {
    return <UpgradePrompt />;
  }

  return <ChatInterface userId={user.id} />;
}
```

## Customization

### Styling
All components use Tailwind CSS classes. Customize by:

1. Passing `className` prop to components
2. Modifying the component files directly
3. Using CSS modules for complete redesign

### Functionality
Extend functionality by:

1. Wrapping components with your own logic
2. Extending types with your own properties
3. Adding custom hooks that build on module hooks

## Testing

Each module includes examples of how to test:

```tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/authentication';

test('protected route redirects unauthenticated users', () => {
  render(
    <AuthProvider>
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    </AuthProvider>
  );
  // Add assertions
});
```

## Migration Guide

### From Existing Auth Solution
1. Export user data from current provider
2. Import to Supabase using migration tools
3. Replace auth components with module components
4. Update API routes to use module utilities

### From Manual Implementation
1. Identify overlapping functionality
2. Gradually replace custom code with modules
3. Test each replacement thoroughly
4. Remove old code once verified

## Support & Contribution

### Getting Help
- Check module README for troubleshooting
- Review code comments for inline documentation
- Search for similar issues in your codebase

### Contributing
These modules are designed to be forked and customized for your needs:

1. Copy module to your project
2. Modify as needed
3. Keep core structure intact for easy updates
4. Document your changes

## Version Compatibility

- **Next.js**: 13+ (App Router)
- **React**: 18+
- **TypeScript**: 5+
- **Node.js**: 18+

## License

MIT - Free to use in commercial projects

---

## Quick Reference

| Module | Primary Use | Key Dependencies |
|--------|------------|------------------|
| Authentication | User management | Supabase |
| Payments | Monetization | Stripe |
| AI Chat | AI features | OpenAI, Claude |
| Analytics | Product insights | PostHog (optional) |

## Next Steps

1. Choose modules you need
2. Read individual module documentation
3. Copy modules to your project
4. Install dependencies
5. Configure environment variables
6. Start building!

Happy building with HermeticSaaS!
