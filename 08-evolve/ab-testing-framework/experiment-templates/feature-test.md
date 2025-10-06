# Feature Launch Experiment Template

A template for validating new features before full rollout. Use this to ensure features actually improve user experience and key metrics.

## Experiment Overview

**Experiment ID**: `feature-[name]-[year]-[quarter]`
**Category**: Feature Validation
**Risk Level**: MEDIUM - Feature development investment at stake

## When to Use This Template

Use this template when:
- Launching a major new feature
- Unsure if users will adopt the feature
- Feature requires significant ongoing maintenance
- Multiple design approaches possible
- Feature might cannibalize existing functionality
- Integration with third-party services (cost per user)

## Pre-Experiment Checklist

- [ ] Feature is fully built and tested
- [ ] Feature can be toggled on/off (feature flag)
- [ ] Analytics tracking implemented
- [ ] Error monitoring in place
- [ ] Performance impact measured
- [ ] Support team knows about feature
- [ ] Rollback plan documented
- [ ] At least 80% code coverage with tests

## Experiment Setup

### 1. Hypothesis

```
We believe [FEATURE]
will cause [IMPACT ON METRICS]
because [USER NEED IT ADDRESSES]

Example:
We believe adding bulk export functionality
will increase paid conversions by 15% and reduce churn by 10%
because users frequently request it and competitors offer it
```

### 2. Variants

**Control (A)**: Without New Feature
```
Experience: Current product without [feature]
Users: See existing workflow
CTA: N/A
```

**Treatment (B)**: With New Feature
```
Experience: Product with [feature] enabled
Users: Can discover and use new feature
CTA: [How users discover it - banner, menu, etc.]
```

**Optional Treatment (C)**: Different Implementation
```
Experience: Alternative design/UX for same feature
Users: Different discovery or interaction pattern
CTA: Alternative approach
```

### 3. Success Metrics

**Primary Metric**: Feature Adoption Rate
- Definition: % of users who use feature at least once
- Target: >20% adoption within first week

**Secondary Metrics**:
- Feature usage frequency (daily active users)
- Time spent using feature
- Completion rate (% who finish feature workflow)
- Impact on core metrics (conversion, retention, engagement)
- Net Promoter Score (NPS) change

**Guardrail Metrics**:
- Error rates (feature shouldn't break things)
- Page load time (feature shouldn't slow down app)
- Core feature usage (new feature shouldn't cannibalize existing)
- Support tickets (feature should be intuitive)
- User retention (feature should help, not hurt)

### 4. Sample Size Calculation

```javascript
const StatCalculator = require('../statistical-calculator.js');

// For adoption rate (proportion who use feature)
const expectedAdoptionControl = 0; // Feature doesn't exist
const expectedAdoptionTreatment = 0.20; // Expect 20% to use it

// For impact on conversion
const currentConversionRate = 0.05;
const expectedImprovementFromFeature = 0.01; // 1 percentage point

const sampleSize = StatCalculator.calculateSampleSize({
  baselineRate: currentConversionRate,
  minimumDetectableEffect: expectedImprovementFromFeature,
  confidenceLevel: 0.95,
  power: 0.80
});

console.log(`Need ${sampleSize} users per variant`);

// Also calculate for adoption
const adoptionSampleSize = StatCalculator.calculateSampleSizeSimple(
  0.20, // Expected adoption rate
  0.05  // Want to detect if it's really 15% or 25%
);

console.log(`Need ${adoptionSampleSize} for adoption rate accuracy`);
```

### 5. Duration

```
Minimum: 1 week (see initial adoption)
Recommended: 2 weeks (see sustained usage)
Maximum: 4 weeks (diminishing returns after that)

Consider longer if:
- Feature has long discovery time
- Feature is for advanced users (takes time to reach them)
- Feature impacts monthly metrics (subscriptions, etc.)
```

### 6. Segmentation Plan

Analyze adoption and impact by:

**User attributes**:
- New vs existing users (who adopts faster?)
- Power users vs casual users
- Free vs paid users
- User tenure (how long they've been customers)

**Behavioral**:
- Users who requested this feature
- Users similar to feature requesters
- Users who use related features
- High engagement vs low engagement

## Implementation Guide

### Feature Flag Setup

```typescript
// lib/feature-flags.ts
import { ABTest, createABTest } from '../ab-test-implementation';

export const bulkExportExperiment = createABTest(
  'feature-bulk-export-2024-q1',
  'Bulk Export Feature Test',
  14, // 2 weeks
  1000 // 1000 users per variant
);

export function hasFeature(userId: string, featureName: string): boolean {
  const experiment = getExperimentForFeature(featureName);
  if (!experiment) return false;

  const variant = experiment.assignVariant(userId);
  return variant === 'treatment';
}

// Usage in component
import { hasFeature } from '@/lib/feature-flags';

export function DataTable({ userId }) {
  const hasBulkExport = hasFeature(userId, 'bulk-export');

  return (
    <div>
      <table>{/* ... */}</table>

      {hasBulkExport && (
        <button onClick={handleBulkExport}>
          Export All
        </button>
      )}
    </div>
  );
}
```

### Event Tracking

```typescript
// Track feature discovery
function trackFeatureView(userId: string) {
  analytics.track('feature_viewed', {
    experiment_id: 'feature-bulk-export-2024-q1',
    feature: 'bulk_export',
    user_id: userId
  });

  bulkExportExperiment.trackEvent(userId, 'view', {
    event: 'feature_viewed'
  });
}

// Track feature usage
function trackFeatureUsage(userId: string, action: string) {
  analytics.track('feature_used', {
    experiment_id: 'feature-bulk-export-2024-q1',
    feature: 'bulk_export',
    action: action,
    user_id: userId
  });

  // First usage = conversion
  if (action === 'first_use') {
    bulkExportExperiment.trackEvent(userId, 'conversion', {
      event: 'feature_adopted'
    });
  }
}

// Track feature completion
function trackFeatureCompletion(userId: string, success: boolean) {
  analytics.track('feature_completed', {
    experiment_id: 'feature-bulk-export-2024-q1',
    feature: 'bulk_export',
    success: success,
    user_id: userId
  });
}

// Implementation
async function handleBulkExport() {
  const userId = getCurrentUserId();

  trackFeatureUsage(userId, 'first_use');

  try {
    await exportAllData();
    trackFeatureCompletion(userId, true);
  } catch (error) {
    trackFeatureCompletion(userId, false);
    handleError(error);
  }
}
```

### Gradual Rollout

```typescript
// Start with 5%, then 25%, then 50%
export function getFeatureRolloutPercent(
  featureName: string,
  date: Date
): number {
  const rolloutSchedule = {
    'bulk-export': [
      { date: new Date('2024-01-15'), percent: 5 },
      { date: new Date('2024-01-17'), percent: 25 },
      { date: new Date('2024-01-20'), percent: 50 }
    ]
  };

  const schedule = rolloutSchedule[featureName] || [];

  for (let i = schedule.length - 1; i >= 0; i--) {
    if (date >= schedule[i].date) {
      return schedule[i].percent;
    }
  }

  return 0; // Not rolled out yet
}

export function hasFeature(userId: string, featureName: string): boolean {
  const rolloutPercent = getFeatureRolloutPercent(featureName, new Date());

  if (rolloutPercent === 0) return false;
  if (rolloutPercent === 100) return true;

  // Use deterministic hashing for consistent experience
  const hash = hashUserId(userId);
  return (hash % 100) < rolloutPercent;
}
```

## Analysis & Decision Making

### Adoption Analysis

```typescript
// Calculate adoption rate
const analysis = bulkExportExperiment.analyzeResults();

const adoptionRate = {
  control: 0, // Feature doesn't exist
  treatment: analysis.treatment.conversionRate
};

console.log(`Adoption rate: ${(adoptionRate.treatment * 100).toFixed(1)}%`);

// Segment by user type
const segments = {
  powerUsers: {
    total: 200,
    adopted: 80,
    rate: 0.40 // 40% adoption among power users
  },
  casualUsers: {
    total: 800,
    adopted: 120,
    rate: 0.15 // 15% adoption among casual users
  }
};

// Analyze impact on core metrics
const coreMetrics = {
  conversion: {
    control: 0.05,
    treatment: 0.056,
    lift: 0.12 // 12% improvement
  },
  retention: {
    control: 0.70,
    treatment: 0.72,
    lift: 0.029 // 2.9% improvement
  }
};
```

### Decision Matrix

| Adoption | Core Metric Impact | Usage Pattern | Decision |
|----------|-------------------|---------------|----------|
| >30% | Positive | Daily use | SHIP - Clear winner |
| 10-30% | Positive | Weekly use | SHIP - Valuable for segment |
| >30% | Neutral | One-time | ITERATE - Make more valuable |
| <10% | Positive | Any | ITERATE - Improve discovery |
| <10% | Neutral | Any | KILL - Not worth maintaining |
| Any | Negative | Any | KILL - Feature hurts product |

### Qualitative Analysis

Don't just look at numbers - talk to users:

```typescript
// Collect feedback
const feedback = {
  positive: [
    "Finally! I've been waiting for this feature",
    "Saves me hours every week",
    "Works exactly as I expected"
  ],
  negative: [
    "Couldn't find it - didn't know it existed",
    "Too complicated, gave up halfway",
    "Doesn't export the format I need"
  ],
  suggestions: [
    "Add CSV format option",
    "Show progress bar during export",
    "Email me when export is ready"
  ]
};

// Use this to inform decision
if (adoptionLow && feedbackSaysHardToFind) {
  decision = 'ITERATE - Improve discoverability';
} else if (adoptionLow && feedbackSaysNotUseful) {
  decision = 'KILL - Wrong feature';
}
```

## Common Pitfalls

### 1. Poor Feature Discoverability

**Problem**: Feature adoption is 2% because nobody knows it exists

**Symptoms**:
- Low adoption despite feature requests
- Users asking for the feature you just shipped
- High adoption among users you personally told

**Solution**:
```typescript
// Add multiple discovery points
- In-app announcement banner
- Tooltip on first visit
- Onboarding checklist item
- Email announcement
- Changelog/blog post
- Menu item or obvious button

// Track which discovery method works
trackFeatureDiscovery(userId, discoveryMethod: 'banner' | 'menu' | 'tooltip');
```

### 2. Not Tracking Feature Depth

**Problem**: Claiming success with 50% "adoption" but users only click once and leave

**Solution**:
```typescript
// Track depth of engagement
const metrics = {
  viewed: 500, // Saw the feature
  clicked: 250, // Clicked to try it
  started: 200, // Started using it
  completed: 150, // Finished the workflow
  repeated: 50    // Used it again within a week
};

// Real adoption = completion rate, not just views
const realAdoption = metrics.completed / metrics.viewed; // 30%
```

### 3. Cannibalizing Existing Features

**Problem**: New feature has high adoption but kills revenue from existing feature

**Example**:
```typescript
// Added free bulk export
results = {
  bulkExportUsage: 500, // SUCCESS!
  premiumExportPurchases: -300 // DISASTER!
  netRevenue: -$15,000/month
};

// Decision: Make bulk export a paid feature
```

### 4. Not Accounting for Novelty Effect

**Problem**: Week 1 adoption is 40%, week 4 drops to 5%

**Solution**: Run experiment for 3-4 weeks minimum
```typescript
const adoptionOverTime = {
  week1: 0.40, // Novelty
  week2: 0.25, // Cooling off
  week3: 0.15, // Stabilizing
  week4: 0.12  // True steady state ← Use this number
};
```

### 5. Feature Is Too Complex

**Problem**: Users start feature but never complete it

**Symptoms**:
```typescript
const funnel = {
  started: 1000,
  step1Complete: 600,
  step2Complete: 200,
  step3Complete: 50,   // MASSIVE DROP-OFF
  finished: 30
};

// Decision: Simplify or add better onboarding
```

## Post-Experiment Actions

### If Shipping Feature

1. **Roll out to 100%**
   ```typescript
   // Remove experiment code
   // Make feature available to all users

   // Before:
   if (hasFeature(userId, 'bulk-export')) {
     showBulkExport();
   }

   // After:
   showBulkExport(); // Always show
   ```

2. **Improve based on learnings**
   ```typescript
   // If adoption was 15% with tooltip, try banner
   // If completion rate was 40%, simplify workflow
   // If power users loved it, promote to them more
   ```

3. **Update documentation**
   - Help center articles
   - Video tutorials
   - Onboarding flow
   - Changelog

4. **Monitor ongoing usage**
   ```typescript
   // Watch for 4 weeks post-rollout
   metrics = {
     dailyActiveUsers: trackTrend(),
     retentionRate: trackTrend(),
     supportTickets: trackTrend()
   };
   ```

### If Killing Feature

1. **Remove code immediately**
   ```bash
   git rm -r src/features/bulk-export
   git commit -m "Remove bulk export feature - low adoption in experiment"
   ```

2. **Document why it failed**
   ```markdown
   ## Feature Failed: Bulk Export

   **Hypothesis**: Users need bulk export
   **Reality**: Only 8% adopted, no impact on retention

   **Why it failed**:
   - Feature was requested by vocal minority
   - Most users export <10 items at a time
   - Complexity didn't justify maintenance cost

   **Learnings**:
   - Validate feature requests with data, not just asks
   - Check how many users would actually use it
   - Consider simpler solutions first

   **Alternative**:
   - Improve single-item export UX instead
   - Add "export selected" for 2-10 items
   ```

3. **Notify stakeholders**
   - Tell the team
   - Respond to users who requested it
   - Update public roadmap

### If Iterating

1. **Identify specific improvement**
   ```typescript
   // Low adoption → Improve discovery
   // High drop-off → Simplify workflow
   // Good adoption, no metric impact → Add more value

   const iteration = {
     problem: 'Only 8% adoption despite feature requests',
     hypothesis: 'Users dont see the feature',
     change: 'Add prominent banner + onboarding step',
     expectedImpact: '8% → 25% adoption'
   };
   ```

2. **Quick iteration cycle**
   ```
   Week 1: Analyze results
   Week 2: Design improvement
   Week 3: Implement improvement
   Week 4: Test improved version
   ```

## Example Results

### Successful Feature Launch

```
Feature: Real-time collaboration
Experiment: 2 weeks, 2000 users per variant

Control (without feature):
- Conversion: 5.0%
- Retention: 70%
- NPS: 40

Treatment (with feature):
- Adoption: 35% (great!)
- Conversion: 6.2% (+24%)
- Retention: 75% (+5%)
- NPS: 52 (+12 points)

Usage pattern:
- Daily active users: 25%
- Weekly active users: 35%
- Completion rate: 80%

Decision: SHIP IT

Post-rollout:
- Became most-used feature after core functionality
- Drove word-of-mouth growth
- Mentioned in 40% of positive reviews
```

### Failed Feature Launch

```
Feature: AI content suggestions
Experiment: 3 weeks, 1500 users per variant

Control (without feature):
- Engagement: 10 min/day
- Conversion: 5%

Treatment (with feature):
- Adoption: 12% (low)
- Engagement: 9 min/day (WORSE!)
- Conversion: 4.8% (slightly worse)

Usage pattern:
- Clicked: 45%
- Used more than once: 12%
- Completed workflow: 5%

Feedback:
- "Suggestions are not relevant"
- "Slows down my workflow"
- "Easier to do it myself"

Decision: KILL IT

Learnings:
- AI needs to be 10x better than manual to be worth it
- Our dataset too small for quality suggestions
- Focus on core features instead
```

## Checklist

Before launch:

- [ ] Feature fully implemented and tested
- [ ] Feature flag configured
- [ ] Analytics events tracked
- [ ] Error monitoring enabled
- [ ] Performance impact measured
- [ ] Support team briefed
- [ ] Help docs ready (but not published)
- [ ] Rollback plan tested

During experiment:

- [ ] Monitor adoption daily
- [ ] Watch error rates
- [ ] Read user feedback
- [ ] Check completion rates
- [ ] Verify no negative impact on core metrics

After experiment:

- [ ] Full analysis completed
- [ ] Segments analyzed
- [ ] Qualitative feedback reviewed
- [ ] Decision made and documented
- [ ] Learnings recorded
- [ ] Next steps planned

---

**Remember**: Features are expensive to build and maintain. Only ship features that measurably improve the product and are used by a meaningful percentage of users.
