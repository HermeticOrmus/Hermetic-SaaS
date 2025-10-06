/**
 * Re-engagement Campaign System
 *
 * Automated email campaigns to re-engage inactive users
 * and prevent churn with personalized messaging.
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Campaign {
  id: string;
  name: string;
  trigger: string;
  daysSinceLastLogin: number;
  emails: CampaignEmail[];
  enabled: boolean;
}

interface CampaignEmail {
  dayOffset: number; // Days after trigger
  subject: string;
  template: string;
  cta: string;
  ctaUrl: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  lastLogin: string;
  mrr: number;
}

/**
 * Re-engagement campaigns
 */
export const reEngagementCampaigns: Campaign[] = [
  {
    id: 'inactive-30-days',
    name: '30-Day Inactive Users',
    trigger: 'no_login_30_days',
    daysSinceLastLogin: 30,
    enabled: true,
    emails: [
      {
        dayOffset: 0,
        subject: "We miss you! Here's what you're missing",
        template: 'inactive30Day1',
        cta: 'See What\'s New',
        ctaUrl: '/dashboard',
      },
      {
        dayOffset: 7,
        subject: 'Quick question about {{productName}}',
        template: 'inactive30Day2',
        cta: 'Share Your Feedback',
        ctaUrl: '/feedback',
      },
      {
        dayOffset: 14,
        subject: 'Your account will expire soon',
        template: 'inactive30Day3',
        cta: 'Reactivate Account',
        ctaUrl: '/login',
      },
    ],
  },
  {
    id: 'inactive-60-days',
    name: '60-Day Inactive Users',
    trigger: 'no_login_60_days',
    daysSinceLastLogin: 60,
    enabled: true,
    emails: [
      {
        dayOffset: 0,
        subject: 'Is everything okay with your account?',
        template: 'inactive60Day1',
        cta: 'Let\'s Talk',
        ctaUrl: '/support',
      },
      {
        dayOffset: 7,
        subject: 'Special offer: Come back and save 50%',
        template: 'inactive60Day2',
        cta: 'Claim Your Discount',
        ctaUrl: '/claim-discount',
      },
    ],
  },
  {
    id: 'inactive-90-days',
    name: '90-Day Inactive Users',
    trigger: 'no_login_90_days',
    daysSinceLastLogin: 90,
    enabled: true,
    emails: [
      {
        dayOffset: 0,
        subject: 'Last chance: Your data will be deleted',
        template: 'inactive90Day1',
        cta: 'Save My Account',
        ctaUrl: '/login',
      },
    ],
  },
  {
    id: 'low-feature-usage',
    name: 'Low Feature Adoption',
    trigger: 'using_less_than_3_features',
    daysSinceLastLogin: 0,
    enabled: true,
    emails: [
      {
        dayOffset: 0,
        subject: 'You\'re only scratching the surface',
        template: 'lowFeatureUsage1',
        cta: 'Discover More Features',
        ctaUrl: '/features',
      },
      {
        dayOffset: 3,
        subject: '5-minute guide to {{featureName}}',
        template: 'lowFeatureUsage2',
        cta: 'Watch Tutorial',
        ctaUrl: '/tutorials',
      },
    ],
  },
  {
    id: 'failed-payment',
    name: 'Failed Payment Recovery',
    trigger: 'payment_failed',
    daysSinceLastLogin: 0,
    enabled: true,
    emails: [
      {
        dayOffset: 0,
        subject: 'Payment failed - Update your payment method',
        template: 'failedPayment1',
        cta: 'Update Payment',
        ctaUrl: '/billing',
      },
      {
        dayOffset: 3,
        subject: 'Reminder: Update your payment info',
        template: 'failedPayment2',
        cta: 'Update Payment',
        ctaUrl: '/billing',
      },
      {
        dayOffset: 7,
        subject: 'Final notice: Account will be suspended',
        template: 'failedPayment3',
        cta: 'Update Payment Now',
        ctaUrl: '/billing',
      },
    ],
  },
];

/**
 * Email templates
 */
export const emailTemplates = {
  inactive30Day1: {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey {{name}}, we miss you! 👋</h2>

        <p>It's been a while since we've seen you in {{productName}}. We've been busy adding awesome new features!</p>

        <h3>What's New:</h3>
        <ul>
          <li><strong>{{feature1}}</strong> - {{feature1Description}}</li>
          <li><strong>{{feature2}}</strong> - {{feature2Description}}</li>
          <li><strong>{{feature3}}</strong> - {{feature3Description}}</li>
        </ul>

        <p>We'd love to see what you think!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ctaUrl}}" style="background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
            See What's New
          </a>
        </div>

        <p>Need help getting started again? Just reply to this email.</p>

        <p>Best,<br>{{senderName}}</p>
      </div>
    `,
    text: `Hey {{name}}, we miss you!

It's been a while since we've seen you in {{productName}}. We've been busy adding awesome new features!

What's New:
- {{feature1}}: {{feature1Description}}
- {{feature2}}: {{feature2Description}}
- {{feature3}}: {{feature3Description}}

See what's new: {{ctaUrl}}

Need help getting started again? Just reply to this email.

Best,
{{senderName}}`,
  },

  inactive30Day2: {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Quick question, {{name}}</h2>

        <p>I noticed you haven't been using {{productName}} lately, and I wanted to reach out personally.</p>

        <p><strong>What happened?</strong></p>

        <p>Was it:</p>
        <ul>
          <li>Too complicated to use?</li>
          <li>Missing features you need?</li>
          <li>Not solving your problem?</li>
          <li>Something else entirely?</li>
        </ul>

        <p>I genuinely want to know. Your feedback helps us improve for everyone.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ctaUrl}}" style="background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Share Your Feedback
          </a>
        </div>

        <p>Or just reply to this email - I read every response.</p>

        <p>Thanks,<br>{{senderName}}</p>
      </div>
    `,
    text: `Quick question, {{name}}

I noticed you haven't been using {{productName}} lately, and I wanted to reach out personally.

What happened?
- Too complicated to use?
- Missing features you need?
- Not solving your problem?
- Something else entirely?

I genuinely want to know. Your feedback helps us improve for everyone.

Share your feedback: {{ctaUrl}}

Or just reply to this email - I read every response.

Thanks,
{{senderName}}`,
  },

  inactive60Day1: {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>{{name}}, is everything okay?</h2>

        <p>I'm reaching out because it's been 60 days since we've seen you.</p>

        <p>If something's not working for you, I want to fix it.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Here's what I can do:</strong></p>
          <ul style="margin: 10px 0 0 0;">
            <li>Set up a free 1-on-1 call to help you succeed</li>
            <li>Answer any questions you have</li>
            <li>Show you features you might have missed</li>
            <li>Discuss your specific needs</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{calendlyUrl}}" style="background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Schedule a Call
          </a>
        </div>

        <p>Or if you prefer, just reply and let me know how I can help.</p>

        <p>Best,<br>{{senderName}}</p>
      </div>
    `,
    text: `{{name}}, is everything okay?

I'm reaching out because it's been 60 days since we've seen you.

If something's not working for you, I want to fix it.

Here's what I can do:
- Set up a free 1-on-1 call to help you succeed
- Answer any questions you have
- Show you features you might have missed
- Discuss your specific needs

Schedule a call: {{calendlyUrl}}

Or if you prefer, just reply and let me know how I can help.

Best,
{{senderName}}`,
  },

  inactive60Day2: {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>{{name}}, we want you back 💜</h2>

        <p>I'll be honest - we really value you as a customer, and we want to earn your business back.</p>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0;">Special Offer: 50% Off</h3>
          <p style="margin: 10px 0 0 0;">Come back now and get 50% off for 3 months</p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">Use code: <strong>COMEBACK50</strong></p>
        </div>

        <p>This offer expires in 7 days, so don't wait!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ctaUrl}}" style="background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Claim Your Discount
          </a>
        </div>

        <p>Questions? Just reply to this email.</p>

        <p>Best,<br>{{senderName}}</p>
      </div>
    `,
    text: `{{name}}, we want you back

I'll be honest - we really value you as a customer, and we want to earn your business back.

Special Offer: 50% Off
Come back now and get 50% off for 3 months
Use code: COMEBACK50

This offer expires in 7 days!

Claim your discount: {{ctaUrl}}

Questions? Just reply to this email.

Best,
{{senderName}}`,
  },

  lowFeatureUsage1: {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>{{name}}, you're missing out!</h2>

        <p>I noticed you're only using a few features of {{productName}}.</p>

        <p>You're paying for a Ferrari but driving it like a Honda (no offense to Hondas!).</p>

        <h3>Features you haven't tried yet:</h3>
        <ul>
          <li><strong>{{feature1}}</strong> - Save 2 hours per week</li>
          <li><strong>{{feature2}}</strong> - Increase productivity by 30%</li>
          <li><strong>{{feature3}}</strong> - Automate repetitive tasks</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ctaUrl}}" style="background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Discover More Features
          </a>
        </div>

        <p>Want a personal walkthrough? Book a 15-minute call with me!</p>

        <p>Best,<br>{{senderName}}</p>
      </div>
    `,
    text: `{{name}}, you're missing out!

I noticed you're only using a few features of {{productName}}.

You're paying for a Ferrari but driving it like a Honda!

Features you haven't tried yet:
- {{feature1}}: Save 2 hours per week
- {{feature2}}: Increase productivity by 30%
- {{feature3}}: Automate repetitive tasks

Discover more: {{ctaUrl}}

Want a personal walkthrough? Book a 15-minute call with me!

Best,
{{senderName}}`,
  },

  failedPayment1: {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment failed - Action required</h2>

        <p>Hi {{name}},</p>

        <p>We tried to process your payment but it didn't go through.</p>

        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Account:</strong> {{email}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${{amount}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Status:</strong> Payment Failed</p>
        </div>

        <p><strong>Common reasons:</strong></p>
        <ul>
          <li>Card expired</li>
          <li>Insufficient funds</li>
          <li>Card blocked by bank</li>
        </ul>

        <p>Please update your payment method to avoid service interruption.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ctaUrl}}" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </div>

        <p>Questions? Contact support@{{domain}}</p>

        <p>Thanks,<br>The {{productName}} Team</p>
      </div>
    `,
    text: `Payment failed - Action required

Hi {{name}},

We tried to process your payment but it didn't go through.

Account: {{email}}
Amount: ${{amount}}
Status: Payment Failed

Common reasons:
- Card expired
- Insufficient funds
- Card blocked by bank

Please update your payment method to avoid service interruption.

Update payment: {{ctaUrl}}

Questions? Contact support@{{domain}}

Thanks,
The {{productName}} Team`,
  },
};

/**
 * Run re-engagement campaigns
 */
export async function runReEngagementCampaigns() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  for (const campaign of reEngagementCampaigns) {
    if (!campaign.enabled) continue;

    // Find users who match trigger criteria
    const users = await findUsersForCampaign(campaign);

    for (const user of users) {
      // Check which email to send based on days since trigger
      const emailToSend = getNextEmail(campaign, user);

      if (emailToSend) {
        await sendCampaignEmail(user, campaign, emailToSend);

        // Log campaign activity
        await logCampaignActivity(user.id, campaign.id, emailToSend);
      }
    }
  }
}

/**
 * Find users matching campaign criteria
 */
async function findUsersForCampaign(campaign: Campaign): Promise<User[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Implementation depends on trigger type
  // This is a simplified example
  const daysCutoff = new Date();
  daysCutoff.setDate(daysCutoff.getDate() - campaign.daysSinceLastLogin);

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .lt('last_login', daysCutoff.toISOString())
    .eq('email_verified', true);

  return users || [];
}

/**
 * Determine which email to send
 */
function getNextEmail(campaign: Campaign, user: User): CampaignEmail | null {
  // Check campaign history to see which emails have been sent
  // Return the next email in the sequence
  // This is simplified - implement proper state tracking
  return campaign.emails[0];
}

/**
 * Send campaign email
 */
async function sendCampaignEmail(
  user: User,
  campaign: Campaign,
  email: CampaignEmail
) {
  const template = emailTemplates[email.template as keyof typeof emailTemplates];

  // Replace variables
  let html = template.html;
  let text = template.text;
  let subject = email.subject;

  const variables = {
    name: user.name,
    email: user.email,
    productName: 'Your SaaS',
    senderName: 'Sarah from Your SaaS',
    ctaUrl: `https://yoursaas.com${email.ctaUrl}`,
    domain: 'yoursaas.com',
  };

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
    text = text.replace(regex, value);
    subject = subject.replace(regex, value);
  });

  // Send email
  await resend.emails.send({
    from: 'sarah@yoursaas.com',
    to: user.email,
    subject,
    html,
    text,
  });
}

/**
 * Log campaign activity
 */
async function logCampaignActivity(
  userId: string,
  campaignId: string,
  email: CampaignEmail
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from('campaign_activity').insert({
    user_id: userId,
    campaign_id: campaignId,
    email_subject: email.subject,
    sent_at: new Date().toISOString(),
  });
}
