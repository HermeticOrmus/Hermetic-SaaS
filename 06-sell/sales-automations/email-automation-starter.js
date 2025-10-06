/**
 * Email Automation Starter Kit
 *
 * Complete sales automation system for SaaS.
 * Handles welcome sequences, trial conversions, and churn prevention.
 *
 * Dependencies:
 * - Resend (email): npm install resend
 * - Node-cron (scheduling): npm install node-cron
 * - Prisma (database): npm install @prisma/client
 */

import { Resend } from 'resend'
import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)
const prisma = new PrismaClient()

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const emailTemplates = {
  // Welcome sequence
  welcome: {
    subject: 'Welcome to [Product]! Get started in 2 minutes',
    html: ({ name, productName }) => `
      <h1>Welcome to ${productName}, ${name}!</h1>
      <p>We're excited to have you. Here's how to get started:</p>
      <ol>
        <li><strong>Create your first project</strong> - Takes 30 seconds</li>
        <li><strong>Invite your team</strong> - Collaboration makes it better</li>
        <li><strong>Explore features</strong> - See what's possible</li>
      </ol>
      <a href="https://app.yourproduct.com/onboarding" style="background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Get Started Now
      </a>
      <p>Questions? Just reply to this email.</p>
      <p>Best,<br>Your Name<br>Founder, ${productName}</p>
    `
  },

  // Day 2: First value reminder
  gettingStartedReminder: {
    subject: 'Quick question - did you create your first project?',
    html: ({ name }) => `
      <p>Hi ${name},</p>
      <p>I noticed you haven't created your first project yet. No worries - sometimes getting started is the hardest part.</p>
      <p>Here's the fastest way:</p>
      <p>
        1. Click "New Project"<br>
        2. Give it a name<br>
        3. That's it - you're done!
      </p>
      <a href="https://app.yourproduct.com/projects/new" style="background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Create Your First Project
      </a>
      <p>It takes about 30 seconds and you'll immediately see the value.</p>
      <p>Stuck on something? Just reply and I'll help.</p>
      <p>Best,<br>Your Name</p>
    `
  },

  // Trial reminder: 3 days left
  trial3DaysLeft: {
    subject: '3 days left in your trial',
    html: ({ name, daysLeft, projectCount, upgradeUrl }) => `
      <p>Hi ${name},</p>
      <p>Quick heads up - you have ${daysLeft} days left in your free trial.</p>
      ${projectCount > 0 ? `
        <p>You've already created ${projectCount} project${projectCount > 1 ? 's' : ''}. Nice work! 🎉</p>
        <p>To keep access to your work, you'll need to choose a plan.</p>
      ` : `
        <p>You haven't had a chance to explore much yet. Want a few more days? Just reply and I'll extend your trial.</p>
      `}
      <h3>Our Pricing</h3>
      <ul>
        <li><strong>Pro:</strong> $99/month - For growing teams</li>
        <li><strong>Enterprise:</strong> Custom - For larger organizations</li>
      </ul>
      <a href="${upgradeUrl}" style="background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        View Plans & Pricing
      </a>
      <p>Questions about pricing? Reply and let's chat.</p>
      <p>Best,<br>Your Name</p>
    `
  },

  // Trial reminder: Tomorrow
  trial1DayLeft: {
    subject: 'Last day: Keep your [Product] account',
    html: ({ name, upgradeUrl }) => `
      <p>Hi ${name},</p>
      <p>This is your last day of the free trial.</p>
      <p>To keep your account and all your work, upgrade to Pro:</p>
      <a href="${upgradeUrl}" style="background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Upgrade to Pro - $99/month
      </a>
      <p><strong>What happens if you don't upgrade:</strong></p>
      <ul>
        <li>Your account moves to free tier (limited features)</li>
        <li>Your data is safe for 30 days</li>
        <li>You can always upgrade later</li>
      </ul>
      <p>Need more time to decide? Reply and I'll extend your trial.</p>
      <p>Best,<br>Your Name</p>
    `
  },

  // Trial expired
  trialExpired: {
    subject: 'Your trial has ended - here\'s what\'s next',
    html: ({ name, upgradeUrl }) => `
      <p>Hi ${name},</p>
      <p>Your 14-day trial has ended. Your account is now on our free plan.</p>
      <p><strong>What this means:</strong></p>
      <ul>
        <li>You can still access basic features</li>
        <li>Your data is safe and exportable</li>
        <li>You can upgrade anytime</li>
      </ul>
      <p>Want to upgrade and get full access back?</p>
      <a href="${upgradeUrl}" style="background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Upgrade Now
      </a>
      <p>Or, if you decided [Product] isn't for you, I'd love to know why. What could we do better?</p>
      <p><a href="https://yourproduct.com/feedback">Share your feedback</a> (takes 1 minute)</p>
      <p>Thanks for trying [Product].</p>
      <p>Best,<br>Your Name</p>
    `
  },

  // Payment failed
  paymentFailed: {
    subject: 'Payment failed - please update your card',
    html: ({ name, amount, updateUrl }) => `
      <p>Hi ${name},</p>
      <p>We tried to charge your card $${amount} but the payment failed.</p>
      <p>This usually happens when:</p>
      <ul>
        <li>Card expired</li>
        <li>Insufficient funds</li>
        <li>Card was replaced by your bank</li>
      </ul>
      <p><strong>Please update your payment method to keep your account active:</strong></p>
      <a href="${updateUrl}" style="background: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Update Payment Method
      </a>
      <p>We'll automatically retry in 3 days. Your account remains active until then.</p>
      <p>Need help? Just reply.</p>
      <p>Best,<br>Your Name</p>
    `
  },

  // Churn prevention (inactive user)
  inactiveUser: {
    subject: 'We miss you! Need any help?',
    html: ({ name, lastActiveDate }) => `
      <p>Hi ${name},</p>
      <p>I noticed you haven't logged in since ${lastActiveDate}. Everything okay?</p>
      <p>Common reasons people stop using [Product]:</p>
      <ul>
        <li>Got stuck on something</li>
        <li>Feature they needed wasn't available</li>
        <li>Didn't have time to set it up</li>
      </ul>
      <p><strong>I'm here to help.</strong> Just reply and tell me what's going on.</p>
      <p>Or if you want to cancel, that's okay too - just let me know why so we can improve.</p>
      <p>Best,<br>Your Name</p>
    `
  },

  // Feature adoption
  featureHighlight: {
    subject: 'You\'re missing out on [Feature]',
    html: ({ name, featureName, featureDescription }) => `
      <p>Hi ${name},</p>
      <p>I noticed you haven't tried <strong>${featureName}</strong> yet.</p>
      <p>This is one of our most powerful features:</p>
      <p>${featureDescription}</p>
      <p><strong>Here's how it works:</strong></p>
      <ol>
        <li>Go to [Location]</li>
        <li>Click [Button]</li>
        <li>Done!</li>
      </ol>
      <a href="https://app.yourproduct.com/${featureName.toLowerCase()}" style="background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Try ${featureName} Now
      </a>
      <p>Most teams are surprised by how much time this saves.</p>
      <p>Best,<br>Your Name</p>
    `
  }
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

async function sendEmail(to, templateKey, data) {
  const template = emailTemplates[templateKey]
  if (!template) {
    throw new Error(`Template ${templateKey} not found`)
  }

  try {
    const result = await resend.emails.send({
      from: 'Your Name <you@yourproduct.com>',
      to: [to],
      subject: template.subject,
      html: template.html(data)
    })

    // Log email sent
    await prisma.emailLog.create({
      data: {
        userId: data.userId,
        template: templateKey,
        sentAt: new Date(),
        resendId: result.id
      }
    })

    console.log(`Email sent: ${templateKey} to ${to}`)
    return result
  } catch (error) {
    console.error(`Failed to send email: ${templateKey} to ${to}`, error)
    throw error
  }
}

// ============================================================================
// AUTOMATION JOBS
// ============================================================================

// Job 1: Send welcome email immediately after signup
export async function sendWelcomeEmail(user) {
  await sendEmail(user.email, 'welcome', {
    userId: user.id,
    name: user.name,
    productName: 'YourProduct'
  })
}

// Job 2: Daily check for users who need reminders
async function sendDailyReminders() {
  const now = new Date()

  // 1. Users who signed up 2 days ago but haven't created a project
  const inactiveNewUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago
      },
      projectCount: 0,
      emailLog: {
        none: {
          template: 'gettingStartedReminder'
        }
      }
    }
  })

  for (const user of inactiveNewUsers) {
    await sendEmail(user.email, 'gettingStartedReminder', {
      userId: user.id,
      name: user.name
    })
  }

  // 2. Trial users with 3 days left
  const threeDayTrials = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'trial',
      trialEndsAt: {
        gte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),   // 2 days from now
        lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)    // 3 days from now
      },
      emailLog: {
        none: {
          template: 'trial3DaysLeft'
        }
      }
    }
  })

  for (const user of threeDayTrials) {
    await sendEmail(user.email, 'trial3DaysLeft', {
      userId: user.id,
      name: user.name,
      daysLeft: 3,
      projectCount: user.projectCount,
      upgradeUrl: `https://app.yourproduct.com/upgrade?user=${user.id}`
    })
  }

  // 3. Trial users with 1 day left
  const oneDayTrials = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'trial',
      trialEndsAt: {
        gte: now,
        lte: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
      },
      emailLog: {
        none: {
          template: 'trial1DayLeft'
        }
      }
    }
  })

  for (const user of oneDayTrials) {
    await sendEmail(user.email, 'trial1DayLeft', {
      userId: user.id,
      name: user.name,
      upgradeUrl: `https://app.yourproduct.com/upgrade?user=${user.id}`
    })
  }

  // 4. Trials that just expired
  const expiredTrials = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'trial',
      trialEndsAt: {
        lte: now
      }
    }
  })

  for (const user of expiredTrials) {
    // Update subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'expired' }
    })

    // Send email
    await sendEmail(user.email, 'trialExpired', {
      userId: user.id,
      name: user.name,
      upgradeUrl: `https://app.yourproduct.com/upgrade?user=${user.id}`
    })
  }

  // 5. Inactive users (haven't logged in for 14 days)
  const inactiveUsers = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'active',
      lastLoginAt: {
        lte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      },
      emailLog: {
        none: {
          template: 'inactiveUser',
          sentAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Not sent in last 7 days
          }
        }
      }
    }
  })

  for (const user of inactiveUsers) {
    await sendEmail(user.email, 'inactiveUser', {
      userId: user.id,
      name: user.name,
      lastActiveDate: user.lastLoginAt.toLocaleDateString()
    })
  }

  console.log(`Daily reminders sent: ${now.toISOString()}`)
}

// Job 3: Check for failed payments (triggered by webhook in real app)
async function handleFailedPayment(userId, amount) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return

  await sendEmail(user.email, 'paymentFailed', {
    userId: user.id,
    name: user.name,
    amount: amount / 100, // Convert cents to dollars
    updateUrl: `https://app.yourproduct.com/billing?user=${user.id}`
  })
}

// ============================================================================
// SCHEDULED JOBS (CRON)
// ============================================================================

// Run daily at 9am
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily automation jobs...')
  await sendDailyReminders()
})

// Run hourly for time-sensitive automations
cron.schedule('0 * * * *', async () => {
  // Check for any urgent automations
  // e.g., trial expiring in next hour, payment retry, etc.
})

// ============================================================================
// ANALYTICS & TRACKING
// ============================================================================

async function trackEmailPerformance() {
  // Email open rates by template
  const stats = await prisma.emailLog.groupBy({
    by: ['template'],
    _count: {
      template: true
    },
    _sum: {
      opened: true,
      clicked: true
    }
  })

  console.log('Email Performance:')
  stats.forEach(stat => {
    const openRate = ((stat._sum.opened / stat._count.template) * 100).toFixed(1)
    const clickRate = ((stat._sum.clicked / stat._count.template) * 100).toFixed(1)
    console.log(`${stat.template}: ${openRate}% open, ${clickRate}% click`)
  })
}

// ============================================================================
// MANUAL TRIGGERS (FOR TESTING)
// ============================================================================

// Test welcome email
export async function testWelcomeEmail() {
  await sendEmail('test@example.com', 'welcome', {
    userId: 'test-user-id',
    name: 'Test User',
    productName: 'YourProduct'
  })
}

// Test trial reminder
export async function testTrialReminder() {
  await sendEmail('test@example.com', 'trial3DaysLeft', {
    userId: 'test-user-id',
    name: 'Test User',
    daysLeft: 3,
    projectCount: 5,
    upgradeUrl: 'https://app.yourproduct.com/upgrade'
  })
}

// ============================================================================
// API ENDPOINTS (Express.js example)
// ============================================================================

/*
import express from 'express'
const app = express()

// Webhook: User signed up
app.post('/webhooks/user-signup', async (req, res) => {
  const { user } = req.body

  // Send welcome email immediately
  await sendWelcomeEmail(user)

  res.json({ success: true })
})

// Webhook: Payment failed (from Stripe)
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    await handleFailedPayment(invoice.customer, invoice.amount_due)
  }

  res.json({ received: true })
})

// Manual: Trigger specific email
app.post('/admin/send-email', async (req, res) => {
  const { userId, template } = req.body

  const user = await prisma.user.findUnique({ where: { id: userId } })

  await sendEmail(user.email, template, {
    userId: user.id,
    name: user.name
  })

  res.json({ success: true })
})
*/

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

1. SETUP:

npm install resend node-cron @prisma/client

2. ENVIRONMENT VARIABLES (.env):

RESEND_API_KEY=re_xxxxxxxxxxxxx
DATABASE_URL=postgresql://...

3. DATABASE SCHEMA (Prisma):

model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  name               String
  subscriptionStatus String   // 'trial', 'active', 'expired', 'canceled'
  trialEndsAt        DateTime?
  lastLoginAt        DateTime
  projectCount       Int      @default(0)
  createdAt          DateTime @default(now())
  emailLog           EmailLog[]
}

model EmailLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  template  String
  sentAt    DateTime @default(now())
  opened    Boolean  @default(false)
  clicked   Boolean  @default(false)
  resendId  String?
}

4. START AUTOMATION:

node sales-automation-starter.js

// Cron jobs run automatically
// Or trigger manually:
await sendWelcomeEmail(user)
await sendDailyReminders()

*/

// ============================================================================
// EXPORTS
// ============================================================================

export {
  sendEmail,
  sendWelcomeEmail,
  sendDailyReminders,
  handleFailedPayment,
  trackEmailPerformance,
  testWelcomeEmail,
  testTrialReminder
}

console.log('Sales automation system initialized')
console.log('Cron jobs scheduled:')
console.log('- Daily reminders: 9am every day')
console.log('- Hourly checks: Every hour')
