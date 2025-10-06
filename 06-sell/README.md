# 06-SELL: Sales & Monetization Infrastructure

**Turn users into revenue.** This phase covers everything from pricing strategy to payment integration to conversion optimization.

---

## Philosophy: Ethical Monetization

**Hermetic Principle:** Make money by creating value, not extracting it.

- ✅ Transparent pricing (no hidden fees)
- ✅ Fair value exchange (customer wins, you win)
- ✅ Easy cancellation (no dark patterns)
- ✅ Honest marketing (no fake scarcity)
- ✅ Clear communication (no surprises)

**If you can't sell your product honestly, fix your product, not your sales tactics.**

---

## Directory Structure

```
06-sell/
├── pricing-frameworks/          # How to price your SaaS
│   ├── README.md               # Pricing strategy overview
│   ├── pricing-psychology-guide.md
│   ├── pricing-tier-templates.md
│   ├── usage-based-calculator.js
│   └── value-based-pricing-methodology.md
│
├── payment-integrations/        # Accept payments
│   ├── README.md               # Payment provider comparison
│   ├── stripe-setup-guide.md   # Complete Stripe integration
│   ├── paddle-integration.md   # Merchant of record
│   ├── lemonsqueezy-quickstart.md
│   └── crypto-payments.md
│
├── conversion-playbooks/        # Turn visitors into customers
│   ├── README.md               # Conversion optimization overview
│   ├── landing-page-checklist.md
│   ├── onboarding-templates/
│   ├── trial-to-paid-email-sequence.md
│   └── freemium-upgrade-strategies.md
│
└── sales-automations/           # Scale without salespeople
    ├── README.md               # Sales automation overview
    ├── email-sequences/
    ├── lead-scoring.js
    ├── churn-prevention.js
    └── revenue-dashboard.js
```

---

## The Hermetic Sales Funnel

```
Traffic → Sign Up → Activation → Trial → Paid → Retained
  ↓         ↓          ↓           ↓       ↓        ↓
 (10K)    (4K)       (3K)       (800)   (200)    (190)

 40%      75%        27%        25%     95%

Overall: 2% visitor to paid customer
Goal: Optimize each step
```

**Your job:** Increase conversion at each step.

---

## Quick Start Guide

### Week 1: Pricing Strategy

**Goal:** Determine what to charge

1. **Read:** `pricing-frameworks/value-based-pricing-methodology.md`
2. **Calculate:** Value you create for customers
3. **Research:** Interview 10+ potential customers about willingness to pay
4. **Decide:** Choose pricing model and tiers
5. **Document:** Fill out pricing template

**Output:** Pricing page ready to ship

**Benchmark:** $99/mo for B2B SaaS is a good starting point

---

### Week 2: Payment Setup

**Goal:** Accept money

1. **Choose:** Payment provider (Stripe for most)
2. **Follow:** `payment-integrations/stripe-setup-guide.md`
3. **Integrate:** Checkout flow (2-4 hours with Stripe Checkout)
4. **Test:** With test cards
5. **Go live:** Accept real payments

**Output:** Working checkout flow

**Benchmark:** Should take 1 day to integrate Stripe Checkout

---

### Week 3: Conversion Optimization

**Goal:** Increase visitor → customer rate

1. **Measure:** Current conversion rates
2. **Optimize:** Landing page (use checklist)
3. **Implement:** Welcome email sequence
4. **Add:** Trial expiration reminders
5. **Test:** A/B test one element

**Output:** 20-50% increase in conversions

**Benchmark:**
- Landing page: 30-40% → signup
- Trial: 15-25% → paid

---

### Week 4: Sales Automation

**Goal:** Scale without hiring

1. **Set up:** Email automation (Resend/Loops)
2. **Implement:** Trial-to-paid sequence
3. **Add:** Usage-based upgrade prompts
4. **Create:** Churn prevention automation
5. **Monitor:** Daily metrics dashboard

**Output:** Self-running sales machine

**Benchmark:** Automations should drive 40%+ of conversions

---

## Key Metrics to Track

### Acquisition Metrics

```javascript
const metrics = {
  // Traffic
  visitors: 10000,              // Unique visitors/month
  signupRate: 40,               // % who sign up
  signups: 4000,                // Total signups

  // Activation
  activated: 3000,              // Reached "Aha Moment"
  activationRate: 75,           // % of signups

  // Conversion
  trials: 800,                  // Started trial
  paid: 200,                    // Converted to paid
  trialConversionRate: 25,      // % of trials

  // Overall
  visitorToPaidRate: 2          // % end-to-end
}
```

### Revenue Metrics

```javascript
const revenue = {
  // Monthly Recurring Revenue
  mrr: 19800,                   // $99 × 200 customers

  // Annual Recurring Revenue
  arr: 237600,                  // MRR × 12

  // Growth Rate
  mrrGrowthRate: 15,            // % month-over-month

  // Customer Metrics
  averageRevenuePerCustomer: 99,
  lifetimeValue: 1188,          // ARPC × (1/churn_rate)
  customerAcquisitionCost: 300,

  // Unit Economics
  ltvToCacRatio: 3.96,          // Should be > 3

  // Churn
  monthlyChurnRate: 5,          // % customers who cancel
  revenue ChurnRate: 4           // % revenue lost (net of expansion)
}
```

### Conversion Metrics

```javascript
const conversion = {
  // Landing Page
  landingPageViews: 10000,
  ctaClicks: 4000,
  clickRate: 40,

  // Trial
  trialsStarted: 800,
  trialsConverted: 200,
  trialConversionRate: 25,

  // Email Performance
  emailOpenRate: 45,
  emailClickRate: 15,
  emailConversionRate: 3
}
```

---

## Pricing Models Comparison

### 1. Per-Seat Pricing (Most Common)

**Example:** Slack, Figma, Notion

```
Pricing: $12/user/month

Pros:
- Scales with customer value
- Predictable revenue
- Easy to understand

Cons:
- Can discourage adding users
- Limits viral growth

Best for: Team collaboration tools
```

### 2. Usage-Based Pricing

**Example:** Vercel, AWS, Stripe

```
Pricing: $0.10 per API call

Pros:
- Aligns perfectly with value
- Easy to start (low entry price)
- Fair (pay for what you use)

Cons:
- Unpredictable revenue
- Harder to forecast

Best for: Infrastructure, APIs
```

### 3. Flat-Rate Pricing

**Example:** Basecamp, Some CRMs

```
Pricing: $99/month unlimited

Pros:
- Simple messaging
- No usage anxiety
- Predictable for customer

Cons:
- Leaves money on table
- Power users cost more

Best for: Simple products, small teams
```

### 4. Tiered Pricing

**Example:** Mailchimp, HubSpot

```
Pricing:
- Starter: $29/mo
- Pro: $99/mo
- Enterprise: $499/mo

Pros:
- Serves multiple segments
- Clear upgrade path
- Anchoring effect

Cons:
- Can be confusing
- Feature gating challenges

Best for: Most B2B SaaS
```

### 5. Freemium

**Example:** Notion, Figma, Loom

```
Pricing:
- Free: Core features
- Paid: $12/mo for advanced

Pros:
- Low barrier to entry
- Viral growth
- Try before buy

Cons:
- Hard to monetize
- Support costs
- Conversion can be low (2-5%)

Best for: Viral products, network effects
```

---

## Pricing Strategy Decision Tree

```
Start here: What's your product?

├─ Infrastructure/API product?
│  └─ Use usage-based pricing
│     Example: $2 per 1M requests
│
├─ Team collaboration tool?
│  └─ Use per-seat pricing
│     Example: $12/user/month
│
├─ Solo productivity tool?
│  └─ Use tiered pricing
│     Example: Free/Pro/Premium
│
├─ Complex enterprise software?
│  └─ Use value-based + custom
│     Example: $500-50K/year based on company size
│
└─ Not sure?
   └─ Start with 3 tiers (Free/Pro/Enterprise)
      Test and iterate based on data
```

---

## Payment Provider Decision Tree

```
Do you want to handle tax/VAT yourself?

├─ YES (I'll handle compliance)
│  │
│  ├─ Is your audience developers?
│  │  └─ Use Stripe (best API, flexibility)
│  │
│  └─ Is your audience consumers?
│     └─ Use Stripe or PayPal (trust)
│
└─ NO (want merchant of record)
   │
   ├─ Established product (>$10K MRR)?
   │  └─ Use Paddle (better support)
   │
   └─ Just launching?
      └─ Use LemonSqueezy (fastest setup)
```

---

## Conversion Optimization Priorities

**Fix these in order (highest impact first):**

### 1. Landing Page (Weeks 1-2)

**Current:** 20% conversion
**Target:** 35-40% conversion
**Impact:** +75% signups

**Actions:**
- Clear headline (benefit, not feature)
- Add social proof (logos, testimonials)
- Show product immediately
- Simplify signup (email only)

### 2. Activation (Weeks 3-4)

**Current:** 60% activation
**Target:** 75-80% activation
**Impact:** +25% activated users

**Actions:**
- Get to "Aha Moment" in < 5 minutes
- Remove email verification requirement
- Add interactive onboarding
- Send welcome email immediately

### 3. Trial Conversion (Weeks 5-6)

**Current:** 15% trial conversion
**Target:** 20-25% trial conversion
**Impact:** +33-67% revenue

**Actions:**
- Email sequence (8 emails over 14 days)
- In-app upgrade prompts at limits
- Show pricing early (day 3, not day 13)
- Add urgency (ethical - trial ending)

### 4. Retention (Weeks 7-8)

**Current:** 10% monthly churn
**Target:** 5% monthly churn
**Impact:** 2x LTV

**Actions:**
- Detect churn signals
- Re-engagement campaigns
- Usage-based check-ins
- Make cancellation harder (ethical friction)

---

## Automation Roadmap

### Month 1: Foundation

```javascript
// Week 1: Welcome emails
await setupWelcomeSequence()
// Impact: +30% activation

// Week 2: Trial reminders
await setupTrialReminders()
// Impact: +15% trial conversion

// Week 3: Failed payments
await setupPaymentRecovery()
// Impact: Recover 30% of failed payments

// Week 4: Metrics dashboard
await setupDailyMetrics()
// Impact: Data-driven decisions
```

### Month 2: Conversion

```javascript
// Week 5: Upgrade prompts
await setupUpgradePrompts()
// Impact: +20% free-to-paid

// Week 6: Abandoned cart
await setupCartRecovery()
// Impact: +15% checkout completion

// Week 7: Feature adoption
await setupFeatureEmails()
// Impact: +25% engagement

// Week 8: Social proof
await automateTestimonialCollection()
// Impact: +10% landing page conversion
```

### Month 3: Scaling

```javascript
// Week 9: Lead scoring
await setupLeadScoring()
// Impact: Focus on high-value leads

// Week 10: Referral program
await setupReferralProgram()
// Impact: 10-15% of new signups from referrals

// Week 11: Win-back campaigns
await setupWinBackCampaigns()
// Impact: Recover 10% of churned customers

// Week 12: Revenue forecasting
await setupRevenueForecasting()
// Impact: Better planning
```

---

## Real-World Examples

### Example 1: Linear (Project Management)

**Pricing:**
- $8/user/month (annual)
- Single tier (simplicity)
- Free for unlimited viewers

**Conversion Strategy:**
- Beautiful product (sells itself)
- Generous free tier
- Developer-focused
- Transparent pricing

**Results:**
- Fastest-growing PM tool
- High NPS (70+)
- Low churn (2-3% monthly)

**Lesson:** Premium product + fair pricing + transparency = sustainable growth

---

### Example 2: Superhuman (Email)

**Pricing:**
- $30/month (premium positioning)
- Single tier (no confusion)
- No free tier

**Conversion Strategy:**
- Invite-only (scarcity)
- White-glove onboarding (1-on-1 call)
- High touch (personal attention)
- Focus on productivity gains

**Results:**
- 22% month-over-month growth
- $300 LTV
- Passionate users

**Lesson:** Premium pricing works if you deliver premium value

---

### Example 3: Notion (Productivity)

**Pricing:**
- Free: Generous (unlimited personal use)
- Team: $8/user/month
- Enterprise: Custom

**Conversion Strategy:**
- Free tier for growth
- Network effects (shared workspaces)
- Templates (viral content)
- Community-driven

**Results:**
- 20M+ users
- $10B valuation
- High free-to-paid conversion (better than average freemium)

**Lesson:** Freemium works with network effects and viral growth

---

## Common Mistakes

### Mistake 1: Pricing Too Low

**Problem:** "We'll make it up in volume"

**Reality:**
- Attracts wrong customers
- Unsustainable unit economics
- Hard to raise prices later

**Fix:**
- Double your prices
- If < 20% of prospects complain, you're too cheap

### Mistake 2: Optimizing Before Validating

**Problem:** A/B testing landing page with 10 visitors/day

**Reality:**
- Need statistical significance
- Minimum 100 conversions per variant

**Fix:**
- Get to 1,000+ visitors/month first
- Then optimize

### Mistake 3: Complex Pricing

**Problem:** "$99 + $5/user over 10 + $0.10/API call"

**Reality:**
- Confusing = lower conversion
- Hard to budget

**Fix:**
- Simple pricing wins
- One number, clear value

### Mistake 4: No Trial or Free Tier

**Problem:** "Pay before trying"

**Reality:**
- High barrier to entry
- Low conversion rates

**Fix:**
- 14-day trial (no credit card) for B2B
- Freemium for viral products
- Demo/preview for enterprise

### Mistake 5: Waiting to Add Payments

**Problem:** "We'll monetize later"

**Reality:**
- Hard to charge after free
- Users resist change
- Leaves money on table

**Fix:**
- Add pricing from day 1
- Grandfather early users if needed
- Test willingness to pay early

---

## Success Metrics by Stage

### Pre-Launch (Validating)

```
- 10+ customer interviews
- Price confirmed with 5+ potential customers
- Payment integration tested
- Landing page ready
```

### Launch (0-$1K MRR)

```
- 100+ landing page visitors
- 30%+ signup rate
- 50%+ activation rate
- First paying customer
```

### Early Traction ($1K-10K MRR)

```
- 1,000+ visitors/month
- 40%+ signup rate
- 70%+ activation rate
- 15%+ trial conversion
- 50-100 paying customers
```

### Growth ($10K-100K MRR)

```
- 10,000+ visitors/month
- 20%+ MRR growth
- 3:1+ LTV:CAC
- < 5% monthly churn
- Automations driving 50%+ conversions
```

### Scale ($100K+ MRR)

```
- Product-led growth
- 30%+ MRR growth
- 5:1+ LTV:CAC
- < 3% monthly churn
- Expansion revenue > new revenue
```

---

## Resources

### Books
- **"Monetizing Innovation"** - Madhavan Ramanujam (pricing strategy)
- **"The SaaS Playbook"** - Rob Walling (sales & marketing)
- **"Obviously Awesome"** - April Dunford (positioning)

### Blogs
- **ProfitWell Blog** - Pricing & metrics
- **Price Intelligently** - Pricing research
- **Stripe Atlas Guides** - Payments & billing

### Tools
- **Pricing:** Price Intelligently, ProfitWell
- **Payments:** Stripe, Paddle, LemonSqueezy
- **Analytics:** Mixpanel, Amplitude, PostHog
- **Email:** Resend, Loops, Customer.io
- **A/B Testing:** Google Optimize, Vercel Edge Config

### Communities
- **r/SaaS** - Reddit community
- **Indie Hackers** - Solo founder community
- **SaaS Growth Hacks** - Facebook group

---

## Next Steps

1. **Week 1:** Determine pricing
   - Start: `pricing-frameworks/value-based-pricing-methodology.md`

2. **Week 2:** Integrate payments
   - Start: `payment-integrations/stripe-setup-guide.md`

3. **Week 3:** Optimize conversion
   - Start: `conversion-playbooks/landing-page-checklist.md`

4. **Week 4:** Automate sales
   - Start: `sales-automations/README.md`

5. **Month 2+:** Iterate based on data
   - A/B test everything
   - Double down on what works
   - Cut what doesn't

---

## The Hermetic Monetization Mindset

**Remember:**

1. **Price is a product feature** - It communicates value
2. **Charge what you're worth** - Don't undervalue your work
3. **Be transparent** - Hidden fees destroy trust
4. **Make it easy** - Friction kills conversions
5. **Test everything** - Data beats opinions
6. **Focus on value** - Not just price
7. **Automate ruthlessly** - Scale without headcount
8. **Iterate continuously** - Optimization never ends

**Your goal:** Create a self-running revenue machine that grows predictably and sustainably while treating customers fairly.

**Now go build it.**
