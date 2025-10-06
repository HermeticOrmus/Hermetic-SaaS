# Complete Stripe Setup Guide for SaaS

Stripe is the gold standard for SaaS payments. This guide covers everything from setup to production.

## Why Stripe for SaaS

**Pros:**
- Best subscription management
- Excellent developer experience
- Flexible pricing models
- Great documentation
- Powerful webhooks
- Built-in dunning
- Customer portal for self-service

**Cons:**
- You handle tax/VAT
- Requires business entity
- More complex setup than MoR

**Best for:** B2B SaaS, API products, any subscription business

---

## Part 1: Account Setup (30 minutes)

### Step 1: Create Stripe Account

1. Go to stripe.com/register
2. Enter business email
3. Verify email
4. Complete business profile:
   - Business type (LLC, Corporation, Sole Prop)
   - Tax ID (EIN or SSN)
   - Bank account for payouts
   - Business address

**Note:** You can test without completing this, but need it for real charges.

### Step 2: Get API Keys

1. Dashboard → Developers → API keys
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

**Security:**
```bash
# Store in .env file (NEVER commit to git)
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Add to .gitignore
echo ".env" >> .gitignore
```

### Step 3: Enable Payment Methods

Dashboard → Settings → Payment methods

**Recommended for SaaS:**
- ✅ Cards (Visa, Mastercard, Amex)
- ✅ Apple Pay / Google Pay (for mobile)
- ✅ ACH Direct Debit (for enterprise, lower fees)
- ✅ SEPA Direct Debit (for Europe)
- ⚠️ Crypto (if your audience expects it)

---

## Part 2: Product & Pricing Setup (20 minutes)

### Step 4: Create Products

Dashboard → Products → Add product

**Example: SaaS with 3 tiers**

```
Product 1: Pro Plan
- Name: Pro Plan
- Description: For small teams
- Pricing:
  - Monthly: $99/month
  - Annual: $990/year (2 months free)
- Billing period: Monthly / Annually
```

**Via API (more flexible):**

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Create product
const product = await stripe.products.create({
  name: 'Pro Plan',
  description: 'For growing teams',
  metadata: {
    tier: 'pro',
    features: 'unlimited_projects,priority_support,api_access'
  }
})

// Create price (monthly)
const priceMonthly = await stripe.prices.create({
  product: product.id,
  unit_amount: 9900, // $99.00 in cents
  currency: 'usd',
  recurring: {
    interval: 'month',
    interval_count: 1
  },
  metadata: {
    plan: 'pro_monthly'
  }
})

// Create price (annual)
const priceAnnual = await stripe.prices.create({
  product: product.id,
  unit_amount: 99000, // $990.00 in cents
  currency: 'usd',
  recurring: {
    interval: 'year',
    interval_count: 1
  },
  metadata: {
    plan: 'pro_annual'
  }
})
```

**Save these price IDs** - you'll need them:
```
price_monthly_id = price_xxxxxxxxxxxxx
price_annual_id = price_xxxxxxxxxxxxx
```

---

## Part 3: Integration (2-4 hours)

### Option A: Stripe Checkout (Fastest - Hosted)

**Pros:** Stripe hosts checkout page, handles UX, PCI compliance
**Cons:** Less customization

**Implementation:**

```javascript
// Backend: Create checkout session
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

app.post('/create-checkout-session', async (req, res) => {
  const { priceId, customerId } = req.body

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId, // or use customer_email for new customers
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/pricing`,
    allow_promotion_codes: true, // Enable discount codes
    billing_address_collection: 'required',
    tax_id_collection: {
      enabled: true // Collect tax IDs for business customers
    }
  })

  res.json({ url: session.url })
})
```

```javascript
// Frontend: Redirect to Stripe Checkout
async function handleSubscribe(priceId) {
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId })
  })

  const { url } = await response.json()
  window.location.href = url // Redirect to Stripe
}
```

**That's it!** Stripe handles the rest.

---

### Option B: Stripe Elements (Custom UI)

**Pros:** Full control over design
**Cons:** More code, you build the form

```html
<!-- Frontend: Your pricing page -->
<form id="payment-form">
  <div id="card-element"></div>
  <button id="submit">Subscribe to Pro - $99/month</button>
  <div id="error-message"></div>
</form>

<script src="https://js.stripe.com/v3/"></script>
<script>
const stripe = Stripe('pk_test_xxxxxxxxxxxxx')
const elements = stripe.elements()
const cardElement = elements.create('card')
cardElement.mount('#card-element')

document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault()

  // Create payment method
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: {
      email: 'customer@example.com'
    }
  })

  if (error) {
    document.getElementById('error-message').textContent = error.message
    return
  }

  // Send to your server to create subscription
  const response = await fetch('/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentMethodId: paymentMethod.id,
      priceId: 'price_xxxxxxxxxxxxx'
    })
  })

  const subscription = await response.json()

  if (subscription.status === 'active') {
    window.location.href = '/dashboard'
  }
})
</script>
```

```javascript
// Backend: Create subscription
app.post('/create-subscription', async (req, res) => {
  const { paymentMethodId, priceId } = req.body

  // Create customer
  const customer = await stripe.customers.create({
    payment_method: paymentMethodId,
    email: req.user.email, // from your auth system
    invoice_settings: {
      default_payment_method: paymentMethodId
    },
    metadata: {
      userId: req.user.id
    }
  })

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
    trial_period_days: 14 // Optional: free trial
  })

  // Store subscription ID in your database
  await db.users.update({
    where: { id: req.user.id },
    data: {
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status
    }
  })

  res.json(subscription)
})
```

---

## Part 4: Webhooks (Critical - 1 hour)

**Why webhooks?** Stripe notifies you of events (payment success, failure, subscription cancel).

### Step 1: Create Webhook Endpoint

```javascript
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Important: Use raw body for signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle events
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object)
      break

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object)
      break

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  res.json({ received: true })
})

// Handler functions
async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer
  const customer = await stripe.customers.retrieve(customerId)

  await db.users.update({
    where: { email: customer.email },
    data: {
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })

  // Send welcome email
  await sendEmail(customer.email, 'welcome', {
    planName: subscription.items.data[0].price.nickname
  })
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer
  const customer = await stripe.customers.retrieve(customerId)

  await db.users.update({
    where: { email: customer.email },
    data: {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })
}

async function handleSubscriptionCanceled(subscription) {
  const customerId = subscription.customer
  const customer = await stripe.customers.retrieve(customerId)

  await db.users.update({
    where: { email: customer.email },
    data: {
      subscriptionStatus: 'canceled',
      canceledAt: new Date()
    }
  })

  // Send cancelation email (exit survey)
  await sendEmail(customer.email, 'canceled', {
    feedbackUrl: 'https://yourapp.com/feedback'
  })
}

async function handlePaymentSucceeded(invoice) {
  // Extend access
  const customerId = invoice.customer
  const customer = await stripe.customers.retrieve(customerId)

  await db.users.update({
    where: { email: customer.email },
    data: {
      lastPaymentDate: new Date(),
      subscriptionStatus: 'active'
    }
  })
}

async function handlePaymentFailed(invoice) {
  // Payment failed - Stripe will retry automatically
  const customerId = invoice.customer
  const customer = await stripe.customers.retrieve(customerId)

  // Send email notification
  await sendEmail(customer.email, 'payment_failed', {
    updatePaymentUrl: 'https://yourapp.com/billing'
  })

  // Don't immediately revoke access - Stripe retries for 3 weeks
}
```

### Step 2: Register Webhook with Stripe

**Development (local testing):**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhook

# This gives you a webhook secret like whsec_xxxxxxxxxxxxx
# Add to .env:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Production:**
1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy signing secret to production env vars

---

## Part 5: Customer Portal (Self-Service - 30 minutes)

Let customers manage their own billing without contacting support.

```javascript
// Backend: Create portal session
app.post('/create-portal-session', async (req, res) => {
  const { customerId } = req.body

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.DOMAIN}/dashboard`
  })

  res.json({ url: session.url })
})
```

```javascript
// Frontend: Link to customer portal
<button onclick="openBillingPortal()">
  Manage Subscription
</button>

<script>
async function openBillingPortal() {
  const response = await fetch('/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: currentUser.stripeCustomerId
    })
  })

  const { url } = await response.json()
  window.location.href = url
}
</script>
```

**What customers can do in portal:**
- Update payment method
- Change subscription plan
- Cancel subscription
- View invoices
- Download receipts

**Configure portal:**
Dashboard → Settings → Billing → Customer portal
- Enable plan switching
- Set cancelation flow (immediate vs. end of period)
- Customize branding

---

## Part 6: Advanced Features

### Usage-Based Pricing

```javascript
// For API products - report usage to Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// When customer makes API request
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: 1, // 1 API call
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment'
  }
)

// Stripe bills based on usage at end of period
```

### Proration (Plan Changes)

```javascript
// Upgrade/downgrade with automatic proration
await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItemId,
    price: newPriceId
  }],
  proration_behavior: 'create_prorations' // or 'none', 'always_invoice'
})
```

### Free Trials

```javascript
// Method 1: Trial period
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14,
  trial_settings: {
    end_behavior: {
      missing_payment_method: 'cancel' // Cancel if no payment method added
    }
  }
})

// Method 2: Trial without card (requires webhook handling)
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_end: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60)
})
```

### Coupons & Discounts

```javascript
// Create coupon
const coupon = await stripe.coupons.create({
  percent_off: 20,
  duration: 'repeating',
  duration_in_months: 3,
  name: 'LAUNCH20'
})

// Apply to subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  coupon: coupon.id
})
```

### Metered Billing

```javascript
// Create metered price
const price = await stripe.prices.create({
  product: productId,
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
    aggregate_usage: 'sum'
  },
  billing_scheme: 'tiered',
  tiers: [
    { up_to: 1000, unit_amount: 0 }, // First 1K free
    { up_to: 10000, unit_amount: 100 }, // $1 per 1K
    { up_to: 'inf', unit_amount: 50 } // $0.50 per 1K after 10K
  ],
  tiers_mode: 'graduated'
})
```

---

## Part 7: Testing

### Test Cards

```
Success: 4242 4242 4242 4242
3D Secure: 4000 0027 6000 3184
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

Any future expiry, any CVC, any ZIP.

### Test Scenarios

```javascript
// Test subscription flow
// 1. Create checkout session
// 2. Use test card
// 3. Verify webhook received
// 4. Check database updated
// 5. Verify user has access

// Test failed payment
// 1. Subscribe with 4000 0000 0000 0341 (attaches but fails later)
// 2. Trigger webhook manually
// 3. Verify email sent
// 4. Verify access not immediately revoked

// Test cancelation
// 1. Create subscription
// 2. Open customer portal
// 3. Cancel subscription
// 4. Verify webhook received
// 5. Check access revoked at period end
```

---

## Part 8: Going Live

### Checklist

- [ ] Activate Stripe account (Dashboard → Activate)
- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real card (your own)
- [ ] Set up payout schedule (daily, weekly, monthly)
- [ ] Add business branding (Dashboard → Settings → Branding)
- [ ] Configure email receipts (Dashboard → Settings → Emails)
- [ ] Set up tax calculation (Stripe Tax - optional)
- [ ] Review dispute settings
- [ ] Enable fraud detection (Radar)

### Security Best Practices

```javascript
// 1. Never expose secret key
// Store in environment variables only

// 2. Verify webhook signatures
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)

// 3. Use HTTPS only
// 4. Validate amounts server-side
// 5. Log all payment events
// 6. Set up alerts for failed payments

// 7. PCI compliance (if using Stripe Elements, you're mostly covered)
```

---

## Common Issues & Solutions

### Issue: Webhook not receiving events
**Solution:**
- Check endpoint URL is publicly accessible
- Verify webhook secret matches
- Check server logs for errors
- Use Stripe CLI for local testing

### Issue: Payment succeeded but user doesn't have access
**Solution:**
- Check webhook handler updated database
- Verify subscription ID stored correctly
- Check for race conditions (webhook vs. redirect)

### Issue: Customer sees "Card declined"
**Solutions:**
- Ask them to check with their bank
- Try different payment method
- Enable more payment methods (Apple Pay, etc.)
- Could be fraud detection - review in Dashboard

### Issue: Proration confusion
**Solution:**
- Show preview before plan change
- Document proration in FAQHow to calculate:
```javascript
const invoice = await stripe.invoices.retrieveUpcoming({
  customer: customerId,
  subscription: subscriptionId,
  subscription_items: [{
    id: subscriptionItemId,
    price: newPriceId
  }]
})
// Show invoice.total to customer before confirming
```

---

## Monitoring & Analytics

### Key Metrics to Track

```javascript
// In your dashboard/admin panel:

// 1. MRR (Monthly Recurring Revenue)
SELECT SUM(amount) FROM subscriptions WHERE status = 'active'

// 2. Churn rate
SELECT COUNT(canceled) / COUNT(total) FROM subscriptions

// 3. Failed payments
SELECT COUNT(*) FROM invoices WHERE status = 'payment_failed'

// 4. Average revenue per customer
SELECT AVG(amount) FROM subscriptions WHERE status = 'active'
```

### Stripe Dashboard Metrics

Monitor these daily:
- New subscriptions
- Churned subscriptions
- Failed payments
- Disputes/chargebacks
- Revenue trends

---

## Next Steps

1. **Implement basic flow** (Checkout → Webhook → Access)
2. **Test thoroughly** with test cards
3. **Go live** with simple pricing
4. **Add features** as you grow:
   - Customer portal
   - Multiple plans
   - Annual billing
   - Usage-based pricing
5. **Monitor and optimize** based on data

---

## Resources

**Official:**
- Stripe Docs: stripe.com/docs
- Stripe API Reference: stripe.com/docs/api
- Testing: stripe.com/docs/testing

**Libraries:**
- Node.js: github.com/stripe/stripe-node
- Python: github.com/stripe/stripe-python
- Ruby: github.com/stripe/stripe-ruby
- PHP: github.com/stripe/stripe-php

**Tools:**
- Stripe CLI: stripe.com/docs/stripe-cli
- Postman Collection: stripe.com/docs/postman

**Community:**
- Stack Overflow: stackoverflow.com/questions/tagged/stripe-payments
- Discord: stripe.com/discord

---

**Remember:** Start simple. Stripe Checkout + Webhooks covers 90% of SaaS needs. Add complexity only when needed.
