# Pricing Experiment Template

A comprehensive template for testing pricing changes, from small adjustments to complete pricing model overhauls.

## Experiment Overview

**Experiment ID**: `pricing-[description]-[year]-[quarter]`
**Category**: Pricing & Monetization
**Risk Level**: HIGH - Affects revenue directly

## When to Use This Template

Use this template when testing:
- Price increases or decreases
- New pricing tiers
- Billing frequency changes (monthly vs annual)
- Feature bundling
- Free trial length or terms
- Freemium vs paid-only models
- Add-on pricing
- Enterprise vs self-serve pricing

## Pre-Experiment Checklist

- [ ] Legal approval (especially for existing customers)
- [ ] Billing system can handle variant pricing
- [ ] Support team briefed on pricing experiment
- [ ] Grandfather clause for existing customers (if needed)
- [ ] Revenue tracking set up correctly
- [ ] Refund policy decided
- [ ] Stakeholder buy-in (high-risk experiment)

## Experiment Setup

### 1. Hypothesis

```
We believe [PRICING CHANGE]
will [IMPACT ON REVENUE/CONVERSIONS]
because [REASONING]

Example:
We believe increasing our basic plan from $9/mo to $19/mo
will increase MRR by 50% without reducing paid conversions by more than 20%
because our product delivers $100+/mo in value and competitors charge $29/mo
```

### 2. Variants

**Control (A)**: Current Pricing
```
Plan: Basic
Price: $9/month or $90/year
Features: Current feature set
Trial: 14 days
```

**Treatment (B)**: New Pricing
```
Plan: Basic
Price: $19/month or $190/year
Features: Current feature set
Trial: 14 days
```

**Optional Treatment (C)**: Middle Ground
```
Plan: Basic
Price: $14/month or $140/year
Features: Current feature set
Trial: 14 days
```

### 3. Success Metrics

**Primary Metric**: Monthly Recurring Revenue (MRR) per user
- Control baseline: $9 × conversion rate
- Target: +30% MRR per user

**Secondary Metrics**:
- Paid conversion rate (trial → paid)
- Trial signup rate (visitor → trial)
- Revenue per visitor
- Annual plan adoption rate
- Customer lifetime value (if trackable in timeframe)

**Guardrail Metrics**:
- Churn rate (must not spike)
- Support tickets about pricing (watch for complaints)
- Refund requests
- Payment failures
- Customer satisfaction scores

### 4. Sample Size Calculation

```javascript
// Use statistical calculator
const StatCalculator = require('../statistical-calculator.js');

// Current metrics
const currentConversionRate = 0.05; // 5% trial → paid
const currentPrice = 9;
const currentRevenuePerUser = currentConversionRate * currentPrice;

// Expected new metrics
const expectedConversionRate = 0.04; // Assume 20% drop
const newPrice = 19;
const expectedRevenuePerUser = expectedConversionRate * newPrice;

// For revenue comparison, treat as conversion rate problem
const relativeLift = (expectedRevenuePerUser - currentRevenuePerUser) / currentRevenuePerUser;

const sampleSize = StatCalculator.calculateSampleSize({
  baselineRate: currentConversionRate,
  minimumDetectableEffect: currentConversionRate * 0.2, // 20% change
  confidenceLevel: 0.95,
  power: 0.80
});

console.log(`Need ${sampleSize} trial users per variant`);
```

### 5. Duration

```
Trial users per week: [INSERT YOUR NUMBER]
Sample size needed: [FROM CALCULATION ABOVE]
Duration: [SAMPLE SIZE / WEEKLY TRIALS] weeks

Minimum: 2 weeks (capture full billing cycle)
Recommended: 4 weeks (see if annual conversions differ)
Maximum: 8 weeks (pricing experiments can run longer)
```

### 6. Segmentation Plan

Analyze results by:

**Must analyze**:
- New vs returning visitors
- Traffic source (organic, paid, referral)
- Plan tier interest (if multiple tiers)
- Geography (price sensitivity varies by country)

**Nice to have**:
- Company size (for B2B)
- Industry vertical
- Device type
- Time of month (paycheck timing)

## Implementation Guide

### Code Example (Next.js)

```typescript
// lib/pricing-experiment.ts
import { ABTest, createABTest } from '../ab-test-implementation';

export const pricingExperiment = createABTest(
  'pricing-increase-2024-q1',
  'Basic Plan Price: $9 vs $19',
  28, // 4 weeks
  2000 // 2000 trial users per variant
);

export function getPricing(userId: string) {
  const variant = pricingExperiment.assignVariant(userId);

  const pricing = {
    control: {
      monthly: 9,
      annual: 90,
      displayMonthly: '$9',
      displayAnnual: '$90'
    },
    treatment: {
      monthly: 19,
      annual: 190,
      displayMonthly: '$19',
      displayAnnual: '$190'
    }
  };

  return pricing[variant];
}

// pages/pricing.tsx
import { getPricing } from '@/lib/pricing-experiment';
import { useUser } from '@/hooks/useUser';

export default function PricingPage() {
  const { user } = useUser();
  const pricing = getPricing(user.id);

  return (
    <div className="pricing-page">
      <h1>Simple, Transparent Pricing</h1>

      <div className="pricing-card">
        <h2>Basic Plan</h2>
        <p className="price">{pricing.displayMonthly}/month</p>
        <p className="price-annual">
          or {pricing.displayAnnual}/year (save 17%)
        </p>
        <button onClick={() => startTrial(user.id, pricing.monthly)}>
          Start Free Trial
        </button>
      </div>
    </div>
  );
}

// Track conversion
async function startTrial(userId: string, priceSelected: number) {
  // Track in experiment
  pricingExperiment.trackEvent(userId, 'view');

  // Create trial
  await createTrial(userId, priceSelected);

  // When they convert to paid
  pricingExperiment.trackEvent(userId, 'conversion', {
    revenue: priceSelected,
    plan: 'basic'
  });
}
```

### Stripe Integration

```typescript
// lib/stripe-pricing.ts

// Create price variants in Stripe first
const STRIPE_PRICES = {
  control: {
    monthly: 'price_control_monthly',
    annual: 'price_control_annual'
  },
  treatment: {
    monthly: 'price_treatment_monthly',
    annual: 'price_treatment_annual'
  }
};

export function getStripePriceId(
  variant: string,
  interval: 'monthly' | 'annual'
): string {
  return STRIPE_PRICES[variant][interval];
}

// When creating checkout session
const variant = pricingExperiment.assignVariant(userId);
const priceId = getStripePriceId(variant, selectedInterval);

const session = await stripe.checkout.sessions.create({
  customer: customerId,
  line_items: [{
    price: priceId,
    quantity: 1
  }],
  mode: 'subscription',
  metadata: {
    experiment_id: 'pricing-increase-2024-q1',
    variant: variant,
    user_id: userId
  }
});
```

## Analysis & Decision Making

### Week 1: Initial Check

**DO NOT** make decisions yet. Only check:
- Is experiment running correctly?
- Are users being assigned to variants?
- Is tracking working?
- Any technical issues?

### Week 2: Health Check

Check guardrail metrics:
- Churn rate normal?
- Support tickets about price?
- Any angry customers?

If guardrails violated → Pause and investigate

### Week 4: Decision Time

Run full analysis:

```typescript
const analysis = pricingExperiment.analyzeResults();

// Calculate revenue metrics
const controlRevenue = analysis.control.conversions * 9;
const treatmentRevenue = analysis.treatment.conversions * 19;

const revenuePerUser = {
  control: controlRevenue / analysis.control.users,
  treatment: treatmentRevenue / analysis.treatment.users
};

const revenueLift = (revenuePerUser.treatment - revenuePerUser.control) /
                    revenuePerUser.control;

console.log(`Revenue per user lift: ${(revenueLift * 100).toFixed(1)}%`);
```

### Decision Framework

**SHIP IT if**:
- Revenue per user increases >20%
- Conversion rate doesn't drop >30%
- No increase in churn
- No support backlash
- Works across key segments

**KILL IT if**:
- Revenue per user decreases
- Conversion rate drops >40%
- Churn increases
- Support overwhelmed with complaints
- Key segment (e.g., enterprise) rebels

**ITERATE if**:
- Mixed results across segments
- Revenue up slightly but not significantly
- Good qualitative feedback
- Consider: Segment pricing, add more value, grandfather existing

## Common Pitfalls

### 1. Not Grandfathering Existing Customers

**Problem**: Existing customers see price increase, churn spikes

**Solution**:
```typescript
function getPricing(userId: string) {
  const user = await getUser(userId);

  // Existing customers keep current pricing
  if (user.createdAt < experimentStartDate) {
    return currentPricing;
  }

  // New customers enter experiment
  const variant = experiment.assignVariant(userId);
  return variantPricing[variant];
}
```

### 2. Forgetting About Annual Plans

**Problem**: Only test monthly, miss that annual conversions dropped

**Solution**: Track both monthly and annual separately
```typescript
trackEvent(userId, 'conversion', {
  interval: 'annual',
  revenue: 190
});
```

### 3. Not Accounting for Payment Failures

**Problem**: Higher price = more payment failures

**Solution**: Track as separate metric
```typescript
const guardrails = {
  churnRate: 0.02,
  paymentFailureRate: 0.05, // Watch this with price increases
  supportTickets: 10
};
```

### 4. Testing Price Without Testing Value

**Problem**: Increase price without adding features, customers feel gouged

**Better approach**:
```
Test A: Current price, current features
Test B: Higher price, current features
Test C: Higher price, new premium features

Usually C wins, B loses
```

### 5. Running During Seasonal Events

**Problem**: Testing in December when everyone's budget is frozen

**Solution**: Avoid:
- December/January (holiday budgets)
- August (summer vacation)
- Tax season (March-April for US)
- Your specific industry's busy season

## Post-Experiment Actions

### If Shipping Price Increase

1. **Announce to existing customers** (grandfathered)
   ```
   Subject: [Product] Pricing Update - You're grandfathered at $9/mo

   Hi [Name],

   We're updating our pricing to better reflect the value we deliver.
   New customers will pay $19/mo starting [date].

   As a valued existing customer, your price stays at $9/mo forever.

   Thanks for being with us!
   ```

2. **Update website**
   - Pricing page
   - Marketing materials
   - Sales decks

3. **Update Stripe**
   - Set new prices as default
   - Archive old prices (don't delete)

4. **Train support team**
   - Prepare responses for "Why so expensive?"
   - Emphasize value, not just features
   - Be ready for comparison to competitors

5. **Monitor closely**
   - First 2 weeks: Daily checks
   - Next 2 months: Weekly checks
   - Watch for regression to mean

### If Killing Price Increase

1. **Document learnings**
   ```markdown
   ## Pricing Test Failed

   **What we tested**: $9 → $19
   **Result**: -40% conversions, only +14% revenue
   **Why it failed**: Price too high for current feature set
   **Next steps**:
   - Add premium features first
   - Test smaller increase ($9 → $12)
   - Consider value-based pricing instead
   ```

2. **Consider alternatives**
   - Add more expensive tier instead of increasing base
   - Usage-based pricing
   - Add-ons for power users
   - Enterprise custom pricing

## Example Results

### Successful Price Increase

```
Control ($9/mo):
- 1000 trials
- 50 conversions (5%)
- Revenue: $450/month

Treatment ($19/mo):
- 1000 trials
- 42 conversions (4.2%)
- Revenue: $798/month

Result:
- -16% conversion rate (acceptable)
- +77% revenue per user (HUGE WIN)
- p-value: 0.001 (highly significant)

Decision: SHIP IT
```

### Failed Price Increase

```
Control ($9/mo):
- 1000 trials
- 50 conversions (5%)
- Revenue: $450/month

Treatment ($19/mo):
- 1000 trials
- 22 conversions (2.2%)
- Revenue: $418/month

Result:
- -56% conversion rate (DISASTER)
- -7% revenue per user (WORSE)
- p-value: 0.002 (significantly worse)

Decision: KILL IT

Learning: Price too high for perceived value
Next: Add features before trying price increase
```

## Resources

- [Price Intelligently - SaaS Pricing Guide](https://www.priceintelligently.com/)
- [Patrick Campbell - Pricing Strategy](https://www.profitwell.com/recur)
- [SaaS Pricing Calculator](../statistical-calculator.js)

## Checklist

Before launching pricing experiment:

- [ ] Hypothesis clearly stated
- [ ] Sample size calculated
- [ ] Billing system configured for variant pricing
- [ ] Existing customers grandfathered (if applicable)
- [ ] Support team briefed
- [ ] Legal approval obtained
- [ ] Tracking implemented
- [ ] Dashboard created
- [ ] Rollback plan documented
- [ ] Stakeholders aligned
- [ ] Launch date set (avoid seasonal issues)

During experiment:

- [ ] Daily health checks
- [ ] Guardrail metrics monitored
- [ ] Support tickets tracked
- [ ] Qualitative feedback collected
- [ ] No peeking at significance too early

After experiment:

- [ ] Full analysis completed
- [ ] Segments analyzed
- [ ] Decision documented
- [ ] Learnings recorded
- [ ] Implementation plan created
- [ ] Team notified

---

**Remember**: Pricing experiments are high-stakes. Take your time, validate assumptions, and always prioritize customer value over short-term revenue.
