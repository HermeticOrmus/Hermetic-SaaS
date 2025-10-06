# Retention Playbooks

Comprehensive strategies and automated systems for reducing churn and increasing customer lifetime value.

## Overview

Customer retention is 5-25x cheaper than acquisition. These playbooks help you:
- Predict churn before it happens
- Re-engage inactive users
- Optimize upgrade paths
- Measure and improve retention metrics
- Automate retention campaigns

## Components

### 1. Churn Prediction Model (`churn-prediction.ts`)

Machine learning-based system to identify at-risk customers.

**Churn Signals:**
- Inactive users (14+ days no login)
- Declining usage
- Low feature adoption
- Multiple support tickets
- Payment failures
- Downgrade activity
- Cancel page visits
- Low NPS scores

**Risk Levels:**
- **Critical** (70-100%): Immediate intervention
- **High** (50-69%): Priority outreach
- **Medium** (30-49%): Monitoring
- **Low** (0-29%): Healthy

**Usage:**
```typescript
import { calculateChurnRisk, getAtRiskCustomers } from './churn-prediction';

// Check single user
const prediction = await calculateChurnRisk(userId);
console.log(`Risk Score: ${prediction.riskScore}%`);
console.log(`Recommendations:`, prediction.recommendations);

// Get all at-risk users
const atRisk = await getAtRiskCustomers(50); // min 50% risk
```

**Daily Job:**
```typescript
// Run churn prediction for all active users
const results = await runChurnPredictionJob();

// Results:
// { total: 45, critical: 5, high: 12, medium: 28 }
```

**Alert Team:**
- Critical risk users trigger immediate Slack/email alerts
- Weekly digest of all at-risk customers
- Monthly retention report

### 2. Re-engagement Campaigns (`re-engagement-campaigns.ts`)

Automated email campaigns to win back inactive users.

**Campaigns:**

**30-Day Inactive:**
- Day 0: "We miss you! Here's what's new"
- Day 7: "Quick question about [product]"
- Day 14: "Your account will expire soon"

**60-Day Inactive:**
- Day 0: "Is everything okay?"
- Day 7: "50% off comeback offer"

**90-Day Inactive:**
- Day 0: "Last chance: Data deletion warning"

**Low Feature Usage:**
- Day 0: "You're only scratching the surface"
- Day 3: "5-minute feature tutorial"

**Failed Payment:**
- Day 0: "Payment failed - Update required"
- Day 3: "Reminder: Update payment info"
- Day 7: "Final notice: Account suspension"

**Setup:**
```typescript
import { runReEngagementCampaigns } from './re-engagement-campaigns';

// Run daily via cron
await runReEngagementCampaigns();
```

**Customize Templates:**
```typescript
// Edit email templates
export const emailTemplates = {
  inactive30Day1: {
    subject: "Custom subject here",
    html: `Your custom HTML`,
    text: `Your custom text`,
  },
};
```

### 3. Customer Health Scoring

**Health Score Calculation:**
```typescript
interface HealthScore {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    usage: number;
    engagement: number;
    support: number;
    billing: number;
    nps: number;
  };
}

// Factors:
// - Usage: Login frequency, feature adoption
// - Engagement: Session duration, actions taken
// - Support: Ticket count, resolution time
// - Billing: Payment history, plan value
// - NPS: Survey responses
```

**Health Grades:**
- **A (90-100)**: Champions - Ask for referrals
- **B (80-89)**: Healthy - Upsell opportunities
- **C (70-79)**: At Risk - Proactive support
- **D (60-69)**: High Risk - Urgent intervention
- **F (0-59)**: Critical - Save or let go

### 4. Retention Metrics Dashboard

**Key Metrics:**

**Churn Rate:**
```
Monthly Churn = (Customers Lost / Customers at Start) × 100

Target: < 5% monthly
```

**Retention Rate:**
```
Retention = (Customers at End - New Customers) / Customers at Start × 100

Target: > 90% monthly
```

**Cohort Retention:**
```
Day 1: 95%
Day 7: 75%
Day 30: 55%
Day 90: 45%
```

**Customer Lifetime Value (LTV):**
```
LTV = Average Revenue Per User × Customer Lifespan

Example: $50/month × 24 months = $1,200
```

**LTV:CAC Ratio:**
```
LTV:CAC = Customer Lifetime Value / Customer Acquisition Cost

Target: > 3:1
Excellent: > 5:1
```

**Net Dollar Retention (NDR):**
```
NDR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR × 100

Target: > 100%
```

### 5. Upgrade Path Optimization

**Free to Starter:**
- Trigger: 3 projects created
- Message: "You're running out of projects! Upgrade for unlimited"
- Offer: First month 50% off

**Starter to Pro:**
- Trigger: 5 team members or 10GB storage used
- Message: "Your team is growing! Time to level up"
- Offer: 20% annual discount

**Pro to Enterprise:**
- Trigger: 25 team members or custom features requested
- Message: "Let's discuss custom solutions"
- Offer: Personal demo with account manager

**Implementation:**
```typescript
async function checkUpgradeOpportunity(userId: string) {
  const user = await getUser(userId);
  const usage = await getUserUsage(userId);

  // Free → Starter
  if (user.plan === 'free' && usage.projects >= 3) {
    await sendUpgradeEmail(user, {
      template: 'freeToStarter',
      offer: '50% off first month',
    });
  }

  // Starter → Pro
  if (user.plan === 'starter' && usage.teamMembers >= 5) {
    await sendUpgradeEmail(user, {
      template: 'starterToPro',
      offer: '20% off annual',
    });
  }
}
```

## Retention Strategies

### 1. Onboarding Optimization

**First 7 Days are Critical:**

**Day 0 (Signup):**
- Welcome email
- Onboarding checklist
- Quick start tutorial

**Day 1:**
- Achievement: First project created
- Email: "Great start! Here's what's next"

**Day 3:**
- Check-in email: "How's it going?"
- Offer help if stuck

**Day 7:**
- Survey: "What's your experience so far?"
- Highlight unused features

**Implementation:**
```typescript
// Onboarding campaign
const onboardingSteps = [
  { day: 0, action: 'send_welcome_email' },
  { day: 1, action: 'check_first_project' },
  { day: 3, action: 'send_checkin_email' },
  { day: 7, action: 'send_survey' },
];
```

### 2. Feature Adoption

**Track Feature Usage:**
```sql
SELECT
  user_id,
  COUNT(DISTINCT feature_name) as features_used,
  ARRAY_AGG(DISTINCT feature_name) as feature_list
FROM analytics_events
WHERE event_type = 'feature_used'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
HAVING COUNT(DISTINCT feature_name) < 3;
```

**Promote Unused Features:**
- In-app tooltips
- Feature spotlight emails
- Video tutorials
- Personal walkthroughs

### 3. Proactive Support

**Early Warning System:**
```typescript
// Monitor for frustration signals
const frustrationSignals = [
  'rapid_page_switching',
  'repeated_errors',
  'abandoned_forms',
  'multiple_help_searches',
  'long_idle_time',
];

// Trigger proactive outreach
if (detectFrustration(userId)) {
  await sendProactiveHelp(userId);
}
```

**Proactive Help Email:**
```
Subject: Need help with [feature]?

Hi [name],

I noticed you were trying to [action] and might have hit a snag.

I'm here to help! I can:
- Walk you through it on a quick call
- Send you a video tutorial
- Set it up for you

Just reply to this email.

[Your Name]
```

### 4. Success Milestones

**Celebrate Wins:**
- First project completed
- First team member invited
- First integration connected
- 30 days active
- 100 projects created

**Achievement Emails:**
```
Subject: 🎉 Milestone: 100 projects!

[name], you're crushing it!

You just hit 100 projects. That's amazing.

Here's what we've noticed about power users like you:
- They use [feature X] to save time
- They integrate with [service Y]
- They invite their team

Want to level up even more? Reply and I'll share some pro tips.

Keep up the great work!
```

### 5. Community Building

**Build Engagement:**
- User forum/community
- Feature voting
- Beta programs
- User spotlights
- Webinars and events

**Community Benefits:**
- Higher retention (30%+)
- More referrals
- Better feedback
- Brand advocates

### 6. Cancellation Flow

**Exit Survey:**
```
Why are you leaving?
☐ Too expensive
☐ Missing features
☐ Too complex
☐ Not using it
☐ Found alternative: ________
☐ Other: ________

What could we have done differently?
[Text box]
```

**Save Offers:**
- Expensive? → 50% discount for 3 months
- Missing features? → Show roadmap, ETA
- Too complex? → Free onboarding call
- Not using? → Pause account instead
- Alternative? → Compare features

**Implementation:**
```typescript
async function handleCancellation(userId: string, reason: string) {
  // Show exit survey
  const survey = await showExitSurvey(userId);

  // Make save offer based on reason
  if (reason === 'too_expensive') {
    await offerDiscount(userId, 50, 3); // 50% for 3 months
  } else if (reason === 'missing_features') {
    await showRoadmap(userId);
  } else if (reason === 'too_complex') {
    await offerOnboarding(userId);
  }

  // If still canceling
  if (!saveSuccessful) {
    await processRefund(userId);
    await sendGoodbyeEmail(userId);
    await scheduleWinBackCampaign(userId, 60); // Try in 60 days
  }
}
```

## Benchmarks

**SaaS Retention Benchmarks:**

| Metric | Good | Great | Excellent |
|--------|------|-------|-----------|
| Monthly Churn | < 5% | < 3% | < 2% |
| Annual Churn | < 40% | < 25% | < 15% |
| Logo Retention | > 85% | > 90% | > 95% |
| Net Dollar Retention | > 100% | > 110% | > 120% |
| LTV:CAC | > 3:1 | > 5:1 | > 7:1 |
| Payback Period | < 12mo | < 6mo | < 3mo |

**Cohort Retention:**
- Day 1: 90-95%
- Week 1: 70-80%
- Month 1: 50-60%
- Month 3: 40-50%
- Month 6: 30-40%
- Year 1: 25-35%

## Implementation Checklist

**Setup:**
- [ ] Install churn prediction model
- [ ] Set up re-engagement campaigns
- [ ] Create email templates
- [ ] Configure health scoring
- [ ] Set up retention dashboard
- [ ] Define upgrade triggers
- [ ] Create exit survey

**Monitoring:**
- [ ] Track churn rate weekly
- [ ] Review at-risk customers daily
- [ ] Monitor campaign performance
- [ ] Analyze cohort retention monthly
- [ ] Calculate LTV quarterly

**Optimization:**
- [ ] A/B test email templates
- [ ] Refine churn signals
- [ ] Improve onboarding flow
- [ ] Test save offers
- [ ] Optimize upgrade paths

## Resources

- [Churn Rate Calculator](https://www.paddle.com/resources/churn-rate-calculator)
- [SaaS Metrics Guide](https://www.saastr.com/saas-metrics-2/)
- [Retention Strategies](https://www.profitwell.com/customer-retention)
- [LTV:CAC Optimization](https://www.cobloom.com/blog/ltv-cac-ratio)

## Cost Savings

**Retention vs Acquisition:**
- Acquiring new customer: $100-500 CAC
- Retaining customer: $10-50 per save
- **Savings: 90%+**

**Example:**
- Monthly churn: 100 customers × $50 MRR = $5,000 lost
- Save 50% through retention: $2,500 saved
- Cost of retention campaign: $500
- **Net savings: $2,000/month = $24,000/year**

**ROI Calculation:**
```
Retention ROI = (Saved Revenue - Campaign Cost) / Campaign Cost

Example: ($2,500 - $500) / $500 = 4x ROI
```
