# Operational Runbooks

Step-by-step procedures for handling operational scenarios and maintaining system reliability.

## Overview

These runbooks provide clear procedures for:
- Incident response and recovery
- Database operations
- Performance optimization
- Security incident handling
- Scaling operations
- Cost optimization

## Runbooks

### 1. Incident Response (`incident-response.md`)

Complete playbook for handling production incidents:
- Severity classification (P0-P3)
- Response procedures
- Communication templates
- Postmortem process
- Common incident scenarios

**When to use:**
- Service outages
- Performance issues
- Error spikes
- User-reported problems

**Key contacts:**
- On-call engineer
- Engineering lead
- Support team

### 2. Database Backup & Restore (`database-backup-restore.md`)

Database backup and recovery procedures:
- Automated backups
- Manual backup procedures
- Restore procedures
- Disaster recovery
- Verification steps

**When to use:**
- Before major deployments
- Disaster recovery
- Data corruption
- Accidental deletion

**Backup schedule:**
- Daily: Automated (2 AM)
- Weekly: Full backup
- Pre-deployment: Always

### 3. Performance Degradation Response

Quick reference for performance issues:

**Detection:**
- Vercel analytics show slow responses
- User complaints
- Monitoring alerts

**Quick Checks:**
```bash
# Check Vercel performance
vercel logs --follow

# Check database performance
# Supabase Dashboard > Logs > Query Performance

# Check Sentry performance
# Sentry.io > Performance
```

**Common Fixes:**
1. **Slow Database Queries**
   ```sql
   -- Find slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;

   -- Add index
   CREATE INDEX idx_users_email ON users(email);
   ```

2. **Memory Issues**
   - Check for memory leaks
   - Optimize large data fetches
   - Add pagination

3. **API Rate Limits**
   - Implement caching
   - Add rate limiting
   - Optimize API calls

4. **CDN Issues**
   - Verify Vercel Edge Network
   - Check asset optimization
   - Purge cache if needed

### 4. Security Incident Protocol

**Suspected Security Breach:**

1. **Immediate Actions** (0-15 min)
   - Isolate affected systems
   - Preserve evidence (logs, backups)
   - Notify security team
   - Create incident channel

2. **Assessment** (15-60 min)
   - Identify breach scope
   - Determine data exposure
   - Check for backdoors
   - Review access logs

3. **Containment** (1-4 hours)
   - Revoke compromised credentials
   - Patch vulnerabilities
   - Block malicious IPs
   - Reset user passwords if needed

4. **Eradication** (4-24 hours)
   - Remove malware/backdoors
   - Close security holes
   - Update dependencies
   - Harden systems

5. **Recovery** (24-48 hours)
   - Restore from clean backups
   - Verify system integrity
   - Monitor for re-infection
   - Resume normal operations

6. **Post-Incident** (48+ hours)
   - Full security audit
   - Notify affected users
   - File compliance reports
   - Update security measures

**Common Security Issues:**

**SQL Injection:**
```typescript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Secure
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email);
```

**XSS (Cross-Site Scripting):**
```typescript
// ❌ Vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Secure
<div>{userInput}</div> // React escapes by default
```

**Authentication Issues:**
```typescript
// ✅ Always verify sessions
const { data: { session } } = await supabase.auth.getSession();
if (!session) return unauthorized();
```

### 5. Scaling Procedures

**When to Scale:**
- Response times > 1 second (p95)
- Database connections > 80%
- Memory usage > 85%
- Error rate > 2%
- Concurrent users approaching limit

**Horizontal Scaling (Serverless):**
```bash
# Vercel automatically scales
# No action needed - pay per use

# Monitor in dashboard
vercel logs --follow
```

**Database Scaling:**
```bash
# 1. Analyze current usage
# Supabase Dashboard > Usage

# 2. Upgrade plan if needed
# Settings > Subscription > Upgrade

# 3. Add read replicas (Enterprise)
# Settings > Database > Read Replicas

# 4. Implement connection pooling
# Settings > Database > Connection Pooling
```

**Caching Layer:**
```typescript
// Add Redis/Upstash for caching
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache expensive queries
async function getUser(id: string) {
  // Check cache
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  // Query database
  const user = await db.user.findUnique({ where: { id } });

  // Cache for 1 hour
  await redis.set(`user:${id}`, JSON.stringify(user), { ex: 3600 });

  return user;
}
```

**CDN Optimization:**
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Cache headers
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 6. Cost Optimization Checklist

**Monthly Review:**

**Vercel:**
- [ ] Check bandwidth usage
- [ ] Review function execution time
- [ ] Optimize image sizes
- [ ] Remove unused deployments
- [ ] Consider Edge Functions

**Supabase:**
- [ ] Review database size
- [ ] Check bandwidth usage
- [ ] Optimize queries
- [ ] Archive old data
- [ ] Review file storage

**Third-Party Services:**
- [ ] Sentry: Review event quota
- [ ] LogRocket: Optimize session recording
- [ ] Resend: Check email volume
- [ ] OpenAI: Monitor API usage
- [ ] Stripe: No optimization needed

**Cost Reduction Strategies:**

1. **Database Optimization**
   ```sql
   -- Find large tables
   SELECT
     schemaname,
     tablename,
     pg_total_relation_size(schemaname||'.'||tablename) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY size DESC;

   -- Archive old data
   DELETE FROM analytics_events
   WHERE created_at < NOW() - INTERVAL '90 days';

   -- Vacuum to reclaim space
   VACUUM FULL analytics_events;
   ```

2. **Image Optimization**
   ```bash
   # Use next/image for automatic optimization
   import Image from 'next/image';

   <Image
     src="/hero.jpg"
     width={1200}
     height={600}
     alt="Hero"
     priority
   />
   ```

3. **Function Optimization**
   ```typescript
   // Reduce function execution time
   export const config = {
     maxDuration: 10, // seconds
   };

   // Use Edge Runtime when possible
   export const runtime = 'edge';
   ```

4. **Caching Strategy**
   ```typescript
   // Cache API responses
   export async function GET(request: Request) {
     const data = await fetchData();

     return new Response(JSON.stringify(data), {
       headers: {
         'Cache-Control': 'public, s-maxage=3600',
         'Content-Type': 'application/json',
       },
     });
   }
   ```

## Emergency Procedures

### Complete Outage

1. **Check Status Pages**
   - Vercel: https://www.vercel-status.com/
   - Supabase: https://status.supabase.com/
   - Stripe: https://status.stripe.com/

2. **If Vercel Issue:**
   - Check deployment status
   - Rollback to previous version
   - Contact Vercel support

3. **If Database Issue:**
   - Check Supabase dashboard
   - Verify connection pool
   - Contact Supabase support

4. **If Code Issue:**
   ```bash
   # Immediate rollback
   vercel rollback [previous-url]

   # Or deploy last known good commit
   git reset --hard [commit-hash]
   vercel deploy --prod
   ```

### Data Loss Prevention

**Real-time Backup:**
```bash
# Before risky operations
./scripts/pre-deploy-backup.sh

# Before running migrations
pg_dump [...] -f pre_migration_backup.dump

# Before bulk updates
BEGIN;
-- Test update
SELECT COUNT(*) FROM users WHERE updated_at > NOW();
-- If looks good
COMMIT;
-- If not
ROLLBACK;
```

**Audit Trail:**
```sql
-- Enable row-level auditing
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Monitoring & Alerts

### Key Metrics to Watch

**Application:**
- Error rate (< 1%)
- Response time p95 (< 1s)
- Availability (> 99.9%)
- Deployment frequency
- Failed deployments

**Database:**
- Connection count (< 80%)
- Query performance
- Database size
- Replication lag
- Backup status

**Business:**
- Active users (DAU/MAU)
- Conversion rate
- MRR/ARR
- Churn rate
- Support tickets

### Alert Thresholds

```typescript
// alert-thresholds.ts
export const ALERT_THRESHOLDS = {
  // Performance
  errorRate: 1, // %
  p95ResponseTime: 1000, // ms
  p99ResponseTime: 2000, // ms

  // Database
  connectionPoolUsage: 80, // %
  queryDuration: 5000, // ms
  diskUsage: 85, // %

  // Business
  churnRate: 5, // %
  supportTickets: 10, // per day
  failedPayments: 3, // per day

  // System
  cpuUsage: 80, // %
  memoryUsage: 85, // %
  diskUsage: 85, // %
};
```

## Best Practices

1. **Document Everything**
   - Update runbooks after incidents
   - Keep procedures current
   - Share learnings with team

2. **Test Regularly**
   - Practice incident response
   - Test backup restores
   - Conduct disaster recovery drills

3. **Automate When Possible**
   - Automated backups
   - Automated alerts
   - Automated scaling

4. **Monitor Proactively**
   - Set up comprehensive monitoring
   - Configure meaningful alerts
   - Review metrics regularly

5. **Learn from Incidents**
   - Write postmortems
   - Implement preventive measures
   - Share knowledge

## Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Sentry Docs**: https://docs.sentry.io/
- **Stripe Docs**: https://stripe.com/docs
- **SRE Book**: https://sre.google/books/

## Quick Reference

**Common Commands:**
```bash
# Deploy
vercel deploy --prod

# Rollback
vercel rollback [url]

# Logs
vercel logs --follow

# Database backup
pg_dump -h [host] -U postgres -d postgres -f backup.dump

# Database restore
pg_restore -h [host] -U postgres -d postgres backup.dump

# Check status
curl https://api.yoursaas.com/health
```

**Emergency Contacts:**
- On-Call: [phone]
- Engineering: [phone]
- Support: support@yoursaas.com
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
