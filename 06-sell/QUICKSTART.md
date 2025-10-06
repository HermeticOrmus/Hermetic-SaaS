# 06-SELL Quick Start Guide

**Get from idea to revenue in 4 weeks.**

---

## Week 1: Set Your Price (Day 1-7)

### Day 1-2: Research & Calculate

1. **Read the methodology:**
   - `pricing-frameworks/value-based-pricing-methodology.md`

2. **Calculate value you create:**
   ```
   What problem do you solve?
   What does that problem cost customers now?
   What's the value of solving it?

   Example:
   - Problem: Manual data entry takes 10 hours/week
   - Cost: 10 hrs × $50/hr = $500/week = $2,000/month
   - Your price: 10-20% of value = $200-400/month
   ```

3. **Research competitors:**
   - What do similar products charge?
   - Create comparison spreadsheet
   - Find your positioning (cheaper? better? different?)

### Day 3-4: Interview Customers

**Ask 10+ potential customers:**
- "How much does [problem] cost you?"
- "What would solving this be worth?"
- "At what price would this be expensive but fair?"
- "At what price would this be too cheap to trust?"

**Template email:**
```
Subject: Quick pricing feedback?

Hi [Name],

I'm building [product] to help [solve problem].

Would you have 15 minutes for a quick call? I'd love your input on
pricing and features.

No sales pitch - just genuinely want to understand what would be
valuable to people like you.

[Calendar link]

Thanks,
[Your name]
```

### Day 5-6: Choose Pricing Model

**Pick from templates:**
- `pricing-frameworks/pricing-tier-templates.md`

**Most common for SaaS:**
```
FREE          PRO              ENTERPRISE
$0/mo         $99/mo           Custom
For trying    For teams        For companies
Limited       Full features    + Enterprise features
```

**Key decisions:**
- [ ] Free tier or trial? (Trial for B2B, Free for viral products)
- [ ] Per-seat or flat rate? (Per-seat if team tool)
- [ ] Monthly only or annual? (Offer both, push annual with 15-20% discount)

### Day 7: Create Pricing Page

**Use this structure:**
```html
1. Header: "Simple, transparent pricing"

2. Toggle: [Monthly] [Annual - Save 20%]

3. Three tiers displayed horizontally
   - Highlight middle tier ("Most Popular")
   - Clear CTA on each ("Start Free Trial")

4. Feature comparison table

5. FAQ section (below pricing)
   - Can I change plans?
   - What payment methods?
   - How does cancellation work?
   - Is there a contract?

6. Trust signals
   - "30-day money-back guarantee"
   - "No credit card required for trial"
```

**Checklist:**
- [ ] Pricing is clear ($X/month, no "contact us" for basic tiers)
- [ ] Annual discount shown (Save $X/year)
- [ ] Social proof ("10,000+ teams trust us")
- [ ] FAQ answers common objections
- [ ] CTA on every tier

---

## Week 2: Accept Payments (Day 8-14)

### Day 8-9: Choose Payment Provider

**Decision tree:**
```
Want to handle tax yourself?
├─ YES → Stripe (best for most SaaS)
└─ NO → LemonSqueezy (merchant of record)
```

**For 90% of SaaS: Use Stripe**
- Best subscription management
- Excellent documentation
- Industry standard

### Day 10-12: Integrate Stripe

**Follow guide:**
- `payment-integrations/stripe-setup-guide.md`

**Quick implementation (2-4 hours):**

```javascript
// 1. Install Stripe
npm install stripe

// 2. Create checkout session (backend)
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

app.post('/create-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: 'price_xxxxx', // Your price ID from Stripe
      quantity: 1
    }],
    success_url: 'https://yourapp.com/success',
    cancel_url: 'https://yourapp.com/pricing'
  })

  res.json({ url: session.url })
})

// 3. Redirect to Stripe (frontend)
async function handleUpgrade() {
  const response = await fetch('/create-checkout', { method: 'POST' })
  const { url } = await response.json()
  window.location.href = url
}
```

**That's it!** Stripe handles the rest.

### Day 13: Set Up Webhooks

**Critical for managing subscriptions:**

```javascript
app.post('/webhook/stripe', async (req, res) => {
  const event = req.body

  switch (event.type) {
    case 'customer.subscription.created':
      // Give user access
      await grantAccess(event.data.object.customer)
      break

    case 'customer.subscription.deleted':
      // Revoke user access
      await revokeAccess(event.data.object.customer)
      break

    case 'invoice.payment_failed':
      // Send email reminder
      await sendPaymentFailedEmail(event.data.object.customer)
      break
  }

  res.json({ received: true })
})
```

### Day 14: Test & Launch

**Test with Stripe test cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

**Pre-launch checklist:**
- [ ] Tested successful payment
- [ ] Tested failed payment
- [ ] Webhooks working (user gets access)
- [ ] Email receipts configured
- [ ] Refund policy written
- [ ] Terms of service updated
- [ ] Privacy policy updated

**Launch:**
- Switch to live Stripe keys
- Test with your own card
- Announce to early users

---

## Week 3: Optimize Conversion (Day 15-21)

### Day 15-16: Landing Page Optimization

**Use checklist:**
- `conversion-playbooks/landing-page-checklist.md`

**Quick wins (implement today):**

1. **Clear headline with benefit:**
   - ❌ "Welcome to TaskFlow"
   - ✅ "Ship projects 2x faster without status meetings"

2. **Add social proof to hero:**
   ```html
   <p>Trusted by 1,000+ teams at Stripe, Vercel, and Linear</p>
   ```

3. **Show product immediately:**
   - Screenshot or demo video above fold
   - Not stock photos

4. **Simplify signup:**
   - Email only (not name, company, etc.)
   - Or better: Sign in with Google

5. **Add guarantee:**
   - "14-day free trial. No credit card required."
   - "30-day money-back guarantee"

**Measure:**
```javascript
analytics.track('landing_page_viewed')
analytics.track('signup_clicked')
analytics.track('signup_completed')

// Target: 30-40% visitor → signup
```

### Day 17-18: Welcome Email Sequence

**Set up automated emails:**
- `conversion-playbooks/trial-to-paid-email-sequence.md`

**Minimum sequence (3 emails):**

```
Email 1 (Day 0): Welcome
→ Subject: "Welcome! Here's how to get started"
→ Goal: Drive to first "Aha Moment"

Email 2 (Day 3): Pricing intro
→ Subject: "What happens after your trial"
→ Goal: Introduce pricing (no surprise later)

Email 3 (Day 13): Trial ending
→ Subject: "Your trial ends tomorrow"
→ Goal: Convert to paid
```

**Use code example:**
- `sales-automations/email-automation-starter.js`

### Day 19-20: In-App Upgrade Prompts

**Show upgrade prompt when users hit limits:**

```javascript
// When user tries to create 6th project (limit is 5)
if (user.plan === 'free' && user.projectCount >= 5) {
  showModal({
    title: "You're growing!",
    message: "Upgrade to Pro for unlimited projects",
    cta: "Upgrade Now - $99/month",
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced features"
    ]
  })
}
```

**Trigger points:**
- Project limit reached
- Team size limit reached
- Storage limit reached
- Feature they can't access

### Day 21: Analytics Setup

**Track key events:**
```javascript
// Landing page
analytics.track('page_viewed', { page: '/pricing' })

// Signup flow
analytics.track('signup_started')
analytics.track('signup_completed')

// Activation
analytics.track('first_project_created')
analytics.track('first_team_member_invited')

// Conversion
analytics.track('checkout_started')
analytics.track('checkout_completed')
```

**Calculate funnel:**
```
Landing page views: 1,000
Signups: 400 (40%)
Activated: 300 (75% of signups)
Trial started: 200
Paid: 50 (25% of trials)

Overall: 5% visitor → customer
```

---

## Week 4: Automate Sales (Day 22-28)

### Day 22-23: Email Automation Setup

**Choose email service:**
- Resend (best for developers)
- Loops (best for simplicity)
- Customer.io (best for power users)

**Set up sequences:**
1. Welcome sequence (3-5 emails)
2. Trial conversion sequence (5-8 emails)
3. Onboarding tips (ongoing)

**Use starter code:**
```javascript
// Copy from: sales-automations/email-automation-starter.js

import { sendWelcomeEmail } from './email-automation-starter'

// On user signup
app.post('/api/signup', async (req, res) => {
  const user = await createUser(req.body)
  await sendWelcomeEmail(user)
  res.json({ success: true })
})
```

### Day 24-25: Trial Reminders

**Automate trial expiration emails:**

```javascript
// Run daily at 9am
cron.schedule('0 9 * * *', async () => {
  // 3 days before trial ends
  const threeDayUsers = await getTrialUsers({ daysLeft: 3 })
  for (const user of threeDayUsers) {
    await sendEmail(user, 'trial-3-days-left')
  }

  // 1 day before
  const oneDayUsers = await getTrialUsers({ daysLeft: 1 })
  for (const user of oneDayUsers) {
    await sendEmail(user, 'trial-1-day-left')
  }

  // Expired today
  const expiredUsers = await getTrialUsers({ daysLeft: 0 })
  for (const user of expiredUsers) {
    await sendEmail(user, 'trial-expired')
  }
})
```

### Day 26-27: Failed Payment Recovery

**Automate payment retry emails:**

```javascript
// Stripe webhook handler
app.post('/webhook/stripe', async (req, res) => {
  const event = req.body

  if (event.type === 'invoice.payment_failed') {
    const customer = event.data.object.customer

    // Send immediate email
    await sendEmail(customer, 'payment-failed', {
      amount: event.data.object.amount_due,
      updateUrl: 'https://yourapp.com/billing'
    })

    // Schedule follow-up in 3 days
    await scheduleEmail(customer, 'payment-failed-reminder', {
      sendIn: 3 * 24 * 60 * 60 * 1000 // 3 days
    })
  }

  res.json({ received: true })
})
```

**Impact:** Recover 30-40% of failed payments

### Day 28: Metrics Dashboard

**Track these weekly:**

```javascript
const metrics = {
  // Traffic
  visitors: 1000,
  signups: 400,              // 40%
  activated: 300,            // 75%

  // Revenue
  trials: 100,
  paid: 25,                  // 25% trial conversion
  mrr: 2475,                 // $99 × 25

  // Retention
  churn: 1,                  // Lost 1 customer
  churnRate: 4               // 4% monthly
}
```

**Create simple dashboard:**
```javascript
// Get stats from database
app.get('/admin/metrics', async (req, res) => {
  const metrics = {
    signups: await db.users.count(),
    trials: await db.users.count({ where: { status: 'trial' }}),
    paid: await db.users.count({ where: { status: 'active' }}),
    mrr: await calculateMRR()
  }

  res.json(metrics)
})
```

---

## Launch Checklist

**Before you launch monetization:**

### Legal
- [ ] Terms of Service written
- [ ] Privacy Policy written
- [ ] Refund policy decided (30 days recommended)
- [ ] Business entity formed (for Stripe)

### Technical
- [ ] Payment integration tested
- [ ] Webhooks working correctly
- [ ] Email automation set up
- [ ] Analytics tracking implemented
- [ ] Security reviewed (HTTPS, data encryption)

### Marketing
- [ ] Pricing page live
- [ ] Landing page optimized
- [ ] Social proof added (testimonials, logos)
- [ ] FAQ section written
- [ ] Launch announcement ready

### Support
- [ ] Support email set up (required by Stripe)
- [ ] FAQ documentation written
- [ ] Refund process defined
- [ ] Cancellation process defined

---

## First Month Goals

**Realistic targets for first month:**

```
Traffic: 1,000 visitors
Signups: 300 (30% conversion)
Activated: 225 (75% activation)
Trials: 150
Paid: 30 (20% trial conversion)
MRR: $2,970 (at $99/month)
```

**If you're below these:**
- Landing page conversion < 30%: Optimize headline, social proof, CTA
- Activation < 75%: Simplify onboarding, get to value faster
- Trial conversion < 20%: Improve email sequence, add urgency

**If you're above these:**
- You might be underpriced (raise prices!)
- Double down on what's working
- Scale acquisition

---

## Next Steps After Launch

### Month 2: Optimize
- A/B test landing page elements
- Improve email sequences
- Add more upgrade prompts
- Reduce churn points

### Month 3: Scale
- Increase traffic (SEO, content, ads)
- Add annual plans
- Implement referral program
- Expand to new customer segments

### Month 6: Expand
- Add higher-tier pricing
- Build enterprise features
- Introduce usage-based pricing
- Launch partnerships

---

## Common Mistakes to Avoid

1. **Pricing too low**
   - If < 20% complain about price, you're too cheap
   - Double your prices and see what happens

2. **Complex pricing**
   - Simple wins: One number, clear value
   - Save complex pricing for later

3. **No free trial**
   - B2B needs 14-day trial minimum
   - "No credit card required" increases signups 2-3x

4. **Waiting too long to monetize**
   - Add payments from day 1
   - Test willingness to pay early

5. **Not tracking metrics**
   - Can't optimize what you don't measure
   - Track every step of the funnel

---

## Resources Quick Links

**Pricing:**
- Value-based pricing: `pricing-frameworks/value-based-pricing-methodology.md`
- Pricing templates: `pricing-frameworks/pricing-tier-templates.md`
- Psychology: `pricing-frameworks/pricing-psychology-guide.md`

**Payments:**
- Stripe guide: `payment-integrations/stripe-setup-guide.md`
- Provider comparison: `payment-integrations/README.md`

**Conversion:**
- Landing page: `conversion-playbooks/landing-page-checklist.md`
- Email sequence: `conversion-playbooks/trial-to-paid-email-sequence.md`

**Automation:**
- Sales automation: `sales-automations/README.md`
- Email code: `sales-automations/email-automation-starter.js`

---

## Support

**Questions?**
- Review the detailed guides in each directory
- All guides include code examples and benchmarks
- Follow the Hermetic principles: transparent, honest, fair

**Remember:** Monetization is not just about making money. It's about creating sustainable value exchange. Charge what you're worth, be transparent, and treat customers fairly.

**Now go build and ship.**
