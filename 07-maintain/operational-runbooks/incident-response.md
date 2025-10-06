# Incident Response Playbook

Procedures for handling production incidents and outages.

## Severity Levels

### P0 - Critical
**Impact:** Complete service outage, data loss, or security breach
**Response Time:** Immediate (< 15 minutes)
**Notification:** All hands on deck

**Examples:**
- Complete site/API downtime
- Database unavailable
- Data breach or security incident
- Payment processing down
- Data corruption or loss

### P1 - High
**Impact:** Major feature unavailable, significant user impact
**Response Time:** < 1 hour
**Notification:** On-call engineer + manager

**Examples:**
- Authentication service down
- Core feature broken
- Significant performance degradation
- Payment webhook failures
- Email sending failures

### P2 - Medium
**Impact:** Minor feature issues, limited user impact
**Response Time:** < 4 hours
**Notification:** On-call engineer

**Examples:**
- Non-critical feature broken
- UI bugs
- Slow response times
- Integration issues
- Minor data inconsistencies

### P3 - Low
**Impact:** Cosmetic issues, no functional impact
**Response Time:** Next business day
**Notification:** Engineering team

**Examples:**
- Visual bugs
- Documentation errors
- Low-priority feature requests
- Minor performance issues

## Incident Response Process

### 1. Detection (0-5 minutes)

**Triggers:**
- Monitoring alerts (Sentry, BetterUptime)
- User reports
- Internal discovery
- Support ticket surge

**Immediate Actions:**
1. Acknowledge alert
2. Assess severity
3. Create incident channel
4. Start incident log

### 2. Response (5-15 minutes)

**P0/P1 Response Team:**
- Incident Commander (IC)
- Engineering Lead
- Support Lead
- Product Owner (if needed)

**Communication:**
```
# Create Slack/Discord channel
/incident create #incident-[YYYY-MM-DD]-[description]

# Post initial status
🚨 **INCIDENT**: [Title]
**Severity**: P[0-3]
**Started**: [Time]
**IC**: @[name]
**Status**: Investigating

**Impact**: [Brief description]
**Users Affected**: [Estimate]
```

**Status Page:**
```
1. Go to status.yoursaas.com/admin
2. Create new incident
3. Set severity and description
4. Enable notifications
```

### 3. Investigation (15-60 minutes)

**Checklist:**
- [ ] Check recent deployments
- [ ] Review error logs (Sentry)
- [ ] Check system metrics
- [ ] Verify database health
- [ ] Test external dependencies
- [ ] Review recent changes

**Investigation Commands:**
```bash
# Check Vercel deployment status
vercel ls

# Check recent logs
vercel logs [deployment-url]

# Check Sentry errors
https://sentry.io/organizations/your-org/issues/

# Check database connections
# Supabase dashboard > Logs

# Check uptime status
# BetterUptime dashboard
```

**Document findings:**
```
**Root Cause Analysis**:
- What happened: [Description]
- When: [Timeline]
- Why: [Root cause]
- Impact: [Scope]
```

### 4. Mitigation (Varies)

**Options:**
1. **Rollback** (fastest)
   ```bash
   # Rollback to previous deployment
   vercel rollback [previous-deployment-url]
   ```

2. **Hotfix** (if rollback not possible)
   ```bash
   # Create emergency branch
   git checkout -b hotfix/[issue-name]

   # Make fix
   # Test locally
   # Deploy
   git push origin hotfix/[issue-name]
   vercel --prod
   ```

3. **Workaround** (temporary)
   - Feature flag disable
   - Traffic routing
   - Manual intervention

4. **Scale Resources** (if capacity issue)
   - Upgrade database
   - Add cache layer
   - Enable CDN

### 5. Resolution (After fix)

**Verification:**
- [ ] Core functionality working
- [ ] Error rates normal
- [ ] Performance metrics good
- [ ] User reports stopped
- [ ] Monitoring shows green

**Communication:**
```
✅ **RESOLVED**: [Title]
**Duration**: [X minutes/hours]
**Root Cause**: [Brief explanation]
**Resolution**: [What was done]
**Next Steps**: [Follow-up items]

Thank you for your patience!
```

**Status Page:**
- Update incident as resolved
- Post postmortem summary
- Thank users for patience

### 6. Postmortem (Within 48 hours)

**Required for P0/P1 incidents:**

**Template:**
```markdown
# Incident Postmortem: [Title]

## Summary
- **Date**: [YYYY-MM-DD]
- **Duration**: [X hours Y minutes]
- **Severity**: P[0-3]
- **Users Affected**: [Number/percentage]
- **Revenue Impact**: $[Amount if applicable]

## Timeline
- **[Time]**: Incident detected
- **[Time]**: Investigation started
- **[Time]**: Root cause identified
- **[Time]**: Fix deployed
- **[Time]**: Incident resolved
- **[Time]**: Monitoring resumed

## Root Cause
[Detailed explanation of what went wrong]

## Impact
- **Users**: [How many users affected]
- **Features**: [What was broken]
- **Data**: [Any data issues]
- **Revenue**: [Any financial impact]

## Resolution
[What was done to fix the issue]

## What Went Well
- Fast detection
- Quick response
- Good communication
- etc.

## What Went Wrong
- Late detection
- Unclear ownership
- Missing monitoring
- etc.

## Action Items
- [ ] [Task] - @owner - [Due date]
- [ ] [Task] - @owner - [Due date]
- [ ] [Task] - @owner - [Due date]

## Prevention
How to prevent this from happening again:
1. [Action item]
2. [Action item]
3. [Action item]
```

## Common Incidents

### Database Connection Issues

**Symptoms:**
- "Too many connections" errors
- Slow queries
- Timeouts

**Diagnosis:**
```bash
# Check active connections (Supabase)
SELECT count(*) FROM pg_stat_activity;

# Check long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

**Resolution:**
1. Kill long-running queries
2. Increase connection pool size
3. Add connection pooling (PgBouncer)
4. Scale database tier

### Stripe Webhook Failures

**Symptoms:**
- Subscription status out of sync
- Payment confirmations not sent
- User access issues

**Diagnosis:**
```bash
# Check webhook logs in Stripe Dashboard
# Webhooks > [Your endpoint] > Logs

# Check your endpoint logs
curl https://api.yoursaas.com/api/webhooks/stripe
```

**Resolution:**
1. Verify webhook signature validation
2. Check endpoint is responding 200
3. Replay failed events from Stripe
4. Manually sync affected users

### High Error Rate

**Symptoms:**
- Spike in Sentry errors
- User reports of errors
- Failed requests

**Diagnosis:**
1. Check Sentry for patterns
2. Review recent deployments
3. Check external dependencies
4. Review error logs

**Resolution:**
1. Rollback if recent deployment
2. Fix bug and deploy
3. Add error handling
4. Improve monitoring

### Performance Degradation

**Symptoms:**
- Slow page loads
- High response times
- Timeout errors

**Diagnosis:**
```bash
# Check Vercel analytics
# Dashboard > Analytics > Performance

# Check database performance
# Supabase > Logs > Query Performance

# Check API response times
# Sentry > Performance
```

**Resolution:**
1. Identify slow queries
2. Add database indexes
3. Implement caching
4. Optimize code
5. Scale resources

## Communication Templates

### Initial Alert

```
🚨 **INVESTIGATING**: We're aware of issues with [feature/service]

We're investigating and will provide updates every 15 minutes.

Status: https://status.yoursaas.com
```

### Update

```
**UPDATE**: We've identified the issue as [description]

Currently working on a fix. ETA: [time]

Affected: [scope]
```

### Resolution

```
✅ **RESOLVED**: [Feature/service] is now fully operational

Root cause: [brief explanation]
Duration: [time]

We apologize for the inconvenience. Full postmortem will be shared within 48 hours.
```

## On-Call Rotation

### Schedule
- Week 1: Engineer A
- Week 2: Engineer B
- Week 3: Engineer C
- Week 4: Back to Engineer A

### Responsibilities
- Respond to alerts within 15 minutes
- Triage and escalate as needed
- Document incidents
- Write postmortems
- Hand off to next on-call

### Tools
- Sentry (error monitoring)
- BetterUptime (uptime monitoring)
- Vercel Dashboard (deployments)
- Supabase Dashboard (database)
- Stripe Dashboard (payments)

### Escalation
1. On-call engineer (15 min)
2. Engineering lead (30 min)
3. CTO (1 hour)
4. CEO (for P0 only)

## Prevention Checklist

- [ ] Comprehensive monitoring
- [ ] Automated alerts
- [ ] Regular load testing
- [ ] Database backups
- [ ] Deployment rollback plan
- [ ] Incident response training
- [ ] Postmortem review process
- [ ] Status page setup
- [ ] On-call rotation
- [ ] Runbooks documented

## Resources

- **Status Page**: https://status.yoursaas.com
- **Monitoring**: https://sentry.io
- **Uptime**: https://betteruptime.com
- **Logs**: Vercel Dashboard
- **Database**: Supabase Dashboard
- **Payments**: Stripe Dashboard

## Emergency Contacts

- **On-Call Engineer**: [Phone]
- **Engineering Lead**: [Phone]
- **CTO**: [Phone]
- **Support Team**: support@yoursaas.com
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com
