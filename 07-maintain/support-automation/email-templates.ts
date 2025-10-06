/**
 * Email Support Templates
 *
 * Pre-written templates for common support scenarios,
 * auto-responders, and ticket management.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Auto-responder for new support requests
 */
export const autoResponder: EmailTemplate = {
  subject: 'We received your support request',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thanks for reaching out!</h2>

      <p>We've received your support request and our team is on it.</p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Ticket ID:</strong> {{ticketId}}</p>
        <p style="margin: 10px 0 0 0;"><strong>Priority:</strong> {{priority}}</p>
      </div>

      <h3>What happens next?</h3>
      <ol>
        <li>We'll review your request within {{responseTime}}</li>
        <li>A support specialist will respond with next steps</li>
        <li>You'll receive updates via email</li>
      </ol>

      <h3>Need faster help?</h3>
      <p>While you wait, check out these resources:</p>
      <ul>
        <li><a href="https://help.yoursaas.com">Help Center</a> - Search our knowledge base</li>
        <li><a href="https://community.yoursaas.com">Community Forum</a> - Ask other users</li>
        <li><a href="https://status.yoursaas.com">Status Page</a> - Check for known issues</li>
      </ul>

      <p>Reply to this email to add more information to your ticket.</p>

      <p>Best,<br>The {{companyName}} Support Team</p>
    </div>
  `,
  text: `Thanks for reaching out!

We've received your support request and our team is on it.

Ticket ID: {{ticketId}}
Priority: {{priority}}

What happens next?
1. We'll review your request within {{responseTime}}
2. A support specialist will respond with next steps
3. You'll receive updates via email

Need faster help?
- Help Center: https://help.yoursaas.com
- Community Forum: https://community.yoursaas.com
- Status Page: https://status.yoursaas.com

Reply to this email to add more information to your ticket.

Best,
The {{companyName}} Support Team`,
};

/**
 * Common issue templates
 */
export const commonIssues = {
  loginProblem: {
    subject: 'Re: Login Issue - Solution',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{name}},</h2>

        <p>I understand you're having trouble logging in. Let's get you back into your account!</p>

        <h3>Quick Fix:</h3>
        <ol>
          <li>Try resetting your password: <a href="{{resetLink}}">Reset Password</a></li>
          <li>Clear your browser cache and cookies</li>
          <li>Try a different browser or incognito mode</li>
        </ol>

        <h3>Still stuck?</h3>
        <p>If the above doesn't work, it might be:</p>
        <ul>
          <li><strong>Email typo:</strong> Double-check your email address</li>
          <li><strong>Account locked:</strong> Too many failed attempts (unlocks in 15 minutes)</li>
          <li><strong>Browser issue:</strong> Try Chrome for best results</li>
        </ul>

        <p>I can manually unlock your account if needed. Just reply to this email.</p>

        <p>Best,<br>{{supportAgent}}</p>
      </div>
    `,
    text: `Hi {{name}},

I understand you're having trouble logging in. Let's get you back into your account!

Quick Fix:
1. Try resetting your password: {{resetLink}}
2. Clear your browser cache and cookies
3. Try a different browser or incognito mode

Still stuck?
- Email typo: Double-check your email address
- Account locked: Too many failed attempts (unlocks in 15 minutes)
- Browser issue: Try Chrome for best results

I can manually unlock your account if needed. Just reply to this email.

Best,
{{supportAgent}}`,
  },

  billingQuestion: {
    subject: 'Re: Billing Question',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{name}},</h2>

        <p>Thanks for reaching out about your billing!</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Current Plan:</strong> {{plan}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Next Billing Date:</strong> {{billingDate}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> {{amount}}</p>
        </div>

        <h3>Common Billing Questions:</h3>

        <p><strong>How to update payment method:</strong></p>
        <ol>
          <li>Go to Settings > Billing</li>
          <li>Click "Payment Method"</li>
          <li>Add new card and set as default</li>
        </ol>

        <p><strong>How to download invoices:</strong></p>
        <ol>
          <li>Settings > Billing > Invoice History</li>
          <li>Click download next to each invoice</li>
        </ol>

        <p><strong>How to cancel subscription:</strong></p>
        <ol>
          <li>Settings > Billing > Cancel Subscription</li>
          <li>You'll have access until {{billingDate}}</li>
        </ol>

        <p>Need something else? Just reply to this email!</p>

        <p>Best,<br>{{supportAgent}}</p>
      </div>
    `,
    text: `Hi {{name}},

Thanks for reaching out about your billing!

Current Plan: {{plan}}
Next Billing Date: {{billingDate}}
Amount: {{amount}}

Common Billing Questions:

How to update payment method:
1. Go to Settings > Billing
2. Click "Payment Method"
3. Add new card and set as default

How to download invoices:
1. Settings > Billing > Invoice History
2. Click download next to each invoice

How to cancel subscription:
1. Settings > Billing > Cancel Subscription
2. You'll have access until {{billingDate}}

Need something else? Just reply to this email!

Best,
{{supportAgent}}`,
  },

  featureRequest: {
    subject: 'Re: Feature Request - We\'re listening!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{name}},</h2>

        <p>Thanks for the feature request! We love hearing from users like you.</p>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your Request:</strong></p>
          <p style="margin: 10px 0 0 0;">{{featureDescription}}</p>
        </div>

        <h3>What happens now?</h3>
        <ol>
          <li>I've added your request to our product roadmap</li>
          <li>Our product team will review and prioritize it</li>
          <li>You'll get notified if/when we build it</li>
        </ol>

        <h3>In the meantime...</h3>
        <p>Did you know you might be able to achieve this with:</p>
        <ul>
          <li>{{workaround1}}</li>
          <li>{{workaround2}}</li>
        </ul>

        <p>Want to chat more about your use case? I'd love to schedule a quick call!</p>

        <p>Best,<br>{{supportAgent}}</p>
      </div>
    `,
    text: `Hi {{name}},

Thanks for the feature request! We love hearing from users like you.

Your Request:
{{featureDescription}}

What happens now?
1. I've added your request to our product roadmap
2. Our product team will review and prioritize it
3. You'll get notified if/when we build it

In the meantime...
- {{workaround1}}
- {{workaround2}}

Want to chat more about your use case? I'd love to schedule a quick call!

Best,
{{supportAgent}}`,
  },

  bugReport: {
    subject: 'Re: Bug Report - We\'re investigating',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{name}},</h2>

        <p>Thanks for reporting this bug! Quality is our top priority.</p>

        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Bug ID:</strong> {{bugId}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Status:</strong> Under Investigation</p>
          <p style="margin: 10px 0 0 0;"><strong>Priority:</strong> {{priority}}</p>
        </div>

        <h3>What we're doing:</h3>
        <ol>
          <li>Our engineering team is investigating</li>
          <li>We'll identify the root cause</li>
          <li>We'll deploy a fix ASAP</li>
          <li>You'll be notified when it's resolved</li>
        </ol>

        <h3>Temporary workaround:</h3>
        <p>{{workaround}}</p>

        <p>I'll keep you updated on the progress. Thanks for helping us improve!</p>

        <p>Best,<br>{{supportAgent}}</p>
      </div>
    `,
    text: `Hi {{name}},

Thanks for reporting this bug! Quality is our top priority.

Bug ID: {{bugId}}
Status: Under Investigation
Priority: {{priority}}

What we're doing:
1. Our engineering team is investigating
2. We'll identify the root cause
3. We'll deploy a fix ASAP
4. You'll be notified when it's resolved

Temporary workaround:
{{workaround}}

I'll keep you updated on the progress. Thanks for helping us improve!

Best,
{{supportAgent}}`,
  },

  accountCancellation: {
    subject: 'Sorry to see you go - Let\'s help',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{name}},</h2>

        <p>I saw you're thinking about canceling. I'd love to help before you go!</p>

        <h3>Quick question:</h3>
        <p>What's the main reason you're leaving?</p>
        <ul>
          <li>Too expensive?</li>
          <li>Missing features?</li>
          <li>Too complex?</li>
          <li>Not using it enough?</li>
          <li>Found an alternative?</li>
        </ul>

        <h3>We might be able to help:</h3>
        <ul>
          <li><strong>Struggling with setup?</strong> I can schedule a free onboarding call</li>
          <li><strong>Price concerns?</strong> I can discuss options (downgrade, pause, discount)</li>
          <li><strong>Missing features?</strong> Let me show you what you might have missed</li>
        </ul>

        <p>I'm here to help make this work for you. Can we chat for 10 minutes?</p>

        <p><a href="{{calendlyLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Schedule a Call</a></p>

        <p>If you still want to cancel, I understand. You can do that here: <a href="{{cancelLink}}">Cancel Subscription</a></p>

        <p>Best,<br>{{supportAgent}}</p>
      </div>
    `,
    text: `Hi {{name}},

I saw you're thinking about canceling. I'd love to help before you go!

Quick question:
What's the main reason you're leaving?
- Too expensive?
- Missing features?
- Too complex?
- Not using it enough?
- Found an alternative?

We might be able to help:
- Struggling with setup? I can schedule a free onboarding call
- Price concerns? I can discuss options (downgrade, pause, discount)
- Missing features? Let me show you what you might have missed

I'm here to help make this work for you. Can we chat for 10 minutes?

Schedule a call: {{calendlyLink}}

If you still want to cancel: {{cancelLink}}

Best,
{{supportAgent}}`,
  },
};

/**
 * Ticket resolution templates
 */
export const resolutionTemplates = {
  resolved: {
    subject: 'Ticket Resolved: {{subject}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Great news, {{name}}!</h2>

        <p>Your support ticket has been resolved.</p>

        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Ticket ID:</strong> {{ticketId}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Resolution:</strong></p>
          <p style="margin: 10px 0 0 0;">{{resolution}}</p>
        </div>

        <h3>Was this helpful?</h3>
        <p>Please rate your support experience:</p>
        <div style="margin: 20px 0;">
          <a href="{{feedbackLink}}?rating=5" style="text-decoration: none; font-size: 24px; margin: 0 5px;">⭐⭐⭐⭐⭐</a>
          <a href="{{feedbackLink}}?rating=4" style="text-decoration: none; font-size: 24px; margin: 0 5px;">⭐⭐⭐⭐</a>
          <a href="{{feedbackLink}}?rating=3" style="text-decoration: none; font-size: 24px; margin: 0 5px;">⭐⭐⭐</a>
        </div>

        <p>Need more help? Just reply to this email to reopen the ticket.</p>

        <p>Best,<br>{{supportAgent}}</p>
      </div>
    `,
    text: `Great news, {{name}}!

Your support ticket has been resolved.

Ticket ID: {{ticketId}}
Resolution:
{{resolution}}

Was this helpful?
Rate your experience: {{feedbackLink}}

Need more help? Just reply to this email to reopen the ticket.

Best,
{{supportAgent}}`,
  },

  followUp: {
    subject: 'Checking in: {{subject}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{name}},</h2>

        <p>I wanted to check in on your ticket from {{daysAgo}} days ago.</p>

        <p><strong>Issue:</strong> {{issue}}</p>
        <p><strong>Last Update:</strong> {{lastUpdate}}</p>

        <h3>Quick questions:</h3>
        <ul>
          <li>Is your issue resolved?</li>
          <li>Do you need additional help?</li>
          <li>Can we close this ticket?</li>
        </ul>

        <p>Reply to this email with an update, or I'll assume it's resolved and close the ticket in 3 days.</p>

        <p>Best,<br>{{supportAgent}}</p>
      </div>
    `,
    text: `Hi {{name}},

I wanted to check in on your ticket from {{daysAgo}} days ago.

Issue: {{issue}}
Last Update: {{lastUpdate}}

Quick questions:
- Is your issue resolved?
- Do you need additional help?
- Can we close this ticket?

Reply to this email with an update, or I'll assume it's resolved and close the ticket in 3 days.

Best,
{{supportAgent}}`,
  },
};

/**
 * Send templated email
 */
export async function sendTemplateEmail(
  to: string,
  template: EmailTemplate,
  variables: Record<string, string>
) {
  // Replace variables in template
  let html = template.html;
  let text = template.text;
  let subject = template.subject;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
    text = text.replace(regex, value);
    subject = subject.replace(regex, value);
  });

  // Send email
  return await resend.emails.send({
    from: 'support@yoursaas.com',
    to,
    subject,
    html,
    text,
  });
}

/**
 * Auto-reply to new ticket
 */
export async function sendAutoReply(
  email: string,
  ticketId: string,
  priority: string,
  plan: string
) {
  const responseTime = getResponseTime(plan);

  await sendTemplateEmail(email, autoResponder, {
    ticketId,
    priority,
    responseTime,
    companyName: 'Your SaaS',
  });
}

/**
 * Get expected response time based on plan
 */
function getResponseTime(plan: string): string {
  switch (plan.toLowerCase()) {
    case 'enterprise':
      return '4 hours';
    case 'pro':
      return '12 hours';
    case 'starter':
      return '24 hours';
    default:
      return '48 hours';
  }
}
