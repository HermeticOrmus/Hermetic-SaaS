/**
 * Churn Prediction Model
 *
 * Identify at-risk customers before they cancel using
 * behavioral signals and machine learning.
 */

import { createClient } from '@supabase/supabase-js';

interface ChurnSignal {
  name: string;
  weight: number;
  threshold: number;
  value: number;
  triggered: boolean;
}

interface ChurnPrediction {
  userId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  signals: ChurnSignal[];
  recommendations: string[];
  lastUpdated: string;
}

interface UserBehavior {
  userId: string;
  daysSinceLastLogin: number;
  loginFrequency: number; // logins per week
  featureUsage: number; // features used in last 30 days
  avgSessionDuration: number; // minutes
  supportTickets: number;
  failedPayments: number;
  downgrades: number;
  cancelAttempts: number;
  npsScore: number | null;
  accountAge: number; // days
  mrr: number;
}

/**
 * Churn prediction signals and weights
 */
const CHURN_SIGNALS = [
  {
    name: 'Inactive User',
    description: 'No login in 14+ days',
    weight: 25,
    check: (behavior: UserBehavior) => behavior.daysSinceLastLogin > 14,
  },
  {
    name: 'Declining Usage',
    description: 'Login frequency dropped 50%+',
    weight: 20,
    check: (behavior: UserBehavior) => behavior.loginFrequency < 1, // less than weekly
  },
  {
    name: 'Low Feature Adoption',
    description: 'Using less than 3 features',
    weight: 15,
    check: (behavior: UserBehavior) => behavior.featureUsage < 3,
  },
  {
    name: 'Short Sessions',
    description: 'Average session under 5 minutes',
    weight: 10,
    check: (behavior: UserBehavior) => behavior.avgSessionDuration < 5,
  },
  {
    name: 'Multiple Support Tickets',
    description: '3+ tickets in last 30 days',
    weight: 15,
    check: (behavior: UserBehavior) => behavior.supportTickets >= 3,
  },
  {
    name: 'Payment Issues',
    description: 'Failed payment attempts',
    weight: 30,
    check: (behavior: UserBehavior) => behavior.failedPayments > 0,
  },
  {
    name: 'Downgrade Activity',
    description: 'Downgraded plan recently',
    weight: 20,
    check: (behavior: UserBehavior) => behavior.downgrades > 0,
  },
  {
    name: 'Cancel Attempts',
    description: 'Visited cancel page',
    weight: 35,
    check: (behavior: UserBehavior) => behavior.cancelAttempts > 0,
  },
  {
    name: 'Low NPS Score',
    description: 'NPS score below 6',
    weight: 15,
    check: (behavior: UserBehavior) => (behavior.npsScore || 10) < 6,
  },
  {
    name: 'New User',
    description: 'Account less than 30 days old',
    weight: 10,
    check: (behavior: UserBehavior) => behavior.accountAge < 30,
  },
];

/**
 * Calculate churn risk score
 */
export async function calculateChurnRisk(userId: string): Promise<ChurnPrediction> {
  // Get user behavior data
  const behavior = await getUserBehavior(userId);

  // Evaluate each signal
  const signals: ChurnSignal[] = CHURN_SIGNALS.map(signal => ({
    name: signal.name,
    weight: signal.weight,
    threshold: 0,
    value: signal.check(behavior) ? signal.weight : 0,
    triggered: signal.check(behavior),
  }));

  // Calculate total risk score (0-100)
  const triggeredSignals = signals.filter(s => s.triggered);
  const maxPossibleScore = CHURN_SIGNALS.reduce((sum, s) => sum + s.weight, 0);
  const actualScore = triggeredSignals.reduce((sum, s) => sum + s.weight, 0);
  const riskScore = Math.min(100, (actualScore / maxPossibleScore) * 100);

  // Determine risk level
  let riskLevel: ChurnPrediction['riskLevel'];
  if (riskScore >= 70) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';
  else riskLevel = 'low';

  // Generate recommendations
  const recommendations = generateRecommendations(triggeredSignals, behavior);

  return {
    userId,
    riskScore: Math.round(riskScore),
    riskLevel,
    signals: triggeredSignals,
    recommendations,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get user behavior data
 */
async function getUserBehavior(userId: string): Promise<UserBehavior> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Get login data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: logins } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_name', 'login')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get feature usage
  const { data: features } = await supabase
    .from('analytics_events')
    .select('event_name')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .neq('event_name', 'login');

  const uniqueFeatures = new Set(features?.map(f => f.event_name) || []);

  // Get support tickets
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get subscription data
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get payment failures
  const { data: payments } = await supabase
    .from('payment_events')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'failed')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get cancel attempts (page views)
  const { data: cancelViews } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_name', 'viewed_cancel_page')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Calculate metrics
  const lastLogin = user?.last_login ? new Date(user.last_login) : new Date(0);
  const daysSinceLastLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
  const loginFrequency = (logins?.length || 0) / 4; // per week
  const accountAge = Math.floor((Date.now() - new Date(user?.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return {
    userId,
    daysSinceLastLogin,
    loginFrequency,
    featureUsage: uniqueFeatures.size,
    avgSessionDuration: 10, // TODO: Calculate from session data
    supportTickets: tickets?.length || 0,
    failedPayments: payments?.length || 0,
    downgrades: 0, // TODO: Track plan changes
    cancelAttempts: cancelViews?.length || 0,
    npsScore: null, // TODO: Get from surveys
    accountAge,
    mrr: subscription?.amount || 0,
  };
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  signals: ChurnSignal[],
  behavior: UserBehavior
): string[] {
  const recommendations: string[] = [];

  // Inactive user
  if (signals.some(s => s.name === 'Inactive User')) {
    recommendations.push('Send re-engagement email with value reminder');
    recommendations.push('Offer personalized onboarding call');
    recommendations.push('Share new features they might have missed');
  }

  // Declining usage
  if (signals.some(s => s.name === 'Declining Usage')) {
    recommendations.push('Send tips for getting more value');
    recommendations.push('Highlight underused features');
    recommendations.push('Schedule check-in call');
  }

  // Low feature adoption
  if (signals.some(s => s.name === 'Low Feature Adoption')) {
    recommendations.push('Send feature education series');
    recommendations.push('Share use case examples');
    recommendations.push('Offer product training session');
  }

  // Support issues
  if (signals.some(s => s.name === 'Multiple Support Tickets')) {
    recommendations.push('Proactively reach out to solve issues');
    recommendations.push('Assign dedicated support contact');
    recommendations.push('Offer compensation for inconvenience');
  }

  // Payment issues
  if (signals.some(s => s.name === 'Payment Issues')) {
    recommendations.push('Send payment update reminder');
    recommendations.push('Offer payment plan options');
    recommendations.push('Provide grace period');
  }

  // Downgrade
  if (signals.some(s => s.name === 'Downgrade Activity')) {
    recommendations.push('Understand reason for downgrade');
    recommendations.push('Offer features at current price');
    recommendations.push('Provide limited-time discount to upgrade');
  }

  // Cancel attempts
  if (signals.some(s => s.name === 'Cancel Attempts')) {
    recommendations.push('Trigger retention campaign immediately');
    recommendations.push('Offer discount or pause option');
    recommendations.push('Schedule urgent save call');
  }

  // Low NPS
  if (signals.some(s => s.name === 'Low NPS Score')) {
    recommendations.push('Follow up on feedback');
    recommendations.push('Show how issues are being addressed');
    recommendations.push('Offer to make it right');
  }

  // High-value customer
  if (behavior.mrr > 100) {
    recommendations.push('PRIORITY: High-value customer at risk');
    recommendations.push('Assign account manager immediately');
    recommendations.push('Offer custom solutions');
  }

  return recommendations;
}

/**
 * Get all at-risk customers
 */
export async function getAtRiskCustomers(
  minRiskScore: number = 50
): Promise<ChurnPrediction[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all active subscribers
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (!subscriptions) return [];

  // Calculate risk for each user
  const predictions = await Promise.all(
    subscriptions.map(sub => calculateChurnRisk(sub.user_id))
  );

  // Filter by minimum risk score
  return predictions
    .filter(p => p.riskScore >= minRiskScore)
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Save prediction to database
 */
export async function saveChurnPrediction(prediction: ChurnPrediction) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase
    .from('churn_predictions')
    .upsert({
      user_id: prediction.userId,
      risk_score: prediction.riskScore,
      risk_level: prediction.riskLevel,
      signals: prediction.signals,
      recommendations: prediction.recommendations,
      updated_at: new Date().toISOString(),
    });
}

/**
 * Run churn prediction for all users (daily job)
 */
export async function runChurnPredictionJob() {
  const atRiskCustomers = await getAtRiskCustomers(30);

  // Save predictions
  await Promise.all(
    atRiskCustomers.map(prediction => saveChurnPrediction(prediction))
  );

  // Notify team of critical risk customers
  const criticalRisk = atRiskCustomers.filter(p => p.riskLevel === 'critical');

  if (criticalRisk.length > 0) {
    await notifyTeam(criticalRisk);
  }

  return {
    total: atRiskCustomers.length,
    critical: criticalRisk.length,
    high: atRiskCustomers.filter(p => p.riskLevel === 'high').length,
    medium: atRiskCustomers.filter(p => p.riskLevel === 'medium').length,
  };
}

/**
 * Notify team of critical churn risks
 */
async function notifyTeam(criticalCustomers: ChurnPrediction[]) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const customerList = criticalCustomers
    .map(c => `- User ${c.userId}: ${c.riskScore}% risk (${c.signals.length} signals)`)
    .join('\n');

  await resend.emails.send({
    from: 'alerts@yoursaas.com',
    to: process.env.RETENTION_TEAM_EMAIL!,
    subject: `🚨 ${criticalCustomers.length} Customers at Critical Churn Risk`,
    text: `
      The following customers are at critical risk of churning:

      ${customerList}

      Take immediate action to retain these customers.

      View details: https://yoursaas.com/admin/churn-risk
    `,
  });
}

/**
 * Database schema
 */
export const churnPredictionSchema = `
CREATE TABLE churn_predictions (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  signals JSONB NOT NULL,
  recommendations TEXT[] NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_churn_risk_level ON churn_predictions(risk_level);
CREATE INDEX idx_churn_risk_score ON churn_predictions(risk_score DESC);
CREATE INDEX idx_churn_updated ON churn_predictions(updated_at DESC);
`;
