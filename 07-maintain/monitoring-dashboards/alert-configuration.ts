/**
 * Alert Configuration System
 *
 * Comprehensive alerting for revenue, performance, and system health.
 * Supports multiple notification channels (email, Slack, Discord, SMS).
 */

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  channels: ('email' | 'slack' | 'discord' | 'sms')[];
  cooldown: number; // minutes
  enabled: boolean;
}

interface AlertConfig {
  revenue: AlertRule[];
  performance: AlertRule[];
  system: AlertRule[];
  users: AlertRule[];
}

/**
 * Alert Configuration
 */
export const alertConfig: AlertConfig = {
  // Revenue Alerts
  revenue: [
    {
      id: 'mrr-drop',
      name: 'MRR Drop Alert',
      condition: 'mrr_change < threshold',
      threshold: -5, // 5% drop
      severity: 'critical',
      channels: ['email', 'slack'],
      cooldown: 60,
      enabled: true,
    },
    {
      id: 'churn-spike',
      name: 'Churn Spike Alert',
      condition: 'churn_rate > threshold',
      threshold: 5, // 5% monthly churn
      severity: 'warning',
      channels: ['email', 'slack'],
      cooldown: 1440, // daily
      enabled: true,
    },
    {
      id: 'failed-payment',
      name: 'Failed Payment Alert',
      condition: 'failed_payments > threshold',
      threshold: 3,
      severity: 'warning',
      channels: ['email'],
      cooldown: 60,
      enabled: true,
    },
    {
      id: 'subscription-cancel',
      name: 'High-Value Subscription Cancellation',
      condition: 'subscription_mrr > threshold',
      threshold: 100, // $100+ MRR
      severity: 'critical',
      channels: ['email', 'slack', 'sms'],
      cooldown: 0, // immediate
      enabled: true,
    },
  ],

  // Performance Alerts
  performance: [
    {
      id: 'api-latency',
      name: 'API Latency Alert',
      condition: 'p95_latency > threshold',
      threshold: 1000, // 1 second
      severity: 'warning',
      channels: ['slack'],
      cooldown: 15,
      enabled: true,
    },
    {
      id: 'error-rate',
      name: 'Error Rate Alert',
      condition: 'error_rate > threshold',
      threshold: 5, // 5%
      severity: 'critical',
      channels: ['email', 'slack', 'sms'],
      cooldown: 5,
      enabled: true,
    },
    {
      id: 'slow-query',
      name: 'Slow Query Alert',
      condition: 'query_time > threshold',
      threshold: 5000, // 5 seconds
      severity: 'warning',
      channels: ['slack'],
      cooldown: 30,
      enabled: true,
    },
  ],

  // System Alerts
  system: [
    {
      id: 'uptime',
      name: 'Downtime Alert',
      condition: 'status != healthy',
      threshold: 0,
      severity: 'critical',
      channels: ['email', 'slack', 'discord', 'sms'],
      cooldown: 5,
      enabled: true,
    },
    {
      id: 'database-connection',
      name: 'Database Connection Alert',
      condition: 'db_connections > threshold',
      threshold: 80, // 80% of pool
      severity: 'warning',
      channels: ['slack'],
      cooldown: 15,
      enabled: true,
    },
    {
      id: 'disk-space',
      name: 'Disk Space Alert',
      condition: 'disk_usage > threshold',
      threshold: 85, // 85% full
      severity: 'warning',
      channels: ['email', 'slack'],
      cooldown: 360,
      enabled: true,
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage Alert',
      condition: 'memory_usage > threshold',
      threshold: 90, // 90%
      severity: 'critical',
      channels: ['slack', 'sms'],
      cooldown: 15,
      enabled: true,
    },
  ],

  // User Alerts
  users: [
    {
      id: 'inactive-users',
      name: 'Inactive User Spike',
      condition: 'inactive_rate > threshold',
      threshold: 30, // 30% inactive
      severity: 'warning',
      channels: ['email'],
      cooldown: 1440, // daily
      enabled: true,
    },
    {
      id: 'support-tickets',
      name: 'Support Ticket Surge',
      condition: 'ticket_count > threshold',
      threshold: 10,
      severity: 'warning',
      channels: ['slack'],
      cooldown: 60,
      enabled: true,
    },
  ],
};

/**
 * Alert evaluation and notification
 */
export class AlertManager {
  private lastAlertTimes: Map<string, number> = new Map();

  async evaluateAlert(rule: AlertRule, currentValue: number, metadata?: any): Promise<boolean> {
    // Check if alert is enabled
    if (!rule.enabled) {
      return false;
    }

    // Check cooldown period
    const lastAlertTime = this.lastAlertTimes.get(rule.id);
    if (lastAlertTime) {
      const timeSinceLastAlert = Date.now() - lastAlertTime;
      const cooldownMs = rule.cooldown * 60 * 1000;

      if (timeSinceLastAlert < cooldownMs) {
        return false; // Still in cooldown
      }
    }

    // Evaluate condition
    const shouldAlert = this.evaluateCondition(rule.condition, currentValue, rule.threshold);

    if (shouldAlert) {
      await this.sendAlert(rule, currentValue, metadata);
      this.lastAlertTimes.set(rule.id, Date.now());
      return true;
    }

    return false;
  }

  private evaluateCondition(condition: string, value: number, threshold: number): boolean {
    if (condition.includes('<')) {
      return value < threshold;
    } else if (condition.includes('>')) {
      return value > threshold;
    } else if (condition.includes('!=')) {
      return value !== threshold;
    }
    return false;
  }

  private async sendAlert(rule: AlertRule, value: number, metadata?: any) {
    const alertMessage = this.formatAlertMessage(rule, value, metadata);

    // Send to all configured channels
    const promises = rule.channels.map(channel => {
      switch (channel) {
        case 'email':
          return this.sendEmailAlert(rule, alertMessage);
        case 'slack':
          return this.sendSlackAlert(rule, alertMessage);
        case 'discord':
          return this.sendDiscordAlert(rule, alertMessage);
        case 'sms':
          return this.sendSMSAlert(rule, alertMessage);
      }
    });

    await Promise.all(promises);
  }

  private formatAlertMessage(rule: AlertRule, value: number, metadata?: any): string {
    const severity = rule.severity.toUpperCase();
    const emoji = rule.severity === 'critical' ? '🚨' : '⚠️';

    return `${emoji} ${severity}: ${rule.name}

Value: ${value}
Threshold: ${rule.threshold}
Condition: ${rule.condition}

${metadata ? `Details: ${JSON.stringify(metadata, null, 2)}` : ''}

Time: ${new Date().toISOString()}`;
  }

  private async sendEmailAlert(rule: AlertRule, message: string) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'alerts@yoursaas.com',
      to: process.env.ALERT_EMAIL!,
      subject: `[${rule.severity.toUpperCase()}] ${rule.name}`,
      text: message,
    });
  }

  private async sendSlackAlert(rule: AlertRule, message: string) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const color = rule.severity === 'critical' ? 'danger' : 'warning';

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{
          color,
          title: rule.name,
          text: message,
          footer: 'HermeticSaaS Monitoring',
          ts: Math.floor(Date.now() / 1000),
        }],
      }),
    });
  }

  private async sendDiscordAlert(rule: AlertRule, message: string) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    const color = rule.severity === 'critical' ? 0xFF0000 : 0xFFA500;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: rule.name,
          description: message,
          color,
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  }

  private async sendSMSAlert(rule: AlertRule, message: string) {
    // Example with Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    const to = process.env.ALERT_PHONE_NUMBER;

    if (!accountSid || !authToken || !from || !to) return;

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: message.substring(0, 160), // SMS limit
        }),
      }
    );
  }
}

/**
 * Monitoring job to check alerts
 */
export async function runAlertMonitoring() {
  const manager = new AlertManager();

  // Check revenue alerts
  const revenueMetrics = await getRevenueMetrics();
  for (const rule of alertConfig.revenue) {
    const value = getMetricValue(revenueMetrics, rule.condition);
    await manager.evaluateAlert(rule, value, revenueMetrics);
  }

  // Check performance alerts
  const performanceMetrics = await getPerformanceMetrics();
  for (const rule of alertConfig.performance) {
    const value = getMetricValue(performanceMetrics, rule.condition);
    await manager.evaluateAlert(rule, value, performanceMetrics);
  }

  // Check system alerts
  const systemMetrics = await getSystemMetrics();
  for (const rule of alertConfig.system) {
    const value = getMetricValue(systemMetrics, rule.condition);
    await manager.evaluateAlert(rule, value, systemMetrics);
  }
}

function getMetricValue(metrics: any, condition: string): number {
  // Extract metric name from condition
  const metricName = condition.split(' ')[0];
  return metrics[metricName] || 0;
}

async function getRevenueMetrics() {
  // Implement actual metric fetching
  return {};
}

async function getPerformanceMetrics() {
  // Implement actual metric fetching
  return {};
}

async function getSystemMetrics() {
  // Implement actual metric fetching
  return {};
}
