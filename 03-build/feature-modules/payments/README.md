# Payments Module

Production-ready Stripe integration for subscription-based SaaS. Copy-paste into any MicroSaaS app.

## Features

- Stripe Checkout integration
- Subscription management
- Customer portal
- Webhook handling
- Usage-based billing
- Invoice management
- Payment method updates
- Subscription upgrades/downgrades

## Installation

```bash
npm install stripe @stripe/stripe-js
```

## Environment Variables

Add to your `.env.local`:

```env
# Public keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-side keys (NEVER expose to client)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Quick Start

### 1. Create Stripe Products

In Stripe Dashboard, create your products and pricing:

```
Product: Starter Plan
Price: $9/month
Price ID: price_123abc
```

### 2. Configure Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `customer.subscription.*`, `invoice.*`, `payment_intent.*`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Add Checkout Button

```tsx
import { CheckoutButton } from '@/features/payments/components/CheckoutButton';

export default function PricingPage() {
  return (
    <CheckoutButton
      priceId="price_123abc"
      mode="subscription"
    >
      Subscribe Now
    </CheckoutButton>
  );
}
```

### 4. Handle Webhooks

Create API route at `app/api/webhooks/stripe/route.ts`:

```tsx
import { handleStripeWebhook } from '@/features/payments/utils/webhook-handler';

export async function POST(request: Request) {
  return handleStripeWebhook(request);
}
```

### 5. Add Customer Portal

```tsx
import { CustomerPortalButton } from '@/features/payments/components/CustomerPortalButton';

export default function SettingsPage() {
  return (
    <div>
      <h2>Billing</h2>
      <CustomerPortalButton>
        Manage Subscription
      </CustomerPortalButton>
    </div>
  );
}
```

## Components

### CheckoutButton
One-click checkout for subscriptions or one-time payments.

```tsx
<CheckoutButton
  priceId="price_123abc"
  mode="subscription"
  successUrl="/dashboard"
  cancelUrl="/pricing"
  metadata={{ userId: user.id }}
>
  Subscribe Now
</CheckoutButton>
```

### CustomerPortalButton
Opens Stripe Customer Portal for self-service billing.

```tsx
<CustomerPortalButton returnUrl="/settings">
  Manage Billing
</CustomerPortalButton>
```

### SubscriptionStatus
Display current subscription status.

```tsx
<SubscriptionStatus userId={user.id} />
```

### PricingTable
Pre-built pricing table with multiple tiers.

```tsx
<PricingTable
  plans={[
    {
      name: 'Starter',
      price: 9,
      priceId: 'price_starter',
      features: ['Feature 1', 'Feature 2'],
    },
    {
      name: 'Pro',
      price: 29,
      priceId: 'price_pro',
      features: ['All Starter features', 'Feature 3'],
    },
  ]}
/>
```

## Hooks

### useSubscription
Get current subscription details.

```tsx
const { subscription, loading, error } = useSubscription(userId);

if (subscription?.status === 'active') {
  // User has active subscription
}
```

### useCheckout
Programmatic checkout creation.

```tsx
const { createCheckout, loading } = useCheckout();

const handleSubscribe = async () => {
  const url = await createCheckout({
    priceId: 'price_123abc',
    mode: 'subscription',
  });
  window.location.href = url;
};
```

### useCustomerPortal
Programmatic customer portal access.

```tsx
const { openPortal, loading } = useCustomerPortal();

const handleManageBilling = async () => {
  const url = await openPortal();
  window.location.href = url;
};
```

## API Routes

### Create Checkout Session
`POST /api/payments/checkout`

```tsx
import { createCheckoutSession } from '@/features/payments/api/checkout';

export async function POST(request: Request) {
  const user = await requireAuth(request);
  const { priceId, mode } = await request.json();

  const session = await createCheckoutSession({
    priceId,
    mode,
    customerId: user.stripeCustomerId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return Response.json({ url: session.url });
}
```

### Create Portal Session
`POST /api/payments/portal`

```tsx
import { createPortalSession } from '@/features/payments/api/portal';

export async function POST(request: Request) {
  const user = await requireAuth(request);

  const session = await createPortalSession({
    customerId: user.stripeCustomerId,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return Response.json({ url: session.url });
}
```

## Database Schema

Add to your Supabase schema:

```sql
-- Add Stripe fields to profiles
alter table profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text,
  add column subscription_plan text,
  add column subscription_current_period_end timestamp with time zone;

-- Create subscriptions table for detailed tracking
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  status text not null,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  cancel_at_period_end boolean default false,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create invoices table
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  stripe_invoice_id text not null unique,
  stripe_customer_id text not null,
  amount_paid integer not null,
  currency text not null,
  status text not null,
  invoice_pdf text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table subscriptions enable row level security;
alter table invoices enable row level security;

-- Create policies
create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can view own invoices"
  on invoices for select
  using (auth.uid() = user_id);
```

## Webhook Event Handlers

The webhook handler automatically processes these events:

### customer.subscription.created
Creates subscription record when user subscribes.

### customer.subscription.updated
Updates subscription status (active, past_due, canceled).

### customer.subscription.deleted
Marks subscription as canceled.

### invoice.paid
Records successful payment.

### invoice.payment_failed
Handles failed payments.

## Usage-Based Billing

For metered billing (API calls, storage, etc.):

```tsx
import { reportUsage } from '@/features/payments/utils/usage';

// Report usage event
await reportUsage({
  subscriptionItemId: 'si_123abc',
  quantity: 1, // 1 API call
  timestamp: Date.now(),
});
```

## Subscription Management

### Upgrade/Downgrade

```tsx
import { updateSubscription } from '@/features/payments/utils/subscription';

// Upgrade to Pro plan
await updateSubscription({
  subscriptionId: 'sub_123abc',
  newPriceId: 'price_pro',
  prorationBehavior: 'always_invoice', // or 'create_prorations'
});
```

### Cancel Subscription

```tsx
import { cancelSubscription } from '@/features/payments/utils/subscription';

// Cancel at period end
await cancelSubscription({
  subscriptionId: 'sub_123abc',
  cancelAtPeriodEnd: true,
});

// Cancel immediately
await cancelSubscription({
  subscriptionId: 'sub_123abc',
  cancelAtPeriodEnd: false,
});
```

## Testing

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
```

## Security Best Practices

1. Never expose `STRIPE_SECRET_KEY` to client
2. Always verify webhook signatures
3. Use HTTPS in production
4. Validate webhook events
5. Implement idempotency for webhook handlers
6. Log all payment events
7. Monitor for suspicious activity

## Common Patterns

### Free Trial

```tsx
<CheckoutButton
  priceId="price_123abc"
  mode="subscription"
  trialPeriodDays={14}
>
  Start 14-Day Free Trial
</CheckoutButton>
```

### Coupon Code

```tsx
<CheckoutButton
  priceId="price_123abc"
  mode="subscription"
  couponCode="LAUNCH50"
>
  Subscribe with 50% Off
</CheckoutButton>
```

### Multiple Payment Methods

```tsx
<CheckoutButton
  priceId="price_123abc"
  mode="subscription"
  paymentMethodTypes={['card', 'us_bank_account']}
>
  Subscribe Now
</CheckoutButton>
```

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is publicly accessible
- Verify webhook secret is correct
- Check Stripe Dashboard for delivery attempts
- Ensure endpoint returns 200 status

### Customer portal not working
- Verify customer has Stripe customer ID
- Check customer portal is configured in Stripe
- Ensure return URL is valid

### Subscription not updating
- Check webhook is processing events
- Verify database permissions
- Check for errors in webhook logs

## Production Checklist

- [ ] Switch to live API keys
- [ ] Configure production webhooks
- [ ] Set up customer portal
- [ ] Test all payment flows
- [ ] Enable webhook signature verification
- [ ] Set up monitoring and alerts
- [ ] Configure email receipts
- [ ] Test subscription cancellation
- [ ] Verify tax calculation (if needed)
- [ ] Set up invoice generation

## License

MIT - Free to use in commercial projects
