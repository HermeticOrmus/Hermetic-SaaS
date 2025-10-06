# Monitoring Dashboards

Comprehensive monitoring and observability setup for HermeticSaaS applications.

## Overview

This monitoring system provides complete visibility into:
- Application errors and performance (Sentry, LogRocket)
- Infrastructure health (BetterUptime, custom health checks)
- Business metrics (MRR/ARR, user engagement)
- Real-time alerting across multiple channels

## Components

### 1. Error Tracking (Sentry)

**Setup:**
```typescript
import { initSentry } from './sentry-setup';

initSentry({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% for production
});
```

**Usage:**
```typescript
import { captureSentryError, setSentryUser } from './sentry-setup';

// Track errors
try {
  await riskyOperation();
} catch (error) {
  captureSentryError(error, {
    feature: 'billing',
    action: 'process_payment',
  });
}

// Set user context
setSentryUser({
  id: user.id,
  email: user.email,
  subscription: user.subscription,
});
```

**Best Practices:**
- Set user context on authentication
- Clear user context on logout
- Use breadcrumbs for debugging context
- Filter sensitive data before sending
- Group similar errors together
- Track release versions

### 2. Session Replay (LogRocket)

**Setup:**
```typescript
import { initLogRocket } from './logrocket-setup';

initLogRocket({
  appId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!,
  environment: process.env.NODE_ENV,
  enabled: true,
});
```

**Usage:**
```typescript
import { identifyLogRocketUser, trackLogRocketEvent } from './logrocket-setup';

// Identify user
identifyLogRocketUser({
  id: user.id,
  email: user.email,
  subscription: user.subscription,
  mrr: user.monthlyRevenue,
});

// Track events
trackLogRocketEvent('Feature Used', {
  feature: 'export',
  format: 'csv',
});

// Get session URL for support
const sessionUrl = await getLogRocketSessionURL();
```

**Best Practices:**
- Only enable in production for cost efficiency
- Sanitize sensitive input fields
- Track high-value user sessions
- Include session URLs in support tickets
- Monitor performance impact

### 3. Uptime Monitoring (BetterUptime)

**Setup:**
```typescript
import { createBetterUptimeMonitor } from './uptime-monitoring';

// Create monitors for all critical endpoints
await createBetterUptimeMonitor({
  name: 'API Health',
  url: 'https://api.yoursaas.com/health',
  method: 'GET',
  interval: 30,
  timeout: 10,
  expectedStatus: 200,
});
```

**Health Check Endpoint:**
```typescript
// app/api/health/route.ts
import { performHealthCheck } from './uptime-monitoring';

export async function GET() {
  const health = await performHealthCheck();

  return Response.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  });
}
```

**Best Practices:**
- Monitor all critical user paths
- Check dependencies (database, cache, payments)
- Set appropriate check intervals
- Configure escalation policies
- Maintain a public status page

### 4. Business Dashboards

#### MRR/ARR Dashboard
Real-time revenue metrics tracking:
- Monthly and Annual Recurring Revenue
- MRR movement (new, expansion, contraction, churn)
- Customer metrics and cohorts
- LTV:CAC ratio
- Plan distribution

**Usage:**
```typescript
import { MRRDashboard } from './dashboard-mrr-tracking';

// In your admin panel
<MRRDashboard />
```

#### User Engagement Dashboard
Track product usage and retention:
- DAU/MAU/WAU metrics
- Feature adoption rates
- Cohort retention analysis
- User segments
- Activity trends

**Usage:**
```typescript
import { UserEngagementDashboard } from './dashboard-user-engagement';

<UserEngagementDashboard />
```

### 5. Alert Configuration

**Setup:**
```typescript
import { alertConfig, runAlertMonitoring } from './alert-configuration';

// Run as cron job (every 5 minutes)
await runAlertMonitoring();
```

**Alert Channels:**
- Email (critical alerts, daily digests)
- Slack (team notifications)
- Discord (community alerts)
- SMS (critical issues only)

**Alert Types:**

1. **Revenue Alerts**
   - MRR drops > 5%
   - Churn rate > 5%
   - High-value subscription cancellations
   - Failed payments

2. **Performance Alerts**
   - API latency > 1s (p95)
   - Error rate > 5%
   - Slow database queries > 5s

3. **System Alerts**
   - Service downtime
   - Database connection issues
   - High memory/disk usage

4. **User Alerts**
   - Inactive user spikes
   - Support ticket surges

## Environment Variables

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_auth_token

# LogRocket
NEXT_PUBLIC_LOGROCKET_APP_ID=your_logrocket_app_id

# BetterUptime
BETTERUPTIME_API_KEY=your_api_key

# Alert Channels
ALERT_EMAIL=alerts@yoursaas.com
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
ALERT_PHONE_NUMBER=+1234567890
```

## Deployment

### Vercel (Recommended)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/monitoring/alerts",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/monitoring/health",
      "schedule": "* * * * *"
    }
  ]
}
```

### Manual Cron (Alternative)

```bash
# Run alert monitoring every 5 minutes
*/5 * * * * curl https://yoursaas.com/api/monitoring/alerts
```

## Monitoring Strategy

### 99.9% Uptime Goal

**Monitoring:**
- Health checks every 30 seconds
- Multi-region monitoring
- Automated failover alerts
- Performance budgets

**Allowable Downtime:**
- Monthly: 43.2 minutes
- Weekly: 10.1 minutes
- Daily: 1.4 minutes

### Alert Priorities

**Critical (Immediate Response):**
- Service downtime
- Payment processing failures
- Data loss risks
- Security incidents

**Warning (15min Response):**
- Performance degradation
- High error rates
- Resource exhaustion
- MRR drops

**Info (Daily Review):**
- Trend changes
- Usage patterns
- Feature adoption
- User feedback

## Cost Optimization

**Sentry:**
- Use 10% sampling in production
- Filter known errors
- Set data retention limits
- Monitor quota usage

**LogRocket:**
- Only track authenticated users
- Sample sessions (10-20%)
- Focus on high-value customers
- Archive old sessions

**BetterUptime:**
- Consolidate similar checks
- Adjust check frequencies
- Use health check endpoints
- Leverage free tier

## Best Practices

1. **Error Tracking**
   - Catch and log all errors
   - Add context and breadcrumbs
   - Group similar issues
   - Track error trends

2. **Performance Monitoring**
   - Set performance budgets
   - Monitor Core Web Vitals
   - Track API latency
   - Optimize slow queries

3. **Business Metrics**
   - Track daily/weekly/monthly
   - Set growth targets
   - Monitor churn signals
   - Analyze user cohorts

4. **Alerting**
   - Avoid alert fatigue
   - Set appropriate thresholds
   - Use cooldown periods
   - Escalate critical issues

5. **Documentation**
   - Document all alerts
   - Create runbooks
   - Track incident history
   - Share learnings

## Monitoring Checklist

- [ ] Sentry configured and receiving errors
- [ ] LogRocket tracking user sessions
- [ ] BetterUptime monitoring all endpoints
- [ ] Health check endpoint implemented
- [ ] Status page configured
- [ ] Alert rules configured
- [ ] Alert channels tested
- [ ] Dashboards deployed
- [ ] Team trained on monitoring tools
- [ ] Incident response process documented

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [LogRocket Documentation](https://docs.logrocket.com/)
- [BetterUptime API](https://docs.betteruptime.com/)
- [SaaS Metrics Guide](https://www.saastr.com/saaS-metrics/)
- [Incident Response Best Practices](https://incident.io/guide/)
