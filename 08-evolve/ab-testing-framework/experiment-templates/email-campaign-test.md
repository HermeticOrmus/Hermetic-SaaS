# Email Campaign Experiment Template

A template for optimizing email campaigns including onboarding sequences, newsletters, promotional emails, and re-engagement campaigns.

## Experiment Overview

**Experiment ID**: `email-[campaign]-[variation]-[year]-[quarter]`
**Category**: Email Marketing & Engagement
**Risk Level**: LOW-MEDIUM - Easy to iterate, affects user experience

## When to Use This Template

Use this template for testing:
- Onboarding email sequences
- Newsletter subject lines and content
- Promotional campaign emails
- Re-engagement / win-back campaigns
- Trial expiration reminders
- Feature announcement emails
- Abandoned cart emails
- Referral program emails

## Pre-Experiment Checklist

- [ ] Email list is clean (no spam traps, valid addresses)
- [ ] Unsubscribe link working
- [ ] SPF/DKIM/DMARC configured (email authentication)
- [ ] Sender reputation is good (>95% deliverability)
- [ ] Both variants pass spam filters (SpamAssassin test)
- [ ] Mobile-responsive design
- [ ] Plain text fallback included
- [ ] UTM parameters for tracking
- [ ] Conversion goals defined

## Experiment Setup

### 1. Hypothesis

```
We believe [EMAIL CHANGE]
will increase [EMAIL METRIC] by [X]%
because [REASONING]

Example:
We believe changing the trial expiration reminder subject line
from "Your trial expires tomorrow"
to "Don't lose access - upgrade now to keep [Feature]"
will increase open rates by 30% and conversions by 50%
because fear of loss + specific value is more compelling than generic urgency
```

### 2. Variants

**Control (A)**: Current Email
```
Subject Line: [Current subject]
Preview Text: [Current preview]
Headline: [Current headline]
Body: [Current body copy]
CTA: [Current CTA button]
Images: [Current images]
```

**Treatment (B)**: Optimized Email
```
Subject Line: [New subject - benefit/urgency focused]
Preview Text: [New preview - complements subject]
Headline: [New headline - reinforces subject]
Body: [New body - addresses objection]
CTA: [New CTA - specific action]
Images: [New images - support message]
```

### 3. Success Metrics

**Primary Metric**: Depends on email type
- Onboarding: Click-through rate (CTR)
- Promotional: Conversion rate
- Newsletter: Open rate + engagement
- Re-engagement: Click-through rate

**Secondary Metrics**:
- Open rate
- Click-through rate
- Click-to-open rate (CTOR)
- Conversion rate
- Time to conversion
- Revenue per email

**Guardrail Metrics**:
- Unsubscribe rate (must stay <0.5%)
- Spam complaint rate (must stay <0.1%)
- Bounce rate (must stay <2%)
- Sender reputation score

### 4. Sample Size Calculation

```javascript
const StatCalculator = require('../statistical-calculator.js');

// For open rate test
const currentOpenRate = 0.25; // 25%
const minimumDetectableEffect = 0.05; // Want to detect 5% absolute change

const openRateSampleSize = StatCalculator.calculateSampleSize({
  baselineRate: currentOpenRate,
  minimumDetectableEffect: minimumDetectableEffect,
  confidenceLevel: 0.95,
  power: 0.80
});

console.log(`Need ${openRateSampleSize} emails per variant for open rate`);

// For conversion rate test (smaller baseline)
const currentConversionRate = 0.05; // 5% of recipients convert
const conversionEffect = 0.015; // Want to detect 1.5% change

const conversionSampleSize = StatCalculator.calculateSampleSize({
  baselineRate: currentConversionRate,
  minimumDetectableEffect: conversionEffect,
  confidenceLevel: 0.95,
  power: 0.80
});

console.log(`Need ${conversionSampleSize} emails per variant for conversion`);
```

### 5. Duration

```
Email sends: Typically one-time or recurring
Sample size: [FROM CALCULATION]

For one-time campaigns:
- Send both variants simultaneously
- 50/50 random split
- Analyze results 3-7 days post-send

For ongoing campaigns (onboarding):
- Run until target sample size reached
- Typically 1-4 weeks depending on volume
- Can start at 10/90 split for safety
```

### 6. Segmentation Plan

Analyze results by:

**Subscriber attributes**:
- New vs existing customers
- Free vs paid users
- Engagement level (active, at-risk, dormant)
- Tenure (how long they've been subscribed)
- Plan tier

**Email client**:
- Gmail
- Outlook
- Apple Mail
- Mobile vs Desktop

**Behavior**:
- Previous email opens
- Click history
- Purchase history

## Implementation Guide

### Email Service Provider Integration

#### Using SendGrid

```typescript
// lib/email-experiment.ts
import { ABTest, createABTest } from '../ab-test-implementation';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const trialExpirationExperiment = createABTest(
  'email-trial-expiration-2024-q1',
  'Trial Expiration: Generic vs Specific Value',
  7, // 1 week
  1000 // 1000 recipients per variant
);

export async function sendTrialExpirationEmail(
  userId: string,
  email: string,
  userName: string,
  trialEndsAt: Date
) {
  // Assign variant
  const variant = trialExpirationExperiment.assignVariant(userId);

  // Get email content based on variant
  const content = getEmailContent(variant, userName, trialEndsAt);

  // Track assignment
  trialExpirationExperiment.trackEvent(userId, 'view', {
    emailType: 'trial_expiration',
    variant: variant
  });

  // Send email
  const msg = {
    to: email,
    from: 'team@yourproduct.com',
    subject: content.subject,
    text: content.text,
    html: content.html,
    customArgs: {
      experiment_id: 'email-trial-expiration-2024-q1',
      variant: variant,
      user_id: userId
    },
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  };

  await sgMail.send(msg);
}

function getEmailContent(
  variant: string,
  userName: string,
  trialEndsAt: Date
) {
  if (variant === 'control') {
    return {
      subject: 'Your trial expires tomorrow',
      text: `Hi ${userName}, your trial expires tomorrow. Upgrade to continue using our product.`,
      html: renderControlEmail(userName, trialEndsAt)
    };
  } else {
    return {
      subject: "Don't lose access to your data - upgrade now",
      text: `Hi ${userName}, your trial expires tomorrow. Upgrade to keep access to your projects and data.`,
      html: renderTreatmentEmail(userName, trialEndsAt)
    };
  }
}
```

#### Using Mailchimp

```typescript
import Mailchimp from '@mailchimp/mailchimp_marketing';

Mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

export async function sendNewsletterExperiment(
  subscribers: Array<{ email: string; userId: string }>
) {
  // Split into variants
  const variantA: any[] = [];
  const variantB: any[] = [];

  subscribers.forEach(sub => {
    const variant = newsletterExperiment.assignVariant(sub.userId);

    if (variant === 'control') {
      variantA.push({
        email_address: sub.email,
        merge_fields: { USER_ID: sub.userId }
      });
    } else {
      variantB.push({
        email_address: sub.email,
        merge_fields: { USER_ID: sub.userId }
      });
    }
  });

  // Create campaign for variant A
  const campaignA = await Mailchimp.campaigns.create({
    type: 'regular',
    recipients: { list_id: process.env.MAILCHIMP_LIST_ID! },
    settings: {
      subject_line: 'Weekly Product Updates',
      from_name: 'Your Product',
      reply_to: 'team@yourproduct.com'
    }
  });

  // Create campaign for variant B
  const campaignB = await Mailchimp.campaigns.create({
    type: 'regular',
    recipients: { list_id: process.env.MAILCHIMP_LIST_ID! },
    settings: {
      subject_line: 'This week: 3 features that will save you hours',
      from_name: 'Your Product',
      reply_to: 'team@yourproduct.com'
    }
  });

  // Send campaigns
  await Mailchimp.campaigns.send(campaignA.id);
  await Mailchimp.campaigns.send(campaignB.id);
}
```

### Tracking Opens and Clicks

```typescript
// api/webhooks/sendgrid.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { trialExpirationExperiment } from '@/lib/email-experiment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const events = req.body;

  for (const event of events) {
    const { experiment_id, variant, user_id } = event.experiment_id || {};
    const eventType = event.event;

    if (experiment_id === 'email-trial-expiration-2024-q1') {
      if (eventType === 'open') {
        // Track email open
        await trackEmailEvent(user_id, variant, 'opened');
      } else if (eventType === 'click') {
        // Track email click
        trialExpirationExperiment.trackEvent(user_id, 'conversion', {
          action: 'clicked',
          url: event.url
        });
      }
    }
  }

  res.status(200).json({ success: true });
}
```

### UTM Parameters for Conversion Tracking

```typescript
function buildCTALink(
  baseUrl: string,
  experimentId: string,
  variant: string,
  userId: string
): string {
  const params = new URLSearchParams({
    utm_source: 'email',
    utm_medium: 'trial_expiration',
    utm_campaign: experimentId,
    utm_content: variant,
    user_id: userId
  });

  return `${baseUrl}?${params.toString()}`;
}

// In email template
const upgradeLink = buildCTALink(
  'https://yourproduct.com/upgrade',
  'email-trial-expiration-2024-q1',
  variant,
  userId
);

const html = `
  <a href="${upgradeLink}" style="background: #0066ff; color: white; padding: 12px 24px;">
    Upgrade Now
  </a>
`;
```

## Analysis & Decision Making

### Email Funnel Analysis

```typescript
const emailFunnel = {
  sent: {
    control: 1000,
    treatment: 1000
  },
  delivered: {
    control: 980,  // 98% deliverability
    treatment: 975 // 97.5% deliverability
  },
  opened: {
    control: 245,  // 25% open rate
    treatment: 341 // 35% open rate (+40% improvement!)
  },
  clicked: {
    control: 49,   // 20% click-to-open rate
    treatment: 102 // 30% click-to-open rate
  },
  converted: {
    control: 10,   // 20% of clickers convert
    treatment: 26  // 25% of clickers convert
  }
};

// Calculate lift at each stage
const analysis = {
  openRateLift: (341 / 975) / (245 / 980) - 1,      // +40%
  ctoRateLift: (102 / 341) / (49 / 245) - 1,        // +50%
  conversionLift: (26 / 975) / (10 / 980) - 1,      // +160%!
  revenuePerEmail: {
    control: (10 * 50) / 1000,  // $0.50 per email
    treatment: (26 * 50) / 1000 // $1.30 per email (+160%)
  }
};

console.log('Treatment wins at EVERY stage of funnel!');
```

### Timing Analysis

```typescript
// Analyze when people open/click
const opensByHour = {
  control: {
    0-6: 5,    // Early morning
    6-9: 45,   // Morning commute
    9-12: 80,  // Work hours
    12-14: 30, // Lunch
    14-17: 60, // Afternoon
    17-24: 25  // Evening
  },
  treatment: {
    // Similar pattern but higher volume
    6-9: 70,
    9-12: 120,
    // etc.
  }
};

// Insight: Most opens 9am-12pm
// Action: Send emails at 8am in recipient's timezone
```

### Segment Analysis

```typescript
const byUserType = {
  newTrials: {
    control: { sent: 500, converted: 3, rate: 0.006 },
    treatment: { sent: 500, converted: 15, rate: 0.030 },
    lift: 4.0 // 5x improvement for new trials!
  },
  extendedTrials: {
    control: { sent: 500, converted: 7, rate: 0.014 },
    treatment: { sent: 500, converted: 11, rate: 0.022 },
    lift: 0.57 // Smaller lift for extended trials
  }
};

// Insight: Treatment works much better for new trials
// Hypothesis: New users more responsive to urgency
```

## Common Pitfalls

### 1. Subject Line Optimization Obsession

**Problem**: Optimizing subject lines without optimizing email content

**Result**:
```typescript
results = {
  openRate: {
    control: 0.20,
    treatment: 0.35 // +75% open rate!
  },
  clickRate: {
    control: 0.05,
    treatment: 0.04 // -20% click rate
  }
};

// Subject line was clickbait
// Email content didn't match expectation
// Users opened but didn't engage
```

**Solution**: Test subject + content together

### 2. Ignoring Unsubscribe Rates

**Problem**: Aggressive email gets opens but burns the list

```typescript
const aggressiveEmail = {
  openRate: 0.40,     // High!
  clickRate: 0.10,    // High!
  unsubscribeRate: 0.02, // 2% unsub (10x normal!)
  spamComplaints: 0.005  // 0.5% spam (5x normal!)
};

// Short-term win, long-term disaster
// Lost 2% of list permanently
// Damaged sender reputation
```

**Solution**: Monitor guardrail metrics closely

### 3. Testing Too Frequently

**Problem**: Email fatigue from constant testing

```typescript
// DON'T DO THIS:
const emailSchedule = {
  monday: 'Onboarding email',
  tuesday: 'Feature announcement',
  wednesday: 'Newsletter',
  thursday: 'Promotional offer',
  friday: 'Weekly digest',
  saturday: 'Weekend sale',
  sunday: 'Case study'
};

// Users unsubscribe or mark as spam
```

**Solution**: Respect inbox, limit to 1-2 emails/week

### 4. Not Personalizing

**Problem**: Generic emails underperform

```typescript
// Generic (control)
subject = "Check out our new feature";

// Personalized (treatment)
subject = "{{firstName}}, your {{companyName}} team will love this";

// Treatment lift: +60% open rate
```

### 5. Forgetting Mobile

**Problem**: 60% of emails opened on mobile, but email not optimized

```typescript
const byDevice = {
  desktop: {
    control: { opened: 100, clicked: 30, rate: 0.30 },
    treatment: { opened: 100, clicked: 35, rate: 0.35 }
  },
  mobile: {
    control: { opened: 150, clicked: 30, rate: 0.20 },
    treatment: { opened: 150, clicked: 15, rate: 0.10 } // WORSE!
  }
};

// Treatment's long subject line cut off on mobile
// Decision: Use shorter subject for mobile
```

### 6. No Plain Text Version

**Problem**: Some email clients block HTML

```typescript
// Always include plain text fallback
const email = {
  html: renderHtmlEmail(variant),
  text: renderPlainTextEmail(variant) // Don't forget this!
};

// 5-10% of recipients use plain text
```

## Post-Experiment Actions

### If Shipping Winner

1. **Update email templates**
   ```typescript
   // Update all instances
   const templates = [
     'trial-expiration',
     'trial-reminder-3days',
     'trial-reminder-1day',
     'trial-expired'
   ];

   // Apply winning patterns
   templates.forEach(template => {
     updateTemplate(template, {
       subjectPattern: 'Specific value + urgency',
       ctaPattern: 'Action-oriented',
       copyPattern: 'Benefit-focused'
     });
   });
   ```

2. **Apply learnings to other emails**
   ```typescript
   // Winning pattern from trial expiration:
   const winningFormula = {
     subject: 'Specific fear of loss + value',
     preview: 'Reinforces subject',
     body: 'Addresses objection upfront',
     cta: 'Specific action (not generic "Learn More")'
   };

   // Apply to:
   - Feature announcements
   - Promotional campaigns
   - Re-engagement emails
   ```

3. **Document in style guide**
   ```markdown
   ## Email Best Practices (Tested & Proven)

   **Subject Lines**:
   - ✓ "Don't lose [specific value]" (+160% conversions)
   - ✗ "Your trial expires soon" (baseline)

   **CTAs**:
   - ✓ "Keep access to [feature]" (+50% clicks)
   - ✗ "Upgrade now" (baseline)

   **Length**:
   - Optimal: 100-150 words
   - Subject: <50 characters (mobile)
   ```

### If Results Are Flat

1. **Try bigger changes**
   ```typescript
   // Instead of tweaking subject line words
   // Try completely different approaches:

   variants = [
     { type: 'urgency', subject: 'Only 24 hours left!' },
     { type: 'fomo', subject: '1,000 users upgraded this week' },
     { type: 'benefit', subject: 'Keep access to your data' },
     { type: 'social', subject: 'Your team is waiting' },
     { type: 'question', subject: 'Ready to upgrade?' }
   ];

   // Test dramatically different approaches
   ```

2. **Re-evaluate timing**
   ```typescript
   // Test send times
   testTimings = [
     '6am recipient time',
     '9am recipient time',
     '2pm recipient time',
     '8pm recipient time'
   ];

   // Can get 30-50% lift just from timing
   ```

## Example Results

### Successful Email Test

```
Email Type: Trial Expiration Reminder
Test: Generic urgency vs Specific value loss
Sample: 2,000 recipients (1,000 per variant)
Duration: 7 days post-send

Control:
- Subject: "Your trial expires tomorrow"
- Opens: 250 (25%)
- Clicks: 50 (20% CTO)
- Conversions: 10 (2% of clicks)
- Revenue: $500

Treatment:
- Subject: "Don't lose access to your data - upgrade now"
- Opens: 350 (35%)
- Clicks: 105 (30% CTO)
- Conversions: 26 (2.6% of clicks)
- Revenue: $1,300

Results:
- Open rate: +40%
- Click-to-open: +50%
- Conversions: +160%
- Revenue per email: +160%
- No increase in unsubscribes
- p-value: <0.001

Decision: SHIP IT

Applied to:
- All trial expiration emails
- Feature limit warnings
- Payment failure notices
- Any email about losing access
```

### Failed Email Test

```
Email Type: Newsletter
Test: Generic title vs Curiosity gap
Sample: 10,000 subscribers (5,000 per variant)

Control:
- Subject: "Product Updates - March 2024"
- Opens: 1,250 (25%)
- Clicks: 125 (10% CTO)
- Unsubscribes: 10 (0.2%)

Treatment:
- Subject: "You won't believe what we just shipped..."
- Opens: 2,000 (40%)
- Clicks: 100 (5% CTO)
- Unsubscribes: 150 (3%)
- Spam complaints: 25 (0.5%)

Results:
- Open rate: +60% (looks good!)
- Click-to-open: -50% (bad)
- Unsubscribe: +1400% (DISASTER)
- Spam: +10x (REPUTATION DAMAGE)

Why it failed:
- Clickbait subject → expectation mismatch
- Users felt deceived
- Burned trust and list health

Decision: KILL IT

Learning:
- Don't use clickbait
- Subject must match content
- Trust > short-term metrics
```

## Checklist

Before sending:

- [ ] Both variants pass spam filter test
- [ ] Mobile rendering checked
- [ ] All links work
- [ ] Unsubscribe link present
- [ ] Plain text version included
- [ ] UTM parameters added
- [ ] Personalization tokens working
- [ ] Sample size calculated
- [ ] Tracking webhooks configured

During test:

- [ ] Monitor deliverability
- [ ] Check open rates daily
- [ ] Watch unsubscribe rate
- [ ] Monitor spam complaints
- [ ] Track conversions

After test:

- [ ] Full funnel analysis
- [ ] Segment analysis
- [ ] Timing analysis
- [ ] Device analysis
- [ ] Decision documented
- [ ] Learnings applied to other emails

---

**Remember**: Your email list is an asset. Protect it by testing responsibly, respecting inbox frequency, and always providing value. One bad email can undo months of list building.
