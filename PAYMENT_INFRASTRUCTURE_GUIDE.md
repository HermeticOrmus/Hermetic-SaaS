# Payment Infrastructure Setup Guide
## Complete Guide to Accepting Payments for HermeticSaaS

**Version**: 1.0
**Last Updated**: 2025-11-11
**Recommended**: Lemon Squeezy (easiest) or Stripe (most powerful)

---

## Platform Comparison

### Lemon Squeezy (Recommended for Framework Sales)

**Pros**:
- ✅ Merchant of record (they handle all tax/VAT)
- ✅ No Stripe account needed
- ✅ Built-in affiliate system
- ✅ Easy webhooks for automation
- ✅ No monthly fees (just 5% + payment processing)
- ✅ Great for digital products

**Cons**:
- ❌ 5% fee (higher than Stripe's 2.9%)
- ❌ Less customization
- ❌ Newer platform (less established)

**Best for**: Framework sales, courses, digital products

---

### Stripe (Recommended for MicroSaaS Products)

**Pros**:
- ✅ Industry standard (trusted)
- ✅ Lower fees (2.9% + 30¢)
- ✅ Powerful API (full control)
- ✅ Subscriptions built-in
- ✅ Customer portal included
- ✅ Extensive documentation

**Cons**:
- ❌ You handle tax/VAT (complex internationally)
- ❌ More setup required
- ❌ Monthly fees for some features

**Best for**: SaaS subscriptions, recurring revenue, custom checkout flows

---

## Option 1: Lemon Squeezy Setup (For Framework Sales)

### Step 1: Create Account (10 minutes)
1. Go to https://lemonsqueezy.com
2. Sign up with email
3. Verify email address
4. Complete seller profile:
   - Business name: "HermeticSaaS" or your name
   - Country: Your location
   - Tax information: Provide tax ID if applicable

### Step 2: Create Store (5 minutes)
1. Click "Create Store"
2. Store name: "HermeticSaaS"
3. Store URL: hermetic-saas.lemonsqueezy.com
4. Currency: USD (or your preference)
5. Save store settings

### Step 3: Create Products (15 minutes)

**Product 1: Standard License**
```
Name: HermeticSaaS Framework - Standard License
Description: Complete MicroSaaS framework with 210+ files, 38 AI agents,
            and lifetime updates. Perfect for indie hackers and solo founders.

Price: $997 (or $497 for launch pricing)
Type: One-time payment
Tax Category: Digital goods

Media:
- Product image (framework screenshot)
- PDF: Quick start guide
- PDF: License agreement

Checkout settings:
✅ Collect email
✅ Collect name
❌ Collect billing address (Lemon Squeezy handles tax automatically)
```

**Product 2: Agency License**
```
Name: HermeticSaaS Framework - Agency License
Description: Everything in Standard plus commercial license, white-label
            rights, and priority support. For agencies and teams.

Price: $2,997/year
Type: Subscription (annual)
Trial: No trial (offer demo call instead)

Media:
- Product image
- PDF: Agency resources pack
- PDF: Commercial license agreement
```

**Product 3: Enterprise License**
```
Name: HermeticSaaS Framework - Enterprise License
Description: Custom agent training, 1-on-1 consulting, and resale rights.
            Contact for custom pricing.

Price: $9,997/year
Type: Subscription (annual)
Note: Add "Contact us" button instead of checkout (qualify leads first)
```

### Step 4: Set Up Payment Methods (5 minutes)
1. Go to Settings → Payment methods
2. Enable:
   - ✅ Credit/debit cards (Stripe Connect)
   - ✅ PayPal
   - ✅ Apple Pay / Google Pay

3. Connect payout account:
   - Bank account (ACH - recommended, free)
   - Or PayPal (3% fee)

### Step 5: Configure Webhooks (20 minutes)

**Why webhooks?** Auto-deliver GitHub access when someone buys

1. Go to Settings → Webhooks
2. Click "Add endpoint"
3. URL: https://your-automation-url.com/lemon-squeezy-webhook
   (We'll set this up with Zapier/Make.com next)

4. Select events:
   - ✅ `order_created` (new purchase)
   - ✅ `subscription_created` (new subscription)
   - ✅ `subscription_payment_success` (renewal)
   - ✅ `subscription_cancelled` (user cancels)

5. Copy webhook secret (save it somewhere safe)

### Step 6: Automate GitHub Invitations

**Option A: Using Zapier** (Easiest, no code)

1. Create Zapier account (free tier works)
2. New Zap:
   - Trigger: Lemon Squeezy → Order Created
   - Action: GitHub → Invite User to Repository

3. Configure trigger:
   - Connect Lemon Squeezy account
   - Select your store
   - Test trigger (make test purchase)

4. Configure action:
   - Connect GitHub account
   - Repository: your-private-hermetic-saas-repo
   - Email: {{customer_email}} from trigger
   - Permission: Read

5. Add second action:
   - Email by Zapier → Send Email
   - To: {{customer_email}}
   - Subject: "Your HermeticSaaS Access"
   - Body: Welcome email with GitHub link and instructions

6. Test and turn on

**Option B: Using Make.com** (More powerful, free tier)
Same process as Zapier but with more customization options

**Option C: Custom Script** (Full control, requires coding)
```javascript
// Example webhook handler (Next.js API route)
// pages/api/webhooks/lemonsqueezy.js

import crypto from 'crypto';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const signature = req.headers['x-signature'];
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { meta, data } = req.body;

  if (meta.event_name === 'order_created') {
    const customerEmail = data.attributes.user_email;
    const productName = data.attributes.first_order_item.product_name;

    // Invite to GitHub repo
    try {
      await octokit.repos.addCollaborator({
        owner: 'your-username',
        repo: 'hermetic-saas-framework',
        username: customerEmail, // or fetch GitHub username
        permission: 'pull', // read-only
      });

      // Send welcome email (using Resend, SendGrid, etc.)
      await sendWelcomeEmail(customerEmail, productName);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      return res.status(500).json({ error: 'Failed to add to repo' });
    }
  }

  return res.status(200).json({ received: true });
}
```

### Step 7: Create Checkout Links (5 minutes)
1. Go to each product → "Get checkout URL"
2. Copy URL (e.g., hermetic-saas.lemonsqueezy.com/checkout/buy/...)
3. Optional: Create custom domain (checkout.hermetic-saas.com)
   - Settings → Checkout → Custom domain
   - Add CNAME record: checkout → lemonsqueezy.com
4. Add checkout URLs to your landing page CTA buttons

### Step 8: Set Up Affiliate Program (15 minutes)
1. Go to Settings → Affiliates
2. Enable affiliate program
3. Commission: 30% (industry standard for digital products)
4. Cookie duration: 30 days
5. Minimum payout: $50
6. Create affiliate sign-up page URL
7. Add to EMAIL_SEQUENCES.md → Affiliate Recruitment sequence

### Step 9: Test Everything (30 minutes)
1. Make test purchase using test card:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

2. Verify:
   - ✅ Payment processes successfully
   - ✅ Confirmation email sent
   - ✅ Webhook triggers
   - ✅ GitHub invitation sent
   - ✅ Customer receives access

3. Refund test purchase:
   - Go to Orders → Test order → Refund
   - Verify refund processes
   - Verify GitHub access revoked (if automated)

---

## Option 2: Stripe Setup (For MicroSaaS Products)

### Step 1: Create Stripe Account (15 minutes)
1. Go to https://stripe.com
2. Sign up with email
3. Verify email
4. Complete business profile:
   - Business type: Individual or Company
   - Industry: Software
   - Website: your-product.com
   - Business description: Describe your MicroSaaS

5. Add bank account for payouts
6. Verify identity (provide SSN/EIN if in US)

### Step 2: Enable Payment Methods (5 minutes)
1. Dashboard → Settings → Payment methods
2. Enable:
   - ✅ Cards (enabled by default)
   - ✅ Apple Pay / Google Pay
   - ✅ Link (Stripe's one-click checkout)
   - ❌ Bank debits (optional, slower)
   - ❌ Crypto (probably not needed)

### Step 3: Create Products & Prices (10 minutes)

**In Stripe Dashboard:**
1. Products → Add product

**Example: Feedback Widget SaaS**
```
Product 1: Basic Plan
- Name: Basic Plan
- Description: For small projects with up to 100 feedback items/month
- Pricing: $19/month (recurring)
- Billing period: Monthly
- Trial period: 14 days free trial

Product 2: Pro Plan
- Name: Pro Plan
- Description: For growing products with unlimited feedback
- Pricing: $49/month (recurring)
- Or: $470/year (save $118/year)
- Billing period: Monthly or Annual
- Trial period: 14 days free trial

Product 3: Lifetime Deal
- Name: Lifetime Access
- Description: One-time payment, lifetime access
- Pricing: $299 (one-time)
- Billing period: One-time
```

### Step 4: Set Up Customer Portal (10 minutes)

Stripe's built-in customer portal lets users:
- View/download invoices
- Update payment method
- Upgrade/downgrade plans
- Cancel subscription

**Setup:**
1. Dashboard → Settings → Billing → Customer portal
2. Configure:
   - ✅ Allow subscription cancellation
   - ✅ Allow plan changes
   - ✅ Allow payment method updates
   - Cancellation flow: Ask for feedback (optional survey)
   - Proration: Charge immediately for upgrades, credit for downgrades

3. Customize branding:
   - Logo
   - Brand color
   - Privacy policy URL
   - Terms of service URL

4. Save settings
5. Get portal URL: https://billing.stripe.com/p/login/...

### Step 5: Integrate with Next.js App (45 minutes)

**Install Stripe SDK:**
```bash
npm install stripe @stripe/stripe-js
```

**Create API routes:**

```javascript
// pages/api/create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { priceId } = req.body;

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        subscription_data: {
          trial_period_days: 14,
        },
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

```javascript
// pages/api/webhooks/stripe.js
import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Provision access (e.g., add to database, send welcome email)
        await provisionAccess(session.customer, session.subscription);
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        // Revoke access
        await revokeAccess(subscription.customer);
        break;

      case 'invoice.payment_failed':
        // Handle failed payment (send email, retry, etc.)
        await handleFailedPayment(event.data.object);
        break;
    }

    res.json({ received: true });
  }
}

async function provisionAccess(customerId, subscriptionId) {
  // Add user to database with active subscription
  // Send welcome email
  // Grant access to product
}

async function revokeAccess(customerId) {
  // Update database - set subscription to inactive
  // Send cancellation email
  // Remove product access
}

async function handleFailedPayment(invoice) {
  // Send email to customer
  // Retry payment (Stripe does this automatically)
  // If multiple failures, suspend account
}
```

**Frontend checkout button:**
```jsx
// components/PricingCard.jsx
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PricingCard({ priceId, planName }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) console.error(error);
  };

  return (
    <button onClick={handleCheckout}>
      Subscribe to {planName}
    </button>
  );
}
```

### Step 6: Set Up Webhooks (15 minutes)
1. Dashboard → Developers → Webhooks
2. Add endpoint:
   - URL: https://your-domain.com/api/webhooks/stripe
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. Copy webhook secret
4. Add to environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Step 7: Test Mode (30 minutes)
1. Use test mode (toggle in dashboard)
2. Test cards: https://stripe.com/docs/testing
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
   - 3D Secure: 4000 0027 6000 3184

3. Test flows:
   - ✅ Successful subscription
   - ✅ Failed payment
   - ✅ Subscription upgrade
   - ✅ Subscription cancellation
   - ✅ Customer portal access

4. Verify webhooks fire correctly

### Step 8: Go Live (10 minutes)
1. Switch to live mode (toggle in dashboard)
2. Update API keys in environment:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`

3. Verify live webhooks are configured
4. Make small test purchase with real card
5. Refund test purchase

---

## Tax & Compliance

### Lemon Squeezy (Merchant of Record)
- ✅ Lemon Squeezy handles ALL tax (VAT, sales tax, GST)
- ✅ They remit to governments
- ✅ You receive clean payouts
- ✅ No tax forms to file (except your country's income tax)
- **Recommended for**: International sales, complexity avoidance

### Stripe (You Handle Tax)
- ❌ You're responsible for tax collection and remittance
- Use Stripe Tax (automated):
  - Dashboard → Settings → Tax → Enable Stripe Tax
  - $0.50 per transaction + automatic calculation
  - Covers 40+ countries
  - Still need to file/remit yourself

- **Nexus rules** (US):
  - If you have "nexus" (physical presence/significant sales) in a state, you must collect sales tax
  - Threshold: Usually $100K sales or 200 transactions/year per state
  - Solution: Stripe Tax + sales tax filing service ($50-200/month)

- **VAT rules** (EU):
  - If selling to EU customers, you need to:
    - Charge VAT (rate depends on customer's country)
    - File VAT returns quarterly
  - Solution: OSS (One-Stop-Shop) registration
  - Or: Use Lemon Squeezy instead

**Recommendation**: Start with Lemon Squeezy if selling internationally. Switch to Stripe only if you need advanced features.

---

## Refund Policy & Management

### Recommended Refund Policy
```
30-Day Money-Back Guarantee

If you're not satisfied with HermeticSaaS for any reason,
email us within 30 days of purchase for a full refund.

No questions asked. No hard feelings.

Email: refunds@hermetic-saas.com
Response time: Within 24 hours
```

### Handling Refunds

**Lemon Squeezy:**
1. Dashboard → Orders → Find order
2. Click "Refund"
3. Full or partial refund
4. Send email to customer
5. Revoke GitHub access (manual or automated)

**Stripe:**
1. Dashboard → Payments → Find payment
2. Click "Refund"
3. Full or partial refund
4. Webhook fires: `charge.refunded`
5. Auto-revoke access in webhook handler

**Response Template:**
```
Subject: Your HermeticSaaS Refund

Hey [Name],

I've processed your refund of $[amount]. You should see it in 5-10 business days.

Before you go - I'm curious (totally optional to answer):
• What were you hoping to achieve with HermeticSaaS?
• Where did it fall short?
• Is there anything I could add/change that would make it valuable?

Your feedback helps me improve for everyone.

Either way, thanks for giving it a shot. If you ever want to come back,
I'll honor your original price.

Best,
[Your Name]
```

---

## Security Best Practices

1. **Never commit API keys to git**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Verify webhook signatures**
   - Always verify Stripe/Lemon Squeezy signatures
   - Prevents fake webhook attacks

3. **Use HTTPS only**
   - Redirect HTTP → HTTPS
   - Webhooks require HTTPS

4. **Limit API key permissions**
   - Create restricted keys (read-only for dashboards)
   - Rotate keys if exposed

5. **Log everything**
   - Log all transactions
   - Log webhook events
   - Monitor for unusual activity

6. **PCI compliance**
   - Never store credit card numbers
   - Use Stripe Elements (built-in compliance)
   - Let Stripe handle all card data

---

## Troubleshooting Common Issues

### Webhook not firing
- Check webhook URL is correct and accessible
- Verify HTTPS (not HTTP)
- Check webhook secret matches
- Look at webhook logs in Stripe/Lemon Squeezy dashboard

### Payment declined
- Customer's card declined (not your fault)
- Send auto-email: "Update payment method"
- Stripe retries failed payments automatically (Smart Retries)

### Double charging
- Webhook processed twice
- Implement idempotency (check if already processed)
- Use `event.id` as unique identifier

### Subscription not canceling
- Check webhook is processing `customer.subscription.deleted`
- Verify customer portal is configured correctly
- Test in Stripe dashboard manually

---

## Metrics to Track

### Revenue Metrics
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Customer Lifetime Value)

### Health Metrics
- Churn rate (monthly)
- Failed payment rate
- Refund rate
- Upgrade/downgrade ratio

### Stripe Dashboard
- Dashboard → Reports → Overview
- Set up email reports (weekly)

### Custom Dashboard
- Build using Stripe API
- Show MRR, churn, customer count
- See MONETIZATION_STRATEGY.md for template

---

## Next Steps

1. ✅ Choose platform (Lemon Squeezy for framework, Stripe for MicroSaaS)
2. ✅ Set up account
3. ✅ Create products/pricing
4. ✅ Configure webhooks
5. ✅ Automate GitHub delivery
6. ✅ Test thoroughly
7. ✅ Go live
8. ✅ Monitor and optimize

**You're now ready to accept payments! 💰**
