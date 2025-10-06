# Experiment Setup Guide

A step-by-step guide to designing, implementing, and analyzing A/B tests for your MicroSaaS product.

## Table of Contents

1. [Pre-Experiment Checklist](#pre-experiment-checklist)
2. [Designing Your Experiment](#designing-your-experiment)
3. [Calculating Sample Size](#calculating-sample-size)
4. [Duration Recommendations](#duration-recommendations)
5. [Defining Success Metrics](#defining-success-metrics)
6. [Implementation Steps](#implementation-steps)
7. [Running the Experiment](#running-the-experiment)
8. [Analyzing Results](#analyzing-results)
9. [Making the Decision](#making-the-decision)
10. [Post-Experiment Actions](#post-experiment-actions)

## Pre-Experiment Checklist

Before starting any experiment, verify:

- [ ] This change is worth testing (high impact, high uncertainty)
- [ ] You have enough traffic (minimum 1000 users/week)
- [ ] Analytics are working correctly
- [ ] You can measure the outcome metric
- [ ] You have a rollback plan
- [ ] Stakeholders are informed
- [ ] No other experiments conflict with this one
- [ ] You've documented your hypothesis

**Stop here if you checked fewer than 7 boxes.** Fix the gaps first.

## Designing Your Experiment

### Step 1: Define Your Hypothesis

Use this format:

```
We believe [CHANGE]
will cause [IMPACT]
because [REASONING]

Example:
We believe adding social proof testimonials to the pricing page
will increase paid conversions by 20%
because trust signals reduce purchase anxiety
```

### Step 2: Identify Your Variants

**Control (A)**: Current experience
- Always test against existing version
- This is your baseline

**Treatment (B)**: New experience
- Single change if possible
- Multiple changes if they're inseparable

**Treatment (C, D, ...)**: Additional variants (optional)
- Only if you have >10,000 weekly users
- Otherwise, test sequentially

### Step 3: Choose Experiment Type

**A/B Test**: Two versions (most common)
```
50% see Control
50% see Treatment
```

**A/B/C Test**: Three+ versions
```
33% see Control
33% see Treatment B
34% see Treatment C
```

**Multivariate Test**: Multiple variables simultaneously
```
Variable 1: Headline (A vs B)
Variable 2: CTA color (Red vs Green)
Combinations: A-Red, A-Green, B-Red, B-Green
Note: Requires 4x the traffic
```

**Recommendation**: Start with simple A/B tests.

### Step 4: Map the User Flow

Document where users enter and exit the experiment:

```
Entry Point:
  - User lands on pricing page
  - User is assigned variant
  - Assignment tracked in analytics

Experience:
  - Control: Sees current pricing
  - Treatment: Sees testimonials + pricing

Exit Points (Conversions):
  - Click "Start Free Trial"
  - Complete signup form
  - First payment received

Exit Points (Non-Conversions):
  - Leave pricing page
  - Close tab
  - Navigate away
```

### Step 5: Identify Risks

List what could go wrong:

```
Technical Risks:
- Testimonials could slow page load
- API could fail to fetch testimonials
- Mobile layout could break

Business Risks:
- Testimonials could seem fake
- Could distract from pricing info
- May not work for enterprise segment

Mitigation:
- Lazy-load testimonials
- Cache testimonials client-side
- Test on all devices first
- Monitor error rates in real-time
```

## Calculating Sample Size

### The Formula (Simplified)

```
Required sample size per variant =
  16 × (baseline_rate) × (1 - baseline_rate) / (minimum_detectable_effect)²

Where:
- baseline_rate = current conversion rate (as decimal)
- minimum_detectable_effect = smallest change you care about (as decimal)
```

### Example Calculation

```
Current conversion rate: 5% (0.05)
Minimum improvement: 1 percentage point (0.01)

Sample size = 16 × 0.05 × 0.95 / 0.01²
            = 16 × 0.0475 / 0.0001
            = 7,600 users per variant
            = 15,200 users total
```

### Using the Statistical Calculator

```javascript
// Use the provided statistical calculator
const calculator = require('./statistical-calculator.js');

const sampleSize = calculator.calculateSampleSize({
  baselineRate: 0.05,      // 5% current conversion
  minimumDetectableEffect: 0.01,  // Want to detect 1% change
  confidenceLevel: 0.95,   // 95% confidence
  power: 0.80              // 80% power
});

console.log(`Need ${sampleSize} users per variant`);
```

### Quick Reference Table

| Baseline Rate | Min Effect | Sample Size/Variant |
|---------------|------------|---------------------|
| 1%            | 0.5%       | 12,700             |
| 2%            | 0.5%       | 12,500             |
| 5%            | 1%         | 7,600              |
| 5%            | 2%         | 1,900              |
| 10%           | 2%         | 3,600              |
| 10%           | 5%         | 576                |
| 20%           | 5%         | 1,024              |
| 50%           | 10%        | 400                |

### Adjusting for Multiple Variants

If testing A/B/C (3 variants):
```
Sample size per variant × number of variants = total traffic needed
7,600 × 3 = 22,800 users total
```

### Low Traffic Solutions

If you don't have enough traffic:

1. **Increase test duration**
   ```
   Current: 1,000 users/week
   Need: 15,200 users
   Duration: 15.2 weeks ≈ 4 months
   ```

2. **Test a bigger change**
   ```
   Instead of 1% improvement, aim for 5%
   New sample size: 1,900 per variant (more achievable)
   ```

3. **Use a proxy metric**
   ```
   Instead of: Paid conversions (rare event)
   Test on: Trial signups (more frequent)
   Then validate: Did trial signups lead to more paid?
   ```

4. **Sequential testing**
   ```
   Start with 500 users per variant
   If p-value < 0.01 (stricter), call it early
   Otherwise, continue to full sample size
   ```

## Duration Recommendations

### Minimum Duration: 1 Week

**Why?** Captures weekly patterns:
- Weekend vs weekday behavior
- Different traffic sources by day
- Business cycles (B2B products)

**Example**: SaaS conversion rates:
```
Monday: 8%
Wednesday: 12%
Saturday: 4%

If you only run Mon-Fri: Biased results
If you run full week: Accurate average
```

### Maximum Duration: 4 Weeks

**Why?** Longer = more risks:
- Novelty effects fade
- External factors (holidays, competitors, seasonality)
- Opportunity cost (delaying other experiments)

**Exceptions**:
- Low traffic (need time to reach sample size)
- Long conversion windows (B2B sales cycles)
- Seasonal products (test full season)

### Calculating Duration

```
Duration (days) = (Sample Size × Number of Variants) / Daily Traffic

Example:
Sample size: 7,600 per variant
Variants: 2 (A/B test)
Daily traffic: 1,000 users

Duration = (7,600 × 2) / 1,000 = 15.2 days ≈ 2-3 weeks
```

### Duration Checklist

Run experiment until you hit **ALL** of these:

- [ ] Minimum 7 days elapsed
- [ ] Reached target sample size
- [ ] Captured full week (Mon-Sun)
- [ ] No major external events (launches, outages, holidays)
- [ ] Error rates normal
- [ ] Results stable (not fluctuating wildly day-to-day)

### When to Stop Early

**Stop immediately if**:
```
- Error rate spikes >50%
- Churn increases >20%
- Support tickets increase >3x
- Revenue drops >10%
- p-value < 0.001 AND effect is huge (>50% improvement)
```

**Never stop early because**:
```
- You're impatient
- Results look good at day 2
- Boss is asking for results
- You want to start next experiment
```

## Defining Success Metrics

### The Metric Hierarchy

```
1. Primary Metric (ONE only)
   └─ The main thing you're optimizing
   └─ Must be measurable and attributable
   └─ Example: Paid conversion rate

2. Secondary Metrics (2-4)
   └─ Supporting evidence
   └─ Help understand WHY primary moved
   └─ Examples: Trial signups, time on page, feature usage

3. Guardrail Metrics (2-4)
   └─ Prevent unintended harm
   └─ Should NOT get worse
   └─ Examples: Churn rate, support tickets, page load time
```

### Choosing Your Primary Metric

**Good Primary Metrics**:
- Directly tied to business goal
- Measurable within experiment timeframe
- Affected by the change you're testing
- Not easily gamed

**Examples**:

```
Testing: Pricing page redesign
Good: Paid conversion rate
Bad: Page views (doesn't indicate purchase intent)

Testing: Onboarding flow
Good: % completing onboarding
Bad: Time spent (longer isn't better)

Testing: Email campaign
Good: Click-through rate
Bad: Open rate (unreliable tracking)

Testing: Feature launch
Good: Feature activation rate
Bad: Overall engagement (too broad)
```

### Metric Requirements

| Requirement | Description | Example |
|-------------|-------------|---------|
| **Measurable** | Can track accurately | "Conversions" ✓ vs "User happiness" ✗ |
| **Attributable** | Can tie to variant | "In-app action" ✓ vs "Word of mouth" ✗ |
| **Timely** | Occurs during test | "Trial signup" ✓ vs "Annual renewal" ✗ |
| **Sensitive** | Changes with treatment | "Clicks" ✓ vs "App downloads" ✗ |
| **Meaningful** | Impacts business | "Revenue" ✓ vs "Profile views" ✗ |

### North Star Metrics by Product Type

**SaaS Products**:
```
Primary: Paid conversion rate
Secondary: Trial activation, feature usage
Guardrail: Churn rate, support tickets
```

**E-commerce**:
```
Primary: Purchase rate
Secondary: Add-to-cart rate, average order value
Guardrail: Return rate, customer satisfaction
```

**Marketplaces**:
```
Primary: Transaction volume
Secondary: Listing creation, search-to-view rate
Guardrail: Fraud rate, dispute rate
```

**Content Platforms**:
```
Primary: Daily active users
Secondary: Time spent, content created
Guardrail: User reports, content quality
```

**Developer Tools**:
```
Primary: API adoption rate
Secondary: Documentation views, SDK downloads
Guardrail: Error rates, support load
```

### Metric Definition Template

For each metric, document:

```markdown
## Metric: [Name]

**Definition**: [Exact calculation]
Example: "Paid conversion rate = (Users who paid) / (Users who saw pricing page)"

**Type**: [Primary / Secondary / Guardrail]

**Why it matters**: [Business justification]
Example: "This directly measures revenue impact"

**How it's tracked**: [Technical implementation]
Example: "Event 'pricing_page_viewed' → Event 'payment_completed' within 7 days"

**Current baseline**: [Pre-experiment value]
Example: "5.2% over last 30 days"

**Target improvement**: [What you're aiming for]
Example: "Increase to 6.5% (25% relative improvement)"

**Acceptable range**: [Guardrail bounds]
Example: "Must not drop below 4.5%"

**Segment by**: [Breakdown dimensions]
Example: "Plan tier, traffic source, new vs returning"
```

### Example: Complete Metric Definition

```markdown
## Metric: Trial-to-Paid Conversion Rate

**Definition**:
(Number of users who started paid plan) / (Number of users who started trial)
Measured within 14 days of trial start

**Type**: Primary

**Why it matters**:
This is our most important revenue driver. A 1% improvement = $50k ARR.

**How it's tracked**:
- Trial start: Event "trial_started" with user_id
- Conversion: Event "subscription_created" with user_id
- Join on user_id, filter to conversions within 14 days

**Current baseline**:
8.5% (measured over last 90 days, n=3,247 trial users)

**Target improvement**:
10.5% (absolute 2% increase, 23.5% relative improvement)

**Acceptable range**:
Must not drop below 7.5% (we'd kill experiment)

**Segment by**:
- Plan tier (Indie vs Pro vs Enterprise)
- Traffic source (organic, paid, referral)
- Company size (1-10, 11-50, 51+ employees)
- Geography (US, EU, APAC)

**Known confounders**:
- Seasonal: Higher in Jan/Feb (new year budgets)
- Day of week: Lower on weekends
- Cohort: Users from Product Hunt convert worse
```

### Common Metric Pitfalls

**1. Vanity Metrics**
```
Bad: "Page views increased 50%!"
Reality: Users are confused, clicking around looking for info
Check guardrail: Time to conversion also increased 50%
```

**2. Ratio Metrics Without Components**
```
Bad: "Conversion rate increased"
Missing: Did traffic decrease? Did absolute conversions increase?

Better: Track both:
- Conversion rate: 5% → 6%
- Absolute conversions: 100 → 120
- Traffic: 2,000 → 2,000
```

**3. Delayed Conversions**
```
Problem: Testing checkout flow, but some users convert 3 days later
Solution: Wait 3 days after experiment ends to measure final results
```

**4. Multiple Conversions per User**
```
Problem: Same user converts twice, counted as 2 conversions
Solution: Decide on per-user or per-event basis upfront
```

## Implementation Steps

### Step 1: Set Up Feature Flags

```typescript
// config/experiments.ts
import { ExperimentConfig } from '../ab-test-implementation';

export const ACTIVE_EXPERIMENTS: Record<string, ExperimentConfig> = {
  pricingTestimonials: {
    id: 'pricing-testimonials-2024-01',
    name: 'Add Testimonials to Pricing Page',
    variants: [
      { id: 'control', name: 'No Testimonials', weight: 50 },
      { id: 'treatment', name: 'With Testimonials', weight: 50 }
    ],
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-29'),
    targetSampleSize: 7600
  }
};
```

### Step 2: Implement Variant Assignment

```typescript
// lib/ab-testing.ts
import { ABTest } from './ab-test-implementation';
import { ACTIVE_EXPERIMENTS } from '../config/experiments';

export function getExperimentVariant(
  userId: string,
  experimentKey: string
): string {
  const config = ACTIVE_EXPERIMENTS[experimentKey];
  if (!config) {
    console.error(`Experiment ${experimentKey} not found`);
    return 'control';
  }

  const test = new ABTest(config);
  return test.assignVariant(userId);
}
```

### Step 3: Add Tracking Events

```typescript
// pages/pricing.tsx
import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { getExperimentVariant } from '@/lib/ab-testing';
import { trackEvent } from '@/lib/analytics';

export default function PricingPage() {
  const { user } = useUser();
  const variant = getExperimentVariant(user.id, 'pricingTestimonials');

  // Track that user saw this variant
  useEffect(() => {
    trackEvent('experiment_viewed', {
      experiment_id: 'pricing-testimonials-2024-01',
      variant: variant,
      user_id: user.id
    });
  }, [variant, user.id]);

  // Track conversion
  const handleStartTrial = () => {
    trackEvent('experiment_conversion', {
      experiment_id: 'pricing-testimonials-2024-01',
      variant: variant,
      user_id: user.id,
      action: 'trial_started'
    });

    // Continue with normal trial flow...
  };

  return (
    <div>
      <h1>Pricing</h1>

      {variant === 'treatment' && <Testimonials />}

      <PricingCards />
      <Button onClick={handleStartTrial}>Start Free Trial</Button>
    </div>
  );
}
```

### Step 4: Create Monitoring Dashboard

```typescript
// lib/experiment-monitor.ts
export async function checkExperimentHealth(experimentId: string) {
  const metrics = await getExperimentMetrics(experimentId);

  // Check for critical issues
  const checks = {
    errorRate: metrics.errorRate < metrics.baselineErrorRate * 1.5,
    churnRate: metrics.churnRate < metrics.baselineChurnRate * 1.2,
    trafficSplit: Math.abs(metrics.controlTraffic - metrics.treatmentTraffic) < 0.1,
    dataQuality: metrics.eventsTracked / metrics.usersAssigned > 0.95
  };

  if (Object.values(checks).some(check => !check)) {
    // Alert and possibly pause experiment
    await sendAlert('Experiment health check failed', {
      experimentId,
      checks
    });
  }

  return checks;
}

// Run health checks every hour
setInterval(() => {
  for (const experimentId of Object.keys(ACTIVE_EXPERIMENTS)) {
    checkExperimentHealth(experimentId);
  }
}, 60 * 60 * 1000);
```

### Step 5: Test Implementation

```typescript
// tests/ab-testing.test.ts
import { ABTest } from '../lib/ab-test-implementation';

describe('Pricing Testimonials Experiment', () => {
  const config = {
    id: 'test-experiment',
    name: 'Test',
    variants: [
      { id: 'control', name: 'Control', weight: 50 },
      { id: 'treatment', name: 'Treatment', weight: 50 }
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    targetSampleSize: 1000
  };

  it('assigns variants consistently', () => {
    const test = new ABTest(config);
    const userId = 'test-user-123';

    const variant1 = test.assignVariant(userId);
    const variant2 = test.assignVariant(userId);

    expect(variant1).toBe(variant2);
  });

  it('distributes variants approximately 50/50', () => {
    const test = new ABTest(config);
    const assignments = { control: 0, treatment: 0 };

    for (let i = 0; i < 10000; i++) {
      const variant = test.assignVariant(`user-${i}`);
      assignments[variant]++;
    }

    // Should be within 5% of 50/50
    expect(assignments.control).toBeGreaterThan(4500);
    expect(assignments.control).toBeLessThan(5500);
    expect(assignments.treatment).toBeGreaterThan(4500);
    expect(assignments.treatment).toBeLessThan(5500);
  });

  it('tracks conversions correctly', () => {
    const test = new ABTest(config);

    test.trackEvent('user-1', 'conversion');
    test.trackEvent('user-2', 'conversion');

    const results = test.analyzeResults();
    expect(results.totalConversions).toBe(2);
  });
});
```

## Running the Experiment

### Day 1: Launch Checklist

- [ ] **Pre-launch verification**
  - [ ] Test both variants work correctly
  - [ ] Analytics tracking fires
  - [ ] Error monitoring in place
  - [ ] Rollback procedure documented

- [ ] **Gradual rollout**
  - [ ] Enable for 5% of users
  - [ ] Monitor for 1 hour
  - [ ] Check error rates, performance
  - [ ] Increase to 50/50 if healthy

- [ ] **Communication**
  - [ ] Notify team experiment is live
  - [ ] Share dashboard link
  - [ ] Set expected completion date

### Daily Monitoring

**Don't check statistical significance daily** (causes false positives)

**Do check these daily**:

1. **Traffic distribution**
   ```
   Control: 50% ± 5%
   Treatment: 50% ± 5%
   ```

2. **Data quality**
   ```
   Event tracking rate: >95%
   Missing user IDs: <1%
   Duplicate events: <2%
   ```

3. **Guardrail metrics**
   ```
   Error rate: Same as baseline
   Page load time: Same as baseline
   Support tickets: Same as baseline
   ```

4. **Sample size progress**
   ```
   Day 1: 500/7600 (7%)
   Day 7: 3500/7600 (46%)
   Day 14: 7600/7600 (100%) ← Ready to analyze
   ```

### Weekly Reviews

Every 7 days:

1. **Check progress**
   - Are we on track to hit sample size?
   - Do we need to extend duration?

2. **Review segments**
   - Any segments behaving unexpectedly?
   - Should we stop showing variant to a segment?

3. **Check for external factors**
   - Did a competitor launch something?
   - Any press coverage affecting traffic?
   - Holiday or seasonal effects?

4. **Qualitative feedback**
   - What are users saying in support?
   - Any patterns in session recordings?
   - Heatmaps showing unexpected behavior?

### Red Flags (Stop Immediately)

```
🚨 Error rate >2x baseline
🚨 Page crashes or infinite loops
🚨 Payment processing failures
🚨 Data not being tracked
🚨 Users complaining about specific variant
🚨 Churn spike >20%
🚨 Revenue drop >10%
```

## Analyzing Results

### Wait for Sufficient Data

```
✗ Day 2: 200 users, p=0.04 → TOO EARLY
✗ Day 5: 1000 users, p=0.03 → STILL TOO EARLY
✓ Day 14: 7600 users, p=0.03 → NOW you can analyze
```

### Run Statistical Analysis

```javascript
// Use statistical calculator
const calculator = require('./statistical-calculator');

const results = calculator.calculateSignificance({
  controlConversions: 385,
  controlSample: 7600,
  treatmentConversions: 456,
  treatmentSample: 7600
});

console.log(results);
// {
//   controlRate: 0.0507,
//   treatmentRate: 0.0600,
//   absoluteLift: 0.0093,
//   relativeLift: 0.183,
//   pValue: 0.023,
//   isSignificant: true,
//   confidence: 0.977
// }
```

### Interpret Results

**Statistical Significance**: p < 0.05 ✓
```
There's only a 2.3% chance this result is random
We can be 97.7% confident treatment is better
```

**Practical Significance**: 18.3% improvement
```
Treatment: 6.0% conversion
Control: 5.07% conversion
Absolute: +0.93 percentage points
Relative: +18.3%

For 10,000 monthly visitors:
Control: 507 conversions
Treatment: 600 conversions
Gain: 93 extra conversions/month
```

**Business Impact**:
```
Extra conversions: 93/month
Average customer value: $500
Monthly revenue impact: $46,500
Annual revenue impact: $558,000

Engineering cost: 3 days
Maintenance cost: Negligible
ROI: Obvious win
```

### Segment Analysis

Always break down by key segments:

```typescript
const segmentResults = {
  newUsers: {
    control: { conversions: 50, sample: 1000, rate: 0.05 },
    treatment: { conversions: 90, sample: 1000, rate: 0.09 },
    pValue: 0.001,
    lift: 0.80 // 80% improvement!
  },
  returningUsers: {
    control: { conversions: 335, sample: 6600, rate: 0.0508 },
    treatment: { conversions: 366, sample: 6600, rate: 0.0555 },
    pValue: 0.23,
    lift: 0.09 // Only 9% improvement, not significant
  }
};

// Insight: Treatment works great for new users, minimal impact on returning
// Decision: Show treatment to new users only
```

### Check Guardrail Metrics

```typescript
const guardrailCheck = {
  churnRate: {
    control: 0.02,
    treatment: 0.018,
    change: -0.002,
    status: 'SAFE' // Actually improved
  },
  supportTickets: {
    control: 1.5, // per user
    treatment: 1.6,
    change: 0.1,
    status: 'SAFE' // Small increase, acceptable
  },
  pageLoadTime: {
    control: 1200, // ms
    treatment: 1800,
    change: 600,
    status: 'WARNING' // 50% slower!
  }
};

// Action: Fix page load issue before shipping
```

### Decision Matrix

| Scenario | p-value | Effect Size | Guardrails | Decision |
|----------|---------|-------------|------------|----------|
| Clear win | <0.05 | >10% | All green | SHIP IT |
| Close call | 0.05-0.10 | >10% | All green | EXTEND TEST |
| Not significant | >0.10 | <5% | All green | KILL IT |
| Mixed results | <0.05 | >10% | Some red | FIX & RETEST |
| Negative impact | <0.05 | <0% | Any red | KILL IT |
| Flat results | >0.10 | <2% | All green | NO EFFECT |

## Making the Decision

### Decision Framework

**SHIP IT if**:
- p-value < 0.05
- Practical improvement >10%
- All guardrails safe
- Works across key segments
- Engineering cost justified

**KILL IT if**:
- p-value >0.10 after full sample
- Negative impact on primary metric
- Guardrails violated
- Hurts key segment
- ROI doesn't justify maintenance

**ITERATE if**:
- Mixed segment results
- Good qualitative feedback but flat metrics
- Small positive trend but not significant
- Hypothesis still seems valid

**EXTEND TEST if**:
- p-value 0.05-0.10 (close to significant)
- Haven't reached full sample size yet
- Large effect size but need more data
- External factor (holiday) may have skewed results

### Example Decisions

**Example 1: Clear Win**
```
Experiment: Add social proof to pricing page
Results:
- p-value: 0.001
- Conversion lift: 25%
- Guardrails: All green
- Segments: Works for all

Decision: SHIP IT
Next steps:
- Deploy to 100% of users
- Remove control variant code
- Update documentation
- Monitor for 2 weeks
```

**Example 2: Kill It**
```
Experiment: Reduce free trial from 14 to 7 days
Results:
- p-value: 0.03 (significant)
- Conversion lift: -15% (WORSE)
- Churn: +30% (WORSE)
- Segments: Hurts all

Decision: KILL IT
Learnings:
- Users need full 14 days to evaluate
- Urgency backfired, created pressure
- Try different approach: Better onboarding instead
```

**Example 3: Iterate**
```
Experiment: New onboarding flow
Results:
- p-value: 0.15 (not significant)
- Conversion lift: 5%
- Completion rate: +40% (significant!)
- Time to first value: -50% (significant!)

Decision: ITERATE
Insight: New flow is better UX, but doesn't reach conversion yet
Next test: Keep new flow, add conversion-focused end screen
```

## Post-Experiment Actions

### If You're Shipping (Winner)

1. **Deploy to 100%**
   ```typescript
   // Remove experiment code
   // Before:
   const variant = abTest.assignVariant(userId);
   if (variant === 'treatment') {
     showTestimonials();
   }

   // After:
   showTestimonials(); // Just show it to everyone
   ```

2. **Monitor for regressions**
   ```
   Week 1 post-ship: Daily checks
   Week 2-4: Weekly checks
   Month 2+: Include in regular metrics
   ```

3. **Document learnings**
   ```markdown
   ## Experiment: pricing-testimonials-2024-01

   **Result**: SHIPPED

   **Impact**:
   - +25% conversion rate
   - +$558k ARR
   - No negative effects

   **Learnings**:
   - Social proof works especially well for new users (80% lift)
   - Returning users less affected (already trust us)
   - Technical: Lazy-loading kept page speed fast

   **Future experiments**:
   - Test different testimonials (founder vs enterprise)
   - Test placement (top vs bottom of page)
   - Test format (text vs video)
   ```

4. **Share results**
   - Email team
   - Update product roadmap
   - Celebrate the win
   - Apply learnings to other areas

### If You're Killing It (Loser)

1. **Rollback immediately**
   ```typescript
   // Set feature flag to 0%
   // Or remove experiment code entirely
   ```

2. **Document why it failed**
   ```markdown
   ## Experiment: reduce-trial-length

   **Result**: KILLED

   **Impact**:
   - -15% conversion rate
   - +30% churn
   - Users complained they needed more time

   **Why it failed**:
   - Hypothesis: Urgency drives action
   - Reality: Pressure drives away
   - Our product has learning curve, needs 14 days

   **What we learned**:
   - Don't reduce trial length
   - Focus on better onboarding instead
   - Urgency tactics don't work for our audience
   ```

3. **Plan next experiment**
   ```
   Failed: Reduce trial length
   Learning: Users need time but aren't activating fast enough
   Next test: Improve day-1 onboarding to get to value faster
   ```

### Clean Up

```typescript
// Remove experiment code from codebase
// Delete feature flags
// Archive experiment data
// Update documentation
// Remove monitoring dashboards

// Don't leave dead code:
if (experimentActive('old-test-2023')) { // ← Delete this
  // ...
}
```

### Build Experiment Library

Keep a searchable database:

```json
{
  "experiments": [
    {
      "id": "pricing-testimonials-2024-01",
      "date": "2024-01-15",
      "category": "conversion",
      "hypothesis": "Social proof increases trust",
      "result": "SHIPPED",
      "impact": "+25% conversion",
      "learnings": ["Social proof works for new users", "..."]
    },
    {
      "id": "reduce-trial-2024-01",
      "date": "2024-01-20",
      "category": "conversion",
      "hypothesis": "Urgency drives action",
      "result": "KILLED",
      "impact": "-15% conversion",
      "learnings": ["Our users need time", "Don't create pressure"]
    }
  ]
}
```

This prevents:
- Repeating failed experiments
- Forgetting what worked
- Losing institutional knowledge

---

## Quick Reference

### Experiment Checklist

```
□ Hypothesis documented
□ Sample size calculated
□ Metrics defined (primary, secondary, guardrail)
□ Implementation tested
□ Analytics verified
□ Rollback plan ready
□ Team notified
□ Duration set (min 7 days)
□ Launched at 5%, then 50/50
□ Daily health checks
□ Weekly reviews
□ Wait for full sample size
□ Analyze results
□ Make decision
□ Document learnings
□ Clean up code
```

### Common Questions

**Q: How long should I run the test?**
A: Minimum 1 week, until you hit sample size, whichever is longer.

**Q: Can I check results early?**
A: Check health metrics daily, but don't check significance until full sample size.

**Q: What if results are close (p=0.06)?**
A: Extend test for one more sample size cycle. If still not significant, call it "no effect."

**Q: Can I run multiple experiments at once?**
A: Yes, but not on the same page/flow. They'll contaminate each other.

**Q: What sample size do I need?**
A: Depends on baseline rate and minimum effect. Use the statistical calculator.

**Q: My traffic is too low, what do I do?**
A: Test bigger changes (easier to detect) or test on proxy metrics (more frequent events).

---

**Remember**: The goal isn't to prove you're right. The goal is to learn what works. Design experiments to learn, not to confirm your biases. Good luck!
