# Landing Page Optimization Template

A template for testing landing page variations to improve conversion rates. Perfect for homepage, pricing page, signup pages, and marketing pages.

## Experiment Overview

**Experiment ID**: `landing-[page]-[variation]-[year]-[quarter]`
**Category**: Conversion Optimization
**Risk Level**: LOW - Easy to rollback, high potential upside

## When to Use This Template

Use this template for testing:
- Hero section copy and design
- Call-to-action (CTA) buttons
- Value proposition messaging
- Social proof placement
- Form length and fields
- Page layout and structure
- Images and videos
- Pricing display
- Trust signals (testimonials, logos, security badges)

## Pre-Experiment Checklist

- [ ] Page gets sufficient traffic (>1000 visitors/week minimum)
- [ ] Analytics tracking set up correctly
- [ ] Conversion goal clearly defined
- [ ] Both variants designed and approved
- [ ] Mobile responsive (test on all devices)
- [ ] Page load time measured
- [ ] SEO impact considered (if changing meta tags)
- [ ] Brand consistency maintained

## Experiment Setup

### 1. Hypothesis

```
We believe [CHANGE TO PAGE]
will increase [CONVERSION METRIC] by [X]%
because [REASONING BASED ON USER RESEARCH]

Example:
We believe changing the hero headline from "The best project management tool"
to "Ship projects 2x faster with less chaos"
will increase trial signups by 20%
because benefit-focused copy outperforms feature-focused copy
```

### 2. Variants

**Control (A)**: Current Landing Page
```
Headline: [Current headline]
Subheadline: [Current subheadline]
CTA: [Current CTA text]
Layout: [Current layout]
Social Proof: [Current placement]
```

**Treatment (B)**: Optimized Landing Page
```
Headline: [New headline - benefit-focused]
Subheadline: [New subheadline - addresses pain point]
CTA: [New CTA - action-oriented]
Layout: [New layout]
Social Proof: [New placement - above fold]
```

### 3. Success Metrics

**Primary Metric**: Conversion Rate
- Definition: % of visitors who complete primary CTA
- Current baseline: [X]%
- Target: [X + Y]%

**Secondary Metrics**:
- Click-through rate on CTA button
- Time on page
- Scroll depth (% who scroll to key sections)
- Video play rate (if applicable)
- Form start rate vs completion rate

**Guardrail Metrics**:
- Bounce rate (shouldn't increase significantly)
- Page load time (must stay <3 seconds)
- Trial-to-paid conversion (ensure quality leads)
- Brand perception (monitor social mentions)

### 4. Sample Size Calculation

```javascript
const StatCalculator = require('../statistical-calculator.js');

const currentConversionRate = 0.03; // 3% visitor → signup
const minimumDetectableEffect = 0.006; // Want to detect 0.6% absolute improvement (20% relative)

const sampleSize = StatCalculator.calculateSampleSize({
  baselineRate: currentConversionRate,
  minimumDetectableEffect: minimumDetectableEffect,
  confidenceLevel: 0.95,
  power: 0.80
});

console.log(`Need ${sampleSize} visitors per variant`);
// Typical result: 4,000-10,000 visitors per variant
```

### 5. Duration

```
Weekly traffic: [INSERT YOUR NUMBER]
Sample size needed per variant: [FROM CALCULATION]
Duration: [SAMPLE SIZE × 2 / WEEKLY TRAFFIC] weeks

Minimum: 1 week (capture weekly traffic patterns)
Recommended: 2 weeks (capture two full cycles)
Maximum: 4 weeks (avoid external factors)
```

### 6. Segmentation Plan

Analyze results by:

**Traffic source**:
- Organic search (Google)
- Paid ads (Google Ads, Facebook)
- Social media (Twitter, LinkedIn)
- Direct traffic
- Referrals

**Device**:
- Desktop
- Mobile
- Tablet

**Visitor type**:
- New visitors
- Returning visitors

**Geography**:
- Key markets (US, EU, etc.)

## Implementation Guide

### Next.js Implementation

```typescript
// lib/landing-page-experiment.ts
import { ABTest, createABTest } from '../ab-test-implementation';

export const heroExperiment = createABTest(
  'landing-hero-benefit-2024-q1',
  'Hero Section: Feature vs Benefit Copy',
  14, // 2 weeks
  5000 // 5000 visitors per variant
);

// pages/index.tsx
import { heroExperiment } from '@/lib/landing-page-experiment';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [variant, setVariant] = useState<string>('control');

  useEffect(() => {
    // Get or create visitor ID (stored in cookie)
    const visitorId = getOrCreateVisitorId();

    // Assign variant
    const assignedVariant = heroExperiment.assignVariant(visitorId);
    setVariant(assignedVariant);

    // Track page view
    trackPageView(visitorId, assignedVariant);
  }, []);

  return (
    <div>
      {variant === 'control' ? (
        <HeroControl onSignup={handleSignup} />
      ) : (
        <HeroTreatment onSignup={handleSignup} />
      )}

      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}

// Hero variants
function HeroControl({ onSignup }) {
  return (
    <section className="hero">
      <h1>The best project management tool</h1>
      <p>Manage your projects efficiently with our powerful features</p>
      <button onClick={onSignup}>Start Free Trial</button>
    </section>
  );
}

function HeroTreatment({ onSignup }) {
  return (
    <section className="hero">
      <h1>Ship projects 2x faster with less chaos</h1>
      <p>Stop drowning in meetings and Slack messages. Get back to building.</p>
      <button onClick={onSignup}>Start Shipping Faster</button>
    </section>
  );
}

// Track conversion
function handleSignup() {
  const visitorId = getVisitorId();

  // Track conversion in experiment
  heroExperiment.trackEvent(visitorId, 'conversion', {
    action: 'signup',
    timestamp: new Date()
  });

  // Continue with normal signup flow
  window.location.href = '/signup';
}
```

### Cookie-Based Visitor Tracking

```typescript
// lib/visitor-tracking.ts

export function getOrCreateVisitorId(): string {
  // Check for existing visitor ID in cookie
  let visitorId = getCookie('visitor_id');

  if (!visitorId) {
    // Create new visitor ID
    visitorId = generateVisitorId();
    setCookie('visitor_id', visitorId, 365); // 1 year expiry
  }

  return visitorId;
}

function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}
```

### Google Analytics Integration

```typescript
// lib/analytics.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function trackPageView(visitorId: string, variant: string) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'experiment_viewed', {
      experiment_id: 'landing-hero-benefit-2024-q1',
      variant: variant,
      visitor_id: visitorId
    });
  }
}

export function trackConversion(visitorId: string, variant: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      experiment_id: 'landing-hero-benefit-2024-q1',
      variant: variant,
      visitor_id: visitorId,
      send_to: 'AW-CONVERSION-ID' // Your Google Ads conversion ID
    });
  }
}
```

### Server-Side Rendering (SSR)

```typescript
// pages/index.tsx (with SSR)
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  // Get visitor ID from cookie or create new one
  const cookies = parseCookies(req);
  let visitorId = cookies.visitor_id;

  if (!visitorId) {
    visitorId = generateVisitorId();
    // Set cookie in response
    res.setHeader(
      'Set-Cookie',
      `visitor_id=${visitorId}; Path=/; Max-Age=31536000; HttpOnly`
    );
  }

  // Assign variant server-side for no flicker
  const variant = heroExperiment.assignVariant(visitorId);

  return {
    props: {
      visitorId,
      variant
    }
  };
};

export default function HomePage({ visitorId, variant }) {
  // No client-side variant assignment needed
  // Page renders with correct variant immediately

  return (
    <div>
      {variant === 'control' ? <HeroControl /> : <HeroTreatment />}
    </div>
  );
}
```

## Analysis & Decision Making

### Funnel Analysis

```typescript
// Track full funnel
const funnel = {
  pageViews: {
    control: 5000,
    treatment: 5000
  },
  ctaClicks: {
    control: 750,  // 15% CTR
    treatment: 900 // 18% CTR
  },
  signups: {
    control: 150,  // 3% conversion
    treatment: 200 // 4% conversion
  },
  trialToPayment: {
    control: 8,    // 5.3% of signups
    treatment: 12  // 6.0% of signups
  }
};

// Calculate where the lift came from
const analysis = {
  ctaClickLift: (900 / 5000) / (750 / 5000) - 1, // +20%
  signupLift: (200 / 5000) / (150 / 5000) - 1,   // +33%
  qualityLift: (12 / 200) / (8 / 150) - 1        // +13%
};

// Insight: Treatment improves both quantity AND quality of signups
```

### Segment Analysis

```typescript
// Analyze by traffic source
const bySource = {
  organic: {
    control: { visitors: 2000, conversions: 80, rate: 0.04 },
    treatment: { visitors: 2000, conversions: 120, rate: 0.06 },
    lift: 0.50 // +50% for organic!
  },
  paid: {
    control: { visitors: 2000, conversions: 50, rate: 0.025 },
    treatment: { visitors: 2000, conversions: 60, rate: 0.03 },
    lift: 0.20 // +20% for paid
  },
  direct: {
    control: { visitors: 1000, conversions: 20, rate: 0.02 },
    treatment: { visitors: 1000, conversions: 20, rate: 0.02 },
    lift: 0 // No change for direct
  }
};

// Insight: Treatment works better for organic traffic
// Hypothesis: Organic visitors need more convincing (benefit copy helps)
// Paid visitors already convinced (less impact)
```

### Heatmap Analysis

Use tools like Hotjar, Clarity, or Crazy Egg:

```typescript
const heatmapInsights = {
  control: {
    avgScrollDepth: 45%, // Users don't scroll far
    ctaAttention: 'Low', // CTA gets few clicks
    heroInteraction: 'Medium'
  },
  treatment: {
    avgScrollDepth: 65%, // Users scroll more (engaged!)
    ctaAttention: 'High', // CTA gets lots of clicks
    heroInteraction: 'High'
  }
};

// Insight: Benefit-focused copy engages users more
```

## Common Pitfalls

### 1. Testing Too Many Changes at Once

**Problem**: Can't tell which change caused the improvement

**Bad approach**:
```typescript
// Changed 10 things:
- Headline
- Subheadline
- CTA button text
- CTA button color
- Hero image
- Layout
- Social proof placement
- Pricing display
- Form fields
- Footer links

// Result: Treatment wins, but you don't know why!
```

**Good approach**:
```typescript
// Test 1: Headline only
// Test 2: If wins, test CTA button
// Test 3: If wins, test layout
// Sequential testing builds on wins
```

### 2. Mobile vs Desktop Not Considered

**Problem**: Desktop improves, mobile gets worse

**Solution**:
```typescript
const byDevice = {
  desktop: {
    control: 0.04,
    treatment: 0.06,
    lift: 0.50 // +50% on desktop!
  },
  mobile: {
    control: 0.02,
    treatment: 0.015,
    lift: -0.25 // -25% on mobile!
  }
};

// Decision: Ship for desktop only, iterate mobile
// OR: Fix mobile layout before shipping
```

### 3. Optimizing for Wrong Metric

**Problem**: Signup rate increases but they're low-quality leads

**Example**:
```typescript
// Changed CTA from "Start Free Trial" to "Get Free Access Forever"

results = {
  signups: {
    control: 150,
    treatment: 300 // 2x signups!
  },
  paidConversions: {
    control: 8,
    treatment: 3  // BUT 63% FEWER paying customers!
  }
};

// "Free forever" attracts wrong customers
// Decision: KILL IT despite higher signups
```

### 4. Not Running Long Enough

**Problem**: Different traffic patterns by day

**Example**:
```typescript
const dailyConversion = {
  monday: 0.05,
  tuesday: 0.04,
  wednesday: 0.03,
  thursday: 0.035,
  friday: 0.02,  // Low - people distracted by weekend
  saturday: 0.01,
  sunday: 0.015
};

// If you only test Mon-Wed, you miss the weekend dip
// Always run full weeks
```

### 5. Ignoring Page Load Time

**Problem**: New design looks better but loads slower

**Solution**:
```typescript
const performance = {
  control: {
    loadTime: 1.2, // seconds
    conversion: 0.03
  },
  treatment: {
    loadTime: 3.5, // seconds (hero video!)
    conversion: 0.025 // WORSE despite better design
  }
};

// Every second of load time = ~7% drop in conversions
// Optimize images/videos before testing
```

### 6. Forgetting Brand Voice

**Problem**: Treatment converts better but sounds like spam

**Example**:
```typescript
// Treatment headline
"Make $10,000/month with this ONE WEIRD TRICK"

// Converts better but:
- Damages brand trust
- Attracts wrong customers
- Long-term harm for short-term gain

// Don't sacrifice brand for conversions
```

## Post-Experiment Actions

### If Shipping Winner

1. **Implement gradually**
   ```typescript
   // Week 1: 25% of traffic
   // Week 2: 50% of traffic
   // Week 3: 75% of traffic
   // Week 4: 100% of traffic

   // Watch for regression or external factors
   ```

2. **Update all related pages**
   ```
   - Homepage
   - Pricing page
   - Product pages
   - Ad landing pages
   - Email templates

   // Keep messaging consistent
   ```

3. **Document learnings**
   ```markdown
   ## Landing Page Test: Benefit vs Feature Copy

   **Winner**: Benefit-focused copy
   **Lift**: +33% signups, +50% on organic traffic
   **Why it worked**: Addresses pain point directly
   **Apply to**: All marketing copy, emails, ads

   **Winning formula**:
   - Lead with benefit (what they achieve)
   - Follow with pain point (what they avoid)
   - End with CTA (how they get started)
   ```

4. **Keep testing**
   ```typescript
   // Don't stop at one win
   // Continue optimization

   const nextTests = [
     'Test CTA button copy',
     'Test social proof placement',
     'Test pricing display',
     'Test form length'
   ];
   ```

### If Results Are Flat

1. **Analyze why**
   ```typescript
   possibleReasons = {
     changeWasntBigEnough: 'Test bolder variations',
     wrongAudience: 'Segment by traffic source',
     wrongMetric: 'Look at quality, not just quantity',
     wrongPage: 'Test elsewhere first'
   };
   ```

2. **Try bigger swings**
   ```
   Instead of: Tweaking button color
   Try: Complete redesign of hero section

   Instead of: Changing headline words
   Try: Changing entire value proposition
   ```

## Example Results

### Successful Optimization

```
Page: Homepage
Test: Headline + CTA button
Duration: 2 weeks
Traffic: 10,000 visitors per variant

Control:
- Headline: "Project Management Software"
- CTA: "Sign Up Free"
- Conversions: 300 (3.0%)

Treatment:
- Headline: "Ship Projects 2x Faster"
- CTA: "Start Shipping Faster"
- Conversions: 450 (4.5%)

Results:
- +50% conversion rate
- p-value: 0.001
- Significant across all segments
- No increase in bounce rate
- Page load time identical

Decision: SHIP IT

Impact:
- +$50k MRR in first month
- +150% signups
- Mentioned in testimonials
- Applied learnings to all marketing
```

### Failed Optimization

```
Page: Pricing page
Test: Reduced form fields (10 → 3)
Duration: 2 weeks
Traffic: 8,000 visitors per variant

Control:
- Fields: Email, Name, Company, Industry, Size, Phone, Role, Goal, Budget, Timeline
- Signups: 240 (3.0%)
- Paid conversions: 12 (5% of signups)

Treatment:
- Fields: Email, Name, Company
- Signups: 400 (5.0%)
- Paid conversions: 8 (2% of signups)

Results:
- +67% signup rate (looks good!)
- -60% paid conversion rate (DISASTER)
- Net: Fewer paying customers

Why it failed:
- Long form qualified leads
- Short form attracted tire-kickers
- Lost important info for sales follow-up

Decision: KILL IT

Learning:
- More signups ≠ better
- Qualify leads before celebrating
- For B2B, forms can filter low-quality
```

## Checklist

Before launch:

- [ ] Both variants designed and approved
- [ ] Mobile responsive verified
- [ ] Page load time <3 seconds
- [ ] Analytics tracking tested
- [ ] Conversion tracking works
- [ ] Sample size calculated
- [ ] Visitor ID system implemented
- [ ] No flicker on page load (if SSR)

During test:

- [ ] Monitor conversion rates daily
- [ ] Check for technical issues
- [ ] Review heatmaps weekly
- [ ] Read user feedback
- [ ] Verify traffic split is 50/50
- [ ] No peeking at significance too early

After test:

- [ ] Full statistical analysis
- [ ] Segment analysis completed
- [ ] Heatmap insights reviewed
- [ ] Decision made and documented
- [ ] Winner implemented
- [ ] Next test planned

---

**Remember**: Your landing page is your first impression. Test continuously, but always maintain brand integrity and focus on attracting the right customers, not just more customers.
