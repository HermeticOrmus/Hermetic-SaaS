# Next.js SaaS Starter Template

> **Built by Hermetic Agents - Production-ready MicroSaaS foundation**

## 🚀 Quick Start

```bash
# Clone and setup
npx create-next-app@latest my-microsaas --use-npm
cd my-microsaas

# Install dependencies
npm install @supabase/supabase-js @stripe/stripe-js stripe
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development
npm run dev
```

---

## 🎯 What's Included

### Core Features
- ✅ **Authentication** - Supabase Auth (email, OAuth)
- ✅ **Database** - Supabase PostgreSQL
- ✅ **Payments** - Stripe integration
- ✅ **UI Components** - Tailwind CSS + Headless UI
- ✅ **API Routes** - Next.js API routes
- ✅ **Email** - Resend for transactional emails
- ✅ **Analytics** - Vercel Analytics ready

### Pages Included
- `/` - Landing page with hero, features, pricing
- `/login` - Authentication page
- `/signup` - User registration
- `/dashboard` - User dashboard (protected)
- `/settings` - Account settings
- `/pricing` - Pricing page
- `/api/*` - API endpoints

---

## 📂 Project Structure

```
my-microsaas/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── stripe/
│   │   └── user/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   ├── ui/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── utils/
│   └── hooks/
├── public/
├── styles/
├── .env.example
└── package.json
```

---

## 🔧 Configuration

### 1. Supabase Setup

```bash
# Create Supabase project at supabase.com
# Get URL and anon key

# Add to .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Database Schema**:
```sql
-- Users table (handled by Supabase Auth)
-- Profile table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  price_id TEXT,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

### 2. Stripe Setup

```bash
# Get keys from stripe.com
# Add to .env.local:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Products to Create**:
- Free Tier: $0/month
- Pro Tier: $29/month
- Premium Tier: $99/month

### 3. Email Setup (Optional)

```bash
# Use Resend for emails
RESEND_API_KEY=re_...
```

---

## 🎨 Customization

### 1. Branding

Edit `app/layout.tsx`:
```tsx
export const metadata = {
  title: 'Your MicroSaaS Name',
  description: 'Your value proposition',
}
```

Edit `components/landing/Hero.tsx` for your messaging.

### 2. Pricing Tiers

Edit `app/pricing/page.tsx`:
```tsx
const pricingTiers = [
  {
    name: 'Free',
    price: 0,
    features: ['Feature 1', 'Feature 2'],
  },
  {
    name: 'Pro',
    price: 29,
    features: ['All Free features', 'Feature 3', 'Feature 4'],
    stripePriceId: 'price_...',
  },
]
```

### 3. Features

Add your core features in `app/(dashboard)/dashboard/page.tsx`

---

## 🔐 Authentication Flow

### Login
```tsx
// components/auth/LoginForm.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### OAuth (Google, GitHub)
```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
})
```

### Protected Routes
```tsx
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}
```

---

## 💳 Payment Integration

### Checkout Session
```tsx
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
  })

  return Response.json({ sessionId: session.id })
}
```

### Webhook Handler
```tsx
// app/api/stripe/webhook/route.ts
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  // Handle events: customer.subscription.created, updated, deleted
  // Update database with subscription status
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Set up Stripe webhook URL: https://your-app.vercel.app/api/stripe/webhook
```

### Environment Variables Checklist
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] NEXT_PUBLIC_URL
- [ ] RESEND_API_KEY (optional)

---

## 📊 Built-in Analytics

Track key metrics automatically:

```tsx
// lib/analytics.ts
export const trackEvent = (name: string, properties?: object) => {
  // Vercel Analytics
  if (typeof window !== 'undefined') {
    window.va?.track(name, properties)
  }
}

// Usage
trackEvent('user_signed_up', { method: 'google' })
trackEvent('subscription_created', { tier: 'pro' })
```

---

## 🎯 Next Steps After Setup

1. **Customize Branding** - Logo, colors, copy
2. **Build Core Feature** - Your unique value proposition
3. **Set Up Monitoring** - Error tracking (Sentry)
4. **Create Content** - Landing page copy, help docs
5. **Test Payments** - Use Stripe test mode
6. **Launch** - Deploy and start marketing

---

## 🛠️ Common Tasks

### Add New Protected Page
```tsx
// app/(dashboard)/new-page/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function NewPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  // Your page content
}
```

### Add API Endpoint
```tsx
// app/api/your-endpoint/route.ts
export async function GET(req: Request) {
  return Response.json({ message: 'Hello' })
}

export async function POST(req: Request) {
  const body = await req.json()
  // Process request
  return Response.json({ success: true })
}
```

---

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🎨 Hermetic Principles in This Template

✅ **Functional** - Production-ready, tested patterns

✅ **Formless** - Adapt to any MicroSaaS idea

✅ **Accurate** - Best practices, secure implementations

✅ **Divine** - Built to serve users genuinely

✅ **Elegant** - Clean code, beautiful UI, simple setup

✅ **No Schemes** - Honest pricing display, easy cancellation

---

*Template by Hermetic Agents: Sol (Architecture) + Iris (Scaffolding)*
*Ready for Jupiter (Features) + Venus (Design) + Mars (Testing)*
