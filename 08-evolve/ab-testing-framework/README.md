# A/B Testing Framework for MicroSaaS

A production-ready A/B testing framework designed for rapid experimentation and data-driven decision making in MicroSaaS products. Built on hermetic principles: functional, accurate, and elegant.

## Table of Contents

- [Overview](#overview)
- [When to Run Experiments vs Ship Fast](#when-to-run-experiments-vs-ship-fast)
- [Core Concepts](#core-concepts)
- [Statistical Significance Explained Simply](#statistical-significance-explained-simply)
- [Quick Start](#quick-start)
- [Common Pitfalls](#common-pitfalls)
- [Framework Architecture](#framework-architecture)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)

## Overview

This A/B testing framework enables MicroSaaS founders to validate product decisions with real user data. It provides:

- **Feature Flag System**: Toggle features for different user segments
- **Variant Assignment**: Consistent user experience across sessions
- **Statistical Analysis**: Built-in calculations for significance testing
- **Experiment Tracking**: Monitor all running experiments in one place
- **Decision Framework**: Clear criteria for ship/kill/iterate decisions

### Philosophy

> "In God we trust. All others must bring data." - W. Edwards Deming

The framework balances two competing forces:
1. **Speed**: MicroSaaS requires rapid iteration and shipping
2. **Accuracy**: Bad decisions waste development time and lose customers

Our approach: **Test the big bets, ship the small improvements.**

## When to Run Experiments vs Ship Fast

### RUN AN EXPERIMENT when:

1. **High Impact, High Uncertainty**
   - Fundamental pricing changes (e.g., $9/mo → $29/mo)
   - Major UX overhauls (e.g., complete dashboard redesign)
   - Core feature additions that change the product value prop
   - Risky growth mechanics (e.g., viral loops, referral programs)

2. **Irreversible Decisions**
   - Changes that affect existing paying customers
   - Modifications to billing or payment flows
   - Features that create new user expectations

3. **Resource-Intensive Features**
   - Features requiring >3 days of development
   - Features with ongoing maintenance costs
   - Third-party integrations with monthly fees

4. **Contradictory Opinions**
   - Team disagrees on the right approach
   - Customer feedback is mixed
   - Your intuition conflicts with data

### SHIP FAST when:

1. **Low Risk, Clear Benefit**
   - Bug fixes (always ship immediately)
   - Performance improvements (faster = better)
   - Security patches (never experiment with security)
   - Accessibility improvements (always the right choice)

2. **Small, Reversible Changes**
   - Button text changes
   - Color adjustments
   - Copy improvements
   - UI polish

3. **Customer-Requested Features**
   - Direct feedback from paying customers
   - Feature parity with competitors
   - Support tickets indicate clear need

4. **Time-Sensitive Opportunities**
   - Seasonal features (e.g., holiday themes)
   - Competitive responses (ship before market shifts)
   - Bug fixes affecting revenue

### The 48-Hour Rule

If you can:
- Build it in < 2 days
- Roll it back in < 1 hour
- Explain the value in < 1 sentence

Then **ship it** and monitor metrics. Use experiments for bigger bets.

## Core Concepts

### Experiment Components

Every A/B test consists of:

1. **Hypothesis**: What you believe will happen and why
   ```
   Format: "We believe [CHANGE] will cause [IMPACT] because [REASONING]"
   Example: "We believe reducing the free trial from 14 to 7 days will
            increase paid conversions by 15% because urgency drives action."
   ```

2. **Variants**:
   - **Control (A)**: Current experience (baseline)
   - **Treatment (B, C, ...)**: New experience(s) to test

3. **Success Metrics**:
   - **Primary Metric**: Main KPI you're optimizing (e.g., conversion rate)
   - **Secondary Metrics**: Supporting indicators (e.g., engagement, retention)
   - **Guardrail Metrics**: Safety checks (e.g., churn rate, support tickets)

4. **Sample Size**: Number of users needed for statistical validity

5. **Duration**: How long to run the experiment

### User Assignment

Users are randomly assigned to variants using deterministic hashing:

```typescript
// Same user always sees the same variant
const variant = assignVariant(userId, experimentId);
```

This ensures:
- Consistent experience across sessions
- Fair randomization
- No need to store assignment in database (stateless)

### Statistical Significance

A result is "statistically significant" when:
- **p-value < 0.05**: Less than 5% chance the result is random
- **Confidence Level ≥ 95%**: We're 95% confident the effect is real
- **Practical Significance**: The improvement is large enough to matter

Example:
```
Control: 100 visitors, 10 conversions (10%)
Treatment: 100 visitors, 15 conversions (15%)
Result: p = 0.08 (NOT significant)
Decision: Keep running, need more data
```

## Statistical Significance Explained Simply

### What is Statistical Significance?

Imagine you flip a coin 10 times and get 7 heads. Is the coin unfair, or did you just get lucky?

Statistical significance answers: **"How confident are we this isn't random luck?"**

### The 95% Confidence Rule

When we say "95% confident":
- If we ran this experiment 100 times
- 95 times we'd see the same winner
- 5 times we might be fooled by randomness

This is the industry standard for shipping decisions.

### P-Value Explained

The p-value is the probability your results happened by chance:

- **p = 0.01**: 1% chance it's luck → VERY confident
- **p = 0.05**: 5% chance it's luck → Confident (minimum to ship)
- **p = 0.10**: 10% chance it's luck → Not confident enough
- **p = 0.50**: 50% chance it's luck → Basically a coin flip

**Rule**: Only ship if p-value < 0.05

### Sample Size Matters

Small samples = unreliable results:

```
10 users each:
Control: 1 conversion (10%)
Treatment: 2 conversions (20%)
Verdict: Not enough data, could be random

1000 users each:
Control: 100 conversions (10%)
Treatment: 200 conversions (20%)
Verdict: Highly significant, ship it!
```

### Effect Size: Does It Matter?

Statistical significance ≠ business significance

```
Example 1: SIGNIFICANT but useless
Sample: 100,000 users per variant
Control CTR: 10.0%
Treatment CTR: 10.1%
Result: p < 0.001 (very significant!)
Decision: DON'T ship - 0.1% improvement isn't worth the engineering time

Example 2: SIGNIFICANT and valuable
Sample: 1,000 users per variant
Control Conversion: 2%
Treatment Conversion: 4%
Result: p = 0.03 (significant)
Decision: SHIP IT - 2x conversion rate is huge!
```

**Always check both**: Is it statistically significant AND practically meaningful?

## Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev @types/node
```

### 2. Set Up an Experiment

```typescript
import { ABTest, ExperimentConfig } from './ab-test-implementation';

// Define your experiment
const pricingExperiment: ExperimentConfig = {
  id: 'pricing-increase-2024-01',
  name: 'Price Increase Test: $9 vs $19',
  variants: [
    { id: 'control', name: 'Current Price $9', weight: 50 },
    { id: 'treatment', name: 'New Price $19', weight: 50 }
  ],
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-29'),
  targetSampleSize: 1000
};

// Initialize test
const abTest = new ABTest(pricingExperiment);
```

### 3. Assign Users to Variants

```typescript
// In your application code
const userId = 'user-12345';
const variant = abTest.assignVariant(userId);

// Show different experiences
if (variant === 'control') {
  showPrice('$9/month');
} else {
  showPrice('$19/month');
}
```

### 4. Track Events

```typescript
// When user completes desired action
abTest.trackEvent(userId, 'conversion', {
  revenue: 19,
  timestamp: new Date()
});
```

### 5. Analyze Results

```typescript
const results = abTest.analyzeResults();

console.log(results);
// {
//   control: { users: 500, conversions: 50, rate: 0.10 },
//   treatment: { users: 500, conversions: 75, rate: 0.15 },
//   significance: { pValue: 0.023, isSignificant: true },
//   recommendation: 'SHIP_IT'
// }
```

### 6. Make Decision

```typescript
if (results.recommendation === 'SHIP_IT') {
  // Roll out to 100% of users
  deployToProduction(variant);
} else if (results.recommendation === 'KILL_IT') {
  // Revert and try something else
  rollback();
} else {
  // Keep collecting data
  continueExperiment();
}
```

## Common Pitfalls

### 1. Peeking Too Early

**Problem**: Checking results before reaching sample size leads to false positives.

```typescript
// DON'T DO THIS:
Day 1: p = 0.04 → "Ship it!"  (WRONG - too early)
Day 7: p = 0.15 → "Wait, it's not significant anymore..."

// DO THIS:
Wait until target sample size → p = 0.06 → "Not significant, keep running"
```

**Solution**: Set sample size upfront and wait until reached.

### 2. Ignoring Practical Significance

**Problem**: Tiny improvements waste engineering time.

```typescript
// NOT WORTH IT:
Improvement: 0.1% increase in CTR
Engineering time: 3 days
Maintenance cost: Ongoing complexity

// WORTH IT:
Improvement: 20% increase in conversion
Engineering time: 3 days
Maintenance cost: Clean, simple code
```

**Solution**: Set minimum practical threshold (e.g., "must improve by >10%").

### 3. Running Too Many Experiments Simultaneously

**Problem**: Experiments interact and contaminate results.

```typescript
// DANGEROUS:
Experiment 1: Pricing change (affects conversion)
Experiment 2: Checkout flow (affects conversion)
Experiment 3: Trial length (affects conversion)

Result: Can't tell which caused the change!
```

**Solution**: Run 1-2 experiments max, never on same metrics.

### 4. Not Segmenting by User Type

**Problem**: Missing critical insights from different user groups.

```typescript
// OVERALL RESULTS (misleading):
Control: 10% conversion
Treatment: 11% conversion
Verdict: Slight improvement

// SEGMENTED RESULTS (revealing):
New users:
  Control: 5% conversion
  Treatment: 15% conversion → HUGE WIN!

Existing users:
  Control: 20% conversion
  Treatment: 8% conversion → HUGE LOSS!

Decision: Show treatment to new users only!
```

**Solution**: Always segment by new vs returning, plan tier, traffic source.

### 5. Forgetting Guardrail Metrics

**Problem**: Optimizing one metric destroys another.

```typescript
// PRIMARY METRIC (looks good):
Conversions: +30% ✓

// GUARDRAIL METRICS (disaster):
Churn rate: +50% ✗
Support tickets: +200% ✗
Time to value: -60% ✗

Decision: KILL IT - the "improvement" is destroying the business
```

**Solution**: Define guardrails before starting. Monitor everything.

### 6. Not Having a Rollback Plan

**Problem**: Experiments break production and you scramble to fix.

```typescript
// BEFORE LAUNCHING:
1. Test variant with internal users
2. Deploy feature flag (off by default)
3. Enable for 5% of users
4. Monitor error rates for 1 hour
5. Gradually increase to 50/50

// IF SOMETHING BREAKS:
1. Set flag to 0% (instant rollback)
2. Investigate issue
3. Fix and re-deploy
4. Re-enable gradually
```

**Solution**: Always use feature flags, never deploy untested code.

### 7. Confirmation Bias

**Problem**: Interpreting ambiguous results to match what you want.

```typescript
// BIASED INTERPRETATION:
p = 0.08 → "It's close to 0.05, and the trend looks good, let's ship!"
Negative secondary metrics → "Those don't really matter..."
Flat results in key segment → "We'll just ignore that segment..."

// OBJECTIVE INTERPRETATION:
p = 0.08 → "Not significant. Need more data or declare no effect."
Negative secondaries → "Why are these dropping? Investigate before shipping."
Flat results → "The feature doesn't work for this segment. Needs iteration."
```

**Solution**: Set decision criteria BEFORE running experiment. Follow them ruthlessly.

### 8. Novelty Effect

**Problem**: New things get artificial boost that fades.

```typescript
// WEEK 1 (honeymoon):
Treatment conversion: +40% 🎉

// WEEK 2 (reality):
Treatment conversion: +10%

// WEEK 4 (regression):
Treatment conversion: -5%
```

**Solution**: Run experiments for minimum 2 weeks. Check if effect sustains.

## Framework Architecture

```
ab-testing-framework/
├── ab-test-implementation.ts    # Core A/B testing engine
├── experiment-tracker.ts         # Multi-experiment management
├── statistical-calculator.js     # Sample size & significance
├── experiment-setup-guide.md     # Step-by-step instructions
├── experiment-templates/         # Ready-to-use templates
│   ├── pricing-test.md
│   ├── feature-test.md
│   ├── landing-page-test.md
│   └── email-campaign-test.md
└── README.md                     # This file
```

### Component Overview

**ab-test-implementation.ts**:
- Variant assignment (deterministic hashing)
- Event tracking
- Statistical analysis
- Type-safe experiment configuration

**experiment-tracker.ts**:
- Track multiple experiments
- Prevent conflicts
- Dashboard data aggregation
- Decision framework

**statistical-calculator.js**:
- Sample size calculator
- Significance testing
- Confidence intervals
- Standalone (browser or Node.js)

## Integration Guide

### With Next.js

```typescript
// app/providers/ABTestProvider.tsx
'use client';

import { createContext, useContext } from 'react';
import { ABTest } from '@/lib/ab-test-implementation';

const ABTestContext = createContext<ABTest | null>(null);

export function ABTestProvider({
  children,
  experiment
}: {
  children: React.ReactNode;
  experiment: ExperimentConfig;
}) {
  const abTest = new ABTest(experiment);

  return (
    <ABTestContext.Provider value={abTest}>
      {children}
    </ABTestContext.Provider>
  );
}

export function useABTest() {
  const context = useContext(ABTestContext);
  if (!context) throw new Error('useABTest must be used within ABTestProvider');
  return context;
}

// app/pricing/page.tsx
'use client';

import { useABTest } from '@/providers/ABTestProvider';
import { useUser } from '@/hooks/useUser';

export default function PricingPage() {
  const abTest = useABTest();
  const { user } = useUser();

  const variant = abTest.assignVariant(user.id);

  return (
    <div>
      {variant === 'control' ? (
        <PriceCard price={9} />
      ) : (
        <PriceCard price={19} />
      )}
    </div>
  );
}
```

### With Express.js

```typescript
// middleware/ab-test.ts
import { ABTest } from './ab-test-implementation';
import { experiments } from './active-experiments';

export function abTestMiddleware(req, res, next) {
  req.abTests = {};

  for (const [key, config] of Object.entries(experiments)) {
    const abTest = new ABTest(config);
    const userId = req.user?.id || req.sessionId;
    const variant = abTest.assignVariant(userId);

    req.abTests[key] = { test: abTest, variant };
  }

  next();
}

// routes/pricing.ts
app.get('/pricing', (req, res) => {
  const { variant } = req.abTests.pricingExperiment;

  const price = variant === 'control' ? 9 : 19;

  res.render('pricing', { price });
});
```

### With Analytics (PostHog, Mixpanel, Amplitude)

```typescript
// lib/analytics.ts
import { ABTest } from './ab-test-implementation';
import posthog from 'posthog-js';

export function trackABTestAssignment(
  userId: string,
  experiment: ABTest,
  variant: string
) {
  // Send to analytics platform
  posthog.capture('experiment_viewed', {
    experiment_id: experiment.config.id,
    variant: variant,
    user_id: userId
  });

  // Set user property for segmentation
  posthog.identify(userId, {
    [`experiment_${experiment.config.id}`]: variant
  });
}

export function trackABTestConversion(
  userId: string,
  experiment: ABTest,
  metadata?: Record<string, any>
) {
  const variant = experiment.assignVariant(userId);

  posthog.capture('experiment_conversion', {
    experiment_id: experiment.config.id,
    variant: variant,
    ...metadata
  });

  // Also track locally
  experiment.trackEvent(userId, 'conversion', metadata);
}
```

## Best Practices

### 1. Always Have a Hypothesis

```typescript
// BAD: No hypothesis
"Let's test a new button color"

// GOOD: Clear hypothesis
"We believe changing the CTA button from blue to green will increase
clicks by 10% because green signals 'go' and reduces decision friction."
```

### 2. One Primary Metric

```typescript
// BAD: Multiple primary metrics
Primary: Conversion rate, engagement, retention, revenue

// GOOD: Single primary metric
Primary: Paid conversion rate
Secondary: Trial engagement, 30-day retention
Guardrail: Support tickets, churn rate
```

### 3. Plan for Both Outcomes

```typescript
// Before running experiment
If variant wins: Ship to 100%, update docs, train support team
If control wins: Document learnings, try variant B, iterate hypothesis
If inconclusive: Extend test 1 week OR declare no effect and move on
```

### 4. Document Everything

```typescript
const experiment = {
  id: 'pricing-2024-q1',
  hypothesis: 'Higher price will increase revenue without hurting conversions',
  startDate: '2024-01-15',
  results: {
    winner: 'treatment',
    pValue: 0.023,
    lift: '+25% revenue, -5% conversion'
  },
  decision: 'SHIP_IT',
  learnings: [
    'Enterprise segment insensitive to price',
    'Indie hackers churned at higher price',
    'Segment pricing by customer type in future'
  ]
};
```

### 5. Segment Your Analysis

Always break down by:
- New vs returning users
- Traffic source (organic, paid, referral)
- Device type (mobile, desktop)
- Plan tier (free, paid, enterprise)
- Geography (if international)

### 6. Monitor in Real-Time

```typescript
// Set up alerts
if (errorRate > baseline * 1.5) {
  alert('Experiment causing errors!');
  rollback();
}

if (churnRate > baseline * 2) {
  alert('Experiment increasing churn!');
  rollback();
}

if (supportTickets > baseline * 3) {
  alert('Experiment confusing users!');
  rollback();
}
```

### 7. Clean Up After Yourself

```typescript
// After experiment concludes:
1. Remove losing variants from codebase
2. Deploy winner as default
3. Delete feature flags
4. Update documentation
5. Archive experiment data
6. Share learnings with team

// Don't leave:
if (experiment === 'old-test-2023') {
  // Dead code from 6 months ago
}
```

## Advanced Topics

### Multi-Armed Bandit

For faster optimization than traditional A/B testing:

```typescript
// Instead of 50/50 split, dynamically adjust
// Traffic shifts to winning variants automatically

const bandit = new MultiArmedBandit([
  { id: 'variant-a', initialWeight: 25 },
  { id: 'variant-b', initialWeight: 25 },
  { id: 'variant-c', initialWeight: 25 },
  { id: 'variant-d', initialWeight: 25 }
]);

// After each conversion, update weights
bandit.updateWeights('variant-b', 1); // Success
bandit.updateWeights('variant-a', 0); // Failure

// Winner emerges faster, more users see better variant
```

### Sequential Testing

Check results as data comes in (safely):

```typescript
// Traditional A/B: Fixed sample size
// Sequential: Check after milestones

checkpoints = [100, 250, 500, 1000];
alphaSpend = [0.01, 0.02, 0.03, 0.05]; // Adjusted for peeking

// Can stop early if clear winner emerges
```

### Holdout Groups

Keep a control group even after shipping:

```typescript
// Ship variant to 95% of users
// Keep 5% on old version to measure long-term impact

const assignment = Math.random();
if (assignment < 0.05) {
  // Holdout group - keeps seeing old version
  return 'control';
} else {
  // Everybody else gets new version
  return 'treatment';
}
```

## Resources

### Further Reading

- "Trustworthy Online Controlled Experiments" by Kohavi, Tang, Xu
- "A/B Testing: The Most Powerful Way to Turn Clicks Into Customers" by Siroker
- Evan Miller's A/B testing calculator: https://www.evanmiller.org/ab-testing/

### Tools

- Sample size calculator: Use `statistical-calculator.js` in this framework
- Statistical analysis: Built into `ab-test-implementation.ts`
- Experiment tracking: Use `experiment-tracker.ts`

### Support

For issues or questions about this framework:
1. Check the experiment setup guide
2. Review experiment templates for examples
3. Verify statistical calculations with calculator
4. Ensure sample size is sufficient

## License

MIT License - Use freely in your MicroSaaS products

---

**Remember**: The goal isn't to run experiments. The goal is to build a better product. Use experiments as a tool for learning, not as a substitute for judgment. Ship fast, measure everything, and let data guide your decisions.
