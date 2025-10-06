# Sales Automations for SaaS

**Automate sales processes to scale revenue without scaling headcount.**

As a solo founder or small team, you can't manually handle every sales interaction. These automations let you compete with companies 10x your size.

---

## The Solo Founder Sales Stack

**Goal:** $10K-100K MRR with zero salespeople

```
Traffic → Landing Page → Signup → Onboarding → Upgrade Prompts → Payment
  ↓           ↓            ↓          ↓             ↓               ↓
Auto    Auto Optimize  Auto Email  Auto Tour  Auto Trigger   Auto Invoice
```

**Every step automated. You focus on product.**

---

## Automation Layers

### Layer 1: Lead Capture (Visitors → Leads)

**Tools:**
- Forms: Tally, Typeform, native HTML
- Chat: Intercom, Crisp, Plain
- Calendly: For demo bookings

**Automations:**
```javascript
// Auto-capture and qualify leads
visitor → {
  source: 'google',
  page: '/pricing',
  action: 'signup_clicked'
} → Add to CRM with score
```

### Layer 2: Lead Qualification (Leads → Qualified)

**Tools:**
- Lead scoring: Clearbit, FullEnrich
- Email verification: NeverBounce, ZeroBounce
- Company data: Clearbit Enrichment

**Automations:**
```javascript
// Auto-score leads
const leadScore = calculateScore({
  email_domain: 'stripe.com' ? +20 : 0, // Company email
  company_size: '>100' ? +15 : 0,      // Enterprise
  viewed_pricing: true ? +10 : 0,       // Intent
  trial_started: true ? +25 : 0         // High intent
})

if (leadScore > 50) {
  segment = 'hot'
  action = 'send_to_sales'
} else {
  segment = 'nurture'
  action = 'email_automation'
}
```

### Layer 3: Nurture (Qualified → Engaged)

**Tools:**
- Email: Resend, Customer.io, Loops
- Sequencing: Lemlist, Reply.io
- Content: Notion, Ghost

**Automations:**
- Welcome email sequence (Day 0-14)
- Feature education drip
- Case study sharing
- Re-engagement campaigns

### Layer 4: Conversion (Engaged → Customer)

**Tools:**
- Checkout: Stripe Checkout, Paddle
- Invoicing: Stripe Billing, PayPal
- Proposals: PandaDoc (for enterprise)

**Automations:**
- Trial expiration reminders
- Upgrade prompts (in-app + email)
- Abandoned cart recovery
- One-click checkout

### Layer 5: Expansion (Customer → Power User)

**Tools:**
- Usage tracking: Mixpanel, Amplitude
- Feature adoption: Pendo, Appcues
- Feedback: Canny, Frill

**Automations:**
- Upsell prompts (when hitting limits)
- Cross-sell (complementary features)
- Annual upgrade offers
- Referral program triggers

---

## Essential Automations (Implement First)

### 1. Welcome Email Sequence

**When:** User signs up
**Goal:** Get to "Aha Moment"
**Tools:** Resend, Loops, Customer.io

```javascript
// Trigger: New user signup
const welcomeSequence = [
  {
    delay: 0, // Immediately
    template: 'welcome',
    data: { name: user.name, product: 'YourSaaS' }
  },
  {
    delay: 24 * 60 * 60 * 1000, // 1 day
    condition: 'if user.hasCompletedFirstAction === false',
    template: 'getting-started-reminder'
  },
  {
    delay: 3 * 24 * 60 * 60 * 1000, // 3 days
    template: 'feature-highlight',
    data: { feature: 'most-valuable-feature' }
  }
]

await emailService.startSequence(user.email, welcomeSequence)
```

**Expected Impact:**
- 30-40% increase in activation
- 20-25% increase in trial-to-paid conversion

---

### 2. Trial Expiration Reminders

**When:** Trial ending soon
**Goal:** Convert to paid before expiration
**Tools:** Cron job + email service

```javascript
// Run daily
async function sendTrialReminders() {
  // 3 days before expiration
  const threeDayReminders = await db.users.findMany({
    where: {
      trial_ends_at: {
        gte: new Date(),
        lte: addDays(new Date(), 3)
      },
      subscription_status: 'trial',
      reminder_sent_3day: false
    }
  })

  for (const user of threeDayReminders) {
    await sendEmail(user.email, 'trial-ending-3days', {
      daysLeft: 3,
      upgradeUrl: `${DOMAIN}/upgrade`
    })
    await db.users.update({
      where: { id: user.id },
      data: { reminder_sent_3day: true }
    })
  }

  // 1 day before
  const oneDayReminders = await db.users.findMany({
    where: {
      trial_ends_at: {
        gte: new Date(),
        lte: addDays(new Date(), 1)
      },
      subscription_status: 'trial',
      reminder_sent_1day: false
    }
  })

  for (const user of oneDayReminders) {
    await sendEmail(user.email, 'trial-ending-tomorrow', {
      upgradeUrl: `${DOMAIN}/upgrade`
    })
    await db.users.update({
      where: { id: user.id },
      data: { reminder_sent_1day: true }
    })
  }

  // Trial just ended
  const expiredToday = await db.users.findMany({
    where: {
      trial_ends_at: {
        gte: startOfDay(new Date()),
        lt: endOfDay(new Date())
      },
      subscription_status: 'trial'
    }
  })

  for (const user of expiredToday) {
    await sendEmail(user.email, 'trial-expired', {
      upgradeUrl: `${DOMAIN}/upgrade`
    })
    await db.users.update({
      where: { id: user.id },
      data: { subscription_status: 'expired' }
    })
  }
}

// Schedule: Every day at 10am
cron.schedule('0 10 * * *', sendTrialReminders)
```

**Expected Impact:**
- 15-20% increase in trial conversion
- Reduces "silent churn" (forgot to decide)

---

### 3. In-App Upgrade Prompts

**When:** User hits limit or shows upgrade intent
**Goal:** Convert free/trial to paid
**Tools:** React/Vue component + analytics

```javascript
// Component: UpgradePrompt.jsx
import { useState, useEffect } from 'react'

function UpgradePrompt({ user, trigger }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show prompt when hitting limits
    const shouldShow = checkShouldShowPrompt(user, trigger)
    if (shouldShow) {
      setShow(true)
      analytics.track('upgrade_prompt_shown', {
        user_id: user.id,
        trigger: trigger,
        plan: user.plan
      })
    }
  }, [user, trigger])

  if (!show) return null

  return (
    <div className="upgrade-modal">
      <div className="modal-content">
        <h2>You've reached your {trigger} limit!</h2>
        <p>
          Upgrade to Pro to unlock unlimited {trigger} and keep growing.
        </p>

        <div className="pricing">
          <div className="plan">
            <h3>Pro</h3>
            <div className="price">$99<span>/month</span></div>
            <ul>
              <li>Unlimited {trigger}</li>
              <li>Priority support</li>
              <li>Advanced features</li>
            </ul>
            <button onClick={() => handleUpgrade('pro')}>
              Upgrade Now
            </button>
          </div>
        </div>

        <button className="close" onClick={() => setShow(false)}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

// Trigger conditions
function checkShouldShowPrompt(user, trigger) {
  const triggers = {
    projects: user.projects.length >= FREE_TIER_PROJECT_LIMIT,
    team_members: user.team.length >= FREE_TIER_TEAM_LIMIT,
    api_calls: user.usage.api_calls >= FREE_TIER_API_LIMIT,
    storage: user.usage.storage_mb >= FREE_TIER_STORAGE_LIMIT
  }

  return triggers[trigger] || false
}

// Usage in app
export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <UpgradePrompt user={user} trigger="projects" />
      {/* Rest of dashboard */}
    </div>
  )
}
```

**Expected Impact:**
- 20-30% increase in free-to-paid conversion
- Better user experience (clear path to value)

---

### 4. Failed Payment Recovery

**When:** Payment fails
**Goal:** Recover revenue, prevent churn
**Tools:** Stripe webhooks + email

```javascript
// Webhook handler
app.post('/webhook/stripe', async (req, res) => {
  const event = req.body

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const customer = await stripe.customers.retrieve(invoice.customer)

    // Attempt 1: Immediate email
    await sendEmail(customer.email, 'payment-failed-attempt-1', {
      amount: formatCurrency(invoice.amount_due),
      updateUrl: `${DOMAIN}/billing`
    })

    // Attempt 2: 3 days later (via scheduled job)
    await scheduleEmail({
      email: customer.email,
      template: 'payment-failed-attempt-2',
      sendAt: addDays(new Date(), 3)
    })

    // Attempt 3: 7 days later
    await scheduleEmail({
      email: customer.email,
      template: 'payment-failed-final-notice',
      sendAt: addDays(new Date(), 7)
    })

    // Update user status
    await db.users.update({
      where: { stripe_customer_id: customer.id },
      data: {
        payment_status: 'failed',
        payment_failed_at: new Date()
      }
    })
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    const customer = await stripe.customers.retrieve(invoice.customer)

    // Clear failed status
    await db.users.update({
      where: { stripe_customer_id: customer.id },
      data: {
        payment_status: 'active',
        payment_failed_at: null
      }
    })

    // Send success email
    await sendEmail(customer.email, 'payment-succeeded', {
      amount: formatCurrency(invoice.amount_paid),
      receiptUrl: invoice.hosted_invoice_url
    })
  }

  res.json({ received: true })
})
```

**Expected Impact:**
- Recover 30-40% of failed payments
- Reduce involuntary churn by 25%

---

### 5. Usage-Based Upsells

**When:** User approaches plan limits
**Goal:** Proactive upgrade before hitting wall
**Tools:** Background job + analytics

```javascript
// Daily job to check usage and send alerts
async function checkUsageAndUpsell() {
  const users = await db.users.findMany({
    where: { subscription_status: 'active' }
  })

  for (const user of users) {
    const plan = PLANS[user.plan]
    const usage = await getUsage(user.id)

    // Check each metric
    for (const [metric, limit] of Object.entries(plan.limits)) {
      const current = usage[metric]
      const percentage = (current / limit) * 100

      // 80% usage - soft nudge
      if (percentage >= 80 && percentage < 90) {
        await sendEmail(user.email, 'usage-alert-80', {
          metric,
          current,
          limit,
          nextPlan: getNextPlan(user.plan)
        })
      }

      // 90% usage - stronger nudge
      if (percentage >= 90 && percentage < 100) {
        await sendEmail(user.email, 'usage-alert-90', {
          metric,
          current,
          limit,
          nextPlan: getNextPlan(user.plan),
          upgradeUrl: `${DOMAIN}/upgrade`
        })
      }

      // 100% usage - upgrade required
      if (percentage >= 100) {
        // Show in-app modal
        await db.users.update({
          where: { id: user.id },
          data: { show_upgrade_modal: true }
        })

        await sendEmail(user.email, 'usage-limit-reached', {
          metric,
          upgradeUrl: `${DOMAIN}/upgrade`
        })
      }
    }
  }
}

// Run daily at 9am
cron.schedule('0 9 * * *', checkUsageAndUpsell)
```

**Expected Impact:**
- 15-25% increase in upgrades
- Better user experience (no surprise limits)
- Predictable expansion revenue

---

### 6. Churn Prevention

**When:** User shows churn signals
**Goal:** Re-engage before they leave
**Tools:** Behavior tracking + email

```javascript
// Detect churn signals
async function detectChurnRisk() {
  const users = await db.users.findMany({
    where: {
      subscription_status: 'active',
      created_at: { lt: subDays(new Date(), 30) } // Only users > 30 days
    }
  })

  for (const user of users) {
    const signals = await calculateChurnRisk(user)

    if (signals.score > 70) {
      // High risk - intervene
      await sendEmail(user.email, 'churn-prevention-high-risk', {
        name: user.name,
        helpUrl: `${DOMAIN}/help`,
        bookCallUrl: 'https://calendly.com/yourcompany/customer-success'
      })

      // Alert founder/CS team
      await slack.send({
        channel: '#customer-success',
        message: `🚨 High churn risk: ${user.email} (score: ${signals.score})`
      })
    } else if (signals.score > 50) {
      // Medium risk - soft check-in
      await sendEmail(user.email, 'check-in-how-are-things', {
        name: user.name
      })
    }
  }
}

function calculateChurnRisk(user) {
  let score = 0
  const signals = []

  // No logins in 14 days
  if (daysSince(user.last_login_at) > 14) {
    score += 30
    signals.push('inactive_14d')
  }

  // No usage in 7 days
  if (daysSince(user.last_usage_at) > 7) {
    score += 25
    signals.push('no_usage_7d')
  }

  // Subscription ends soon, no renewal intent
  if (daysSince(user.subscription_end) < 7 && !user.auto_renew) {
    score += 40
    signals.push('subscription_ending')
  }

  // Opened "cancel account" page
  if (user.viewed_cancel_page) {
    score += 35
    signals.push('viewed_cancel')
  }

  // Low feature adoption (using < 3 features)
  if (user.features_used.length < 3) {
    score += 20
    signals.push('low_adoption')
  }

  return { score, signals }
}

// Run daily at 8am
cron.schedule('0 8 * * *', detectChurnRisk)
```

**Expected Impact:**
- 20-30% reduction in churn
- Opportunity to get feedback and improve product

---

## Advanced Automations

### 7. Lead Scoring & Routing

**For sales-led products:**

```javascript
// Auto-score and route high-value leads to sales
async function scoreAndRouteLead(lead) {
  const score = await calculateLeadScore(lead)

  if (score >= 80) {
    // Enterprise lead - route to sales
    await crm.createLead({
      email: lead.email,
      company: lead.company,
      score: score,
      source: lead.source,
      assignTo: 'sales@company.com'
    })

    await sendSlack({
      channel: '#sales',
      message: `🔥 Hot lead: ${lead.company} (${lead.email}) - Score: ${score}`
    })

    await sendEmail('sales@company.com', 'new-enterprise-lead', {
      lead: lead,
      score: score
    })
  } else {
    // Self-serve - automated nurture
    await emailService.addToSequence(lead.email, 'self-serve-nurture')
  }
}

function calculateLeadScore(lead) {
  let score = 0

  // Company email (not gmail.com)
  if (!isFreeEmail(lead.email)) score += 20

  // Company size
  const sizeScores = {
    '1-10': 10,
    '11-50': 25,
    '51-200': 40,
    '201-1000': 60,
    '1000+': 80
  }
  score += sizeScores[lead.company_size] || 0

  // Industry match
  const targetIndustries = ['SaaS', 'Technology', 'Finance']
  if (targetIndustries.includes(lead.industry)) score += 15

  // Intent signals
  if (lead.viewed_pricing) score += 10
  if (lead.requested_demo) score += 30
  if (lead.started_trial) score += 25

  return score
}
```

---

### 8. Referral Program Automation

```javascript
// Auto-generate referral links and track rewards
async function createReferralLink(user) {
  const referralCode = generateCode(user.id)

  await db.referralLinks.create({
    data: {
      user_id: user.id,
      code: referralCode,
      url: `${DOMAIN}/signup?ref=${referralCode}`
    }
  })

  // Send email with link
  await sendEmail(user.email, 'referral-program', {
    referralUrl: `${DOMAIN}/signup?ref=${referralCode}`,
    reward: 'Free month for each referral'
  })

  return referralCode
}

// Track referrals
async function trackReferral(referralCode, newUser) {
  const referrer = await db.referralLinks.findFirst({
    where: { code: referralCode }
  })

  if (referrer) {
    // Create referral record
    await db.referrals.create({
      data: {
        referrer_id: referrer.user_id,
        referred_id: newUser.id,
        status: 'pending'
      }
    })

    // When referred user pays
    if (newUser.subscription_status === 'active') {
      // Update referral status
      await db.referrals.update({
        where: { referred_id: newUser.id },
        data: { status: 'complete' }
      })

      // Reward referrer (1 month free)
      await extendSubscription(referrer.user_id, 30)

      // Send emails
      await sendEmail(referrer.user.email, 'referral-reward', {
        referredUser: newUser.email,
        reward: '1 month free'
      })

      await sendEmail(newUser.email, 'welcome-referred', {
        referrer: referrer.user.name
      })
    }
  }
}
```

---

## Sales Dashboard Automation

**Auto-generated daily reports:**

```javascript
// Send daily sales report
async function sendDailySalesReport() {
  const today = startOfDay(new Date())

  const metrics = {
    newSignups: await db.users.count({
      where: { created_at: { gte: today } }
    }),

    newTrials: await db.users.count({
      where: {
        created_at: { gte: today },
        subscription_status: 'trial'
      }
    }),

    newPaid: await db.users.count({
      where: {
        subscription_started_at: { gte: today },
        subscription_status: 'active'
      }
    }),

    mrr: await calculateMRR(),

    churnedToday: await db.users.count({
      where: {
        canceled_at: { gte: today }
      }
    }),

    revenue: await db.payments.sum({
      where: { created_at: { gte: today } },
      _sum: { amount: true }
    })
  }

  // Send to Slack
  await slack.send({
    channel: '#metrics',
    blocks: [
      {
        type: 'header',
        text: `📊 Daily Sales Report - ${format(today, 'MMM dd, yyyy')}`
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*New Signups:* ${metrics.newSignups}` },
          { type: 'mrkdwn', text: `*New Trials:* ${metrics.newTrials}` },
          { type: 'mrkdwn', text: `*New Customers:* ${metrics.newPaid}` },
          { type: 'mrkdwn', text: `*MRR:* $${metrics.mrr.toLocaleString()}` },
          { type: 'mrkdwn', text: `*Revenue Today:* $${metrics.revenue}` },
          { type: 'mrkdwn', text: `*Churned:* ${metrics.churnedToday}` }
        ]
      }
    ]
  })

  // Send email summary
  await sendEmail('founders@company.com', 'daily-metrics', metrics)
}

// Run daily at 9am
cron.schedule('0 9 * * *', sendDailySalesReport)
```

---

## Tools & Stack

### Email Automation
- **Resend** - Developer-friendly, great API ($20-100/mo)
- **Loops** - Simple, beautiful, perfect for small teams ($0-50/mo)
- **Customer.io** - Powerful, behavior-triggered ($150-500/mo)
- **SendGrid** - Cheap, technical, reliable ($15-100/mo)

### CRM (if needed)
- **Notion** - Start here, it's free and flexible
- **Airtable** - Spreadsheet + database hybrid
- **Attio** - Modern, beautiful, founder-friendly
- **HubSpot** - Free tier is generous

### Analytics & Tracking
- **PostHog** - All-in-one, self-hostable (free-$200/mo)
- **Mixpanel** - User analytics, cohorts (free-$300/mo)
- **Amplitude** - Product analytics ($0-500/mo)

### Scheduling & Notifications
- **Node-cron** - Simple cron jobs in Node.js (free)
- **Trigger.dev** - Background jobs as code (free-$100/mo)
- **Inngest** - Durable workflows ($0-200/mo)

### Communication
- **Slack API** - Team notifications (free)
- **Discord webhooks** - Community alerts (free)
- **Telegram Bot** - Personal alerts (free)

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Set up email service (Resend/Loops)
- [ ] Create welcome email sequence
- [ ] Implement trial reminders

### Week 2: Conversion
- [ ] Add in-app upgrade prompts
- [ ] Build abandoned cart recovery
- [ ] Set up payment webhooks

### Week 3: Retention
- [ ] Create usage tracking
- [ ] Implement churn detection
- [ ] Build re-engagement campaigns

### Week 4: Scaling
- [ ] Auto-generate sales reports
- [ ] Set up lead scoring
- [ ] Build referral program

---

## Metrics to Monitor

```javascript
// Track these weekly
const metrics = {
  // Acquisition
  visitors: 10000,
  signups: 4000,          // 40% conversion
  activated: 3000,        // 75% activation

  // Conversion
  trials: 800,
  paid: 200,              // 25% trial conversion

  // Retention
  churnedThisMonth: 10,
  churnRate: 5,           // 5% monthly churn

  // Revenue
  mrr: 19800,             // $99 avg × 200 customers
  arr: 237600,            // MRR × 12

  // Automation effectiveness
  emailOpenRate: 45,      // 45%
  emailClickRate: 15,     // 15%
  automationConversion: 3 // 3% from automation
}
```

---

## Resources Included

1. **automated-email-sequences/** - Ready-to-use email templates
2. **sales-dashboard-template.sql** - Database queries for metrics
3. **webhook-handlers/** - Stripe, Paddle event handlers
4. **lead-scoring-calculator.js** - Auto-score leads
5. **churn-prediction-model.js** - Detect at-risk users
6. **revenue-forecasting.xlsx** - Predict future revenue

---

**Remember:** Automation should feel helpful, not robotic. Personalize where it matters. Automate the repetitive stuff. Always give users a way to reach a human.

Start with one automation. Perfect it. Then add the next one. You'll be amazed how much you can scale solo.
