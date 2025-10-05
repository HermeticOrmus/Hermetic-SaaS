# HermeticSaaS Feature Modules - Quickstart Guide

Get your MicroSaaS up and running in minutes with pre-built modules.

## 5-Minute Setup

### Step 1: Choose Your Stack (1 min)

Pick the modules you need:

```
☐ Authentication - User login/signup
☐ Payments - Stripe subscriptions
☐ AI Chat - ChatGPT/Claude integration
☐ Analytics - Event tracking
```

### Step 2: Copy Modules (1 min)

```bash
# Copy modules to your project
cp -r feature-modules/authentication your-project/src/features/
cp -r feature-modules/payments your-project/src/features/
cp -r feature-modules/ai-chat your-project/src/features/
cp -r feature-modules/analytics your-project/src/features/
```

### Step 3: Install Dependencies (2 min)

```bash
# Authentication
npm install @supabase/supabase-js @supabase/auth-ui-react

# Payments
npm install stripe @stripe/stripe-js

# AI Chat
npm install openai @anthropic-ai/sdk

# Analytics
npm install recharts date-fns uuid
```

### Step 4: Set Environment Variables (1 min)

Create `.env.local`:

```env
# Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Chat
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### Step 5: Start Building! (0 min)

You're ready to go!

## Common Use Cases

### 1. Basic SaaS with Auth + Payments

**Time to implement: 10 minutes**

```tsx
// app/layout.tsx
import { AuthProvider } from '@/features/authentication';
import { AnalyticsProvider } from '@/features/analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// app/login/page.tsx
import { SignInForm } from '@/features/authentication';

export default function LoginPage() {
  return <SignInForm redirectTo="/dashboard" />;
}

// app/pricing/page.tsx
import { PricingTable } from '@/features/payments';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    priceId: 'price_starter',
    features: ['Feature 1', 'Feature 2'],
  },
];

export default function PricingPage() {
  return <PricingTable plans={plans} />;
}
```

### 2. AI-Powered App

**Time to implement: 15 minutes**

```tsx
// app/chat/page.tsx
import { ChatInterface } from '@/features/ai-chat';
import { ProtectedRoute } from '@/features/authentication';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="h-screen">
        <ChatInterface
          userId={user.id}
          systemPrompt="You are a helpful coding assistant."
          provider="openai"
        />
      </div>
    </ProtectedRoute>
  );
}

// app/api/chat/route.ts
import { handleChatRequest } from '@/features/ai-chat';

export async function POST(request: Request) {
  return handleChatRequest(request);
}
```

### 3. Analytics Dashboard

**Time to implement: 5 minutes**

```tsx
// app/admin/page.tsx
import { AnalyticsDashboard } from '@/features/analytics';
import { ProtectedRoute } from '@/features/authentication';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AnalyticsDashboard dateRange="30d" showRealTime={true} />
    </ProtectedRoute>
  );
}
```

## Essential Code Snippets

### Protected Dashboard
```tsx
import { useAuth } from '@/features/authentication';
import { useAnalytics } from '@/features/analytics';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { track } = useAnalytics();

  useEffect(() => {
    track('dashboard_viewed');
  }, []);

  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Subscription Gate
```tsx
import { useAuth } from '@/features/authentication';
import { CheckoutButton } from '@/features/payments';

export function FeatureGate({ children }) {
  const { user } = useAuth();

  if (!user?.subscription_status === 'active') {
    return (
      <div>
        <h2>Upgrade to Pro</h2>
        <CheckoutButton priceId="price_pro">
          Subscribe Now
        </CheckoutButton>
      </div>
    );
  }

  return children;
}
```

### Track User Events
```tsx
import { useAnalytics } from '@/features/analytics';

export function ProductCard({ product }) {
  const { track } = useAnalytics();

  const handleClick = () => {
    track('product_clicked', {
      product_id: product.id,
      product_name: product.name,
    });
  };

  return <div onClick={handleClick}>{product.name}</div>;
}
```

## Database Setup

### Supabase (Authentication)

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL from `authentication/README.md`
3. Copy credentials to `.env.local`

### Stripe (Payments)

1. Create account at [stripe.com](https://stripe.com)
2. Create products and pricing
3. Set up webhook endpoint
4. Copy credentials to `.env.local`

## API Routes Setup

Create these Next.js API routes:

```
app/api/
├── chat/
│   └── route.ts           # AI chat endpoint
├── payments/
│   ├── checkout/
│   │   └── route.ts       # Create checkout session
│   └── portal/
│       └── route.ts       # Create portal session
└── webhooks/
    └── stripe/
        └── route.ts       # Handle Stripe webhooks
```

### Example: Chat API Route
```tsx
// app/api/chat/route.ts
import { handleChatRequest } from '@/features/ai-chat';

export async function POST(request: Request) {
  return handleChatRequest(request);
}
```

### Example: Checkout API Route
```tsx
// app/api/payments/checkout/route.ts
import { createCheckoutSession } from '@/features/payments';
import { requireAuth } from '@/features/authentication';

export async function POST(request: Request) {
  const user = await requireAuth(request);
  const { priceId, mode } = await request.json();

  const session = await createCheckoutSession({
    priceId,
    mode,
    customerId: user.stripe_customer_id,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return Response.json({ url: session.url });
}
```

### Example: Webhook API Route
```tsx
// app/api/webhooks/stripe/route.ts
import { handleStripeWebhook } from '@/features/payments';

export async function POST(request: Request) {
  return handleStripeWebhook(request);
}
```

## Testing Checklist

### Authentication
- [ ] Sign up with email
- [ ] Verify email flow
- [ ] Sign in with password
- [ ] Password reset
- [ ] OAuth (Google/GitHub)
- [ ] Protected routes redirect
- [ ] Sign out works

### Payments
- [ ] Checkout creates session
- [ ] Test card payment (4242...)
- [ ] Webhook receives events
- [ ] Subscription updates in DB
- [ ] Customer portal works
- [ ] Subscription cancellation

### AI Chat
- [ ] Send message
- [ ] Receive streaming response
- [ ] Message history persists
- [ ] Error handling works
- [ ] Token tracking accurate

### Analytics
- [ ] Events are tracked
- [ ] Dashboard displays data
- [ ] Charts render correctly
- [ ] Export works
- [ ] Privacy controls work

## Common Issues & Fixes

### "Module not found"
```bash
# Make sure you installed dependencies
npm install

# Check import paths
import { useAuth } from '@/features/authentication';
```

### "Supabase errors"
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Check RLS policies in Supabase
```

### "Stripe webhook not working"
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check webhook secret matches
```

### "AI responses not streaming"
```tsx
// Make sure API route returns streaming response
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
  },
});
```

## Performance Tips

### Code Splitting
```tsx
// Lazy load heavy components
const AnalyticsDashboard = lazy(() =>
  import('@/features/analytics/components/AnalyticsDashboard')
);
```

### Caching
```tsx
// Cache user data
const { data: user } = useSWR('/api/user', fetcher, {
  revalidateOnFocus: false,
});
```

### Optimistic Updates
```tsx
// Update UI before API response
const handleLike = async () => {
  setLiked(true); // Optimistic
  await api.like(postId);
};
```

## Production Checklist

### Security
- [ ] Use live API keys (not test keys)
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Enable RLS on Supabase tables
- [ ] Verify webhook signatures

### Performance
- [ ] Enable caching
- [ ] Optimize images
- [ ] Code split large modules
- [ ] Monitor Core Web Vitals
- [ ] Set up CDN

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Set up uptime monitoring
- [ ] Enable logging
- [ ] Create alerts for errors

### Legal
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Cookie consent banner
- [ ] GDPR compliance
- [ ] Data retention policy

## Next Steps

1. **Customize styling** - Update Tailwind classes
2. **Add features** - Build on top of modules
3. **Set up CI/CD** - Automate deployments
4. **Add tests** - Write unit and E2E tests
5. **Launch!** - Ship your MicroSaaS

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## Getting Help

1. Check module README files
2. Review example implementations
3. Search code comments
4. Check STRUCTURE.md
5. Review troubleshooting sections

## Example Projects

See `starter-templates/` for complete example apps using these modules.

---

**Ready to build?** Start with the module that solves your biggest problem, then add others as needed.

**Questions?** Each module's README has extensive documentation and examples.

**Happy building!** 🚀
