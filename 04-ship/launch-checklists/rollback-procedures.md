# Rollback Procedures

Emergency procedures for quickly reverting deployments when things go wrong. Time is critical - follow these steps exactly.

## When to Rollback

### Immediate Rollback (< 5 minutes decision)

Execute rollback immediately if:
- 🚨 Site is completely down (500 errors for all users)
- 🚨 Payment processing completely broken
- 🚨 Data corruption occurring
- 🚨 Security breach detected
- 🚨 Critical user data exposed
- 🚨 Database connections failing

### Quick Rollback (< 30 minutes decision)

Consider rollback if:
- ⚠️ Error rate > 10% and rising
- ⚠️ Performance degraded > 5x normal
- ⚠️ Multiple critical features broken
- ⚠️ User complaints flooding in
- ⚠️ Payment success rate < 50%

### Monitor and Fix Forward (No rollback)

Stay on current version if:
- ✅ Error rate < 5% and stable
- ✅ Only minor bugs affecting few users
- ✅ Performance within acceptable range
- ✅ Fix can be deployed within 1 hour

---

## Pre-Rollback Checklist

**Before initiating rollback (2 minutes):**

- [ ] Confirm issue is in new deployment (not infrastructure)
- [ ] Identify last known good version
- [ ] Notify team in war room
- [ ] Update status page: "Investigating"
- [ ] Post on Twitter: "We're aware of issues"
- [ ] Capture error logs and metrics
- [ ] Take database snapshot (if time permits)

---

## Platform-Specific Rollback Procedures

### Vercel Rollback

**Time to Complete: 2-3 minutes**

**Method 1: Vercel Dashboard (Recommended)**

```
1. Go to vercel.com/[your-project]/deployments
2. Find previous successful deployment
3. Click three dots menu (...)
4. Click "Promote to Production"
5. Confirm promotion
6. Wait 30 seconds for propagation
```

**Method 2: Vercel CLI**

```bash
# 1. List recent deployments
vercel ls

# 2. Find last working deployment URL
# Look for deployment before the broken one

# 3. Promote that deployment to production
vercel promote [deployment-url] --yes

# 4. Verify
curl -I https://yourapp.com
```

**Post-Rollback:**
- [ ] Run smoke tests
- [ ] Check error rate dropped
- [ ] Update status page: "Monitoring"
- [ ] Post update on Twitter

### Railway Rollback

**Time to Complete: 3-5 minutes**

**Via Dashboard:**

```
1. Go to Railway dashboard
2. Click on your service
3. Click "Deployments" tab
4. Find previous successful deployment
5. Click "Redeploy"
6. Confirm and wait for deployment
```

**Via CLI:**

```bash
# 1. Check deployment history
railway status

# 2. List recent deployments
railway deployments list

# 3. Rollback to specific deployment
railway rollback [deployment-id]

# 4. Verify
railway status
```

**Post-Rollback:**
- [ ] Check database migrations (may need to reverse)
- [ ] Verify service health
- [ ] Run smoke tests

### Fly.io Rollback

**Time to Complete: 2-4 minutes**

**Via CLI:**

```bash
# 1. List release history
flyctl releases

# Output shows:
# VERSION  STATUS    DESCRIPTION           DATE
# v10      complete  Deploy image          2m ago
# v9       complete  Deploy image          2h ago  ← Rollback to this

# 2. Rollback to previous version
flyctl releases rollback v9

# 3. Verify rollback
flyctl status

# 4. Check application health
flyctl logs
```

**Post-Rollback:**
- [ ] Verify all regions updated
- [ ] Check health checks passing
- [ ] Monitor logs for errors

### AWS ECS Rollback

**Time to Complete: 5-10 minutes**

**Via AWS Console:**

```
1. Go to ECS Console
2. Select your cluster
3. Select your service
4. Click "Update"
5. Under "Task Definition", select previous revision
6. Click "Skip to review"
7. Click "Update Service"
8. Wait for deployment to complete (check "Events" tab)
```

**Via AWS CLI:**

```bash
# 1. Get previous task definition
aws ecs list-task-definitions \
  --family-prefix your-app \
  --sort DESC \
  --max-items 5

# 2. Update service to use previous task definition
aws ecs update-service \
  --cluster production-cluster \
  --service api-production \
  --task-definition your-app:PREVIOUS_REVISION

# 3. Wait for service to stabilize
aws ecs wait services-stable \
  --cluster production-cluster \
  --services api-production

# 4. Verify deployment
aws ecs describe-services \
  --cluster production-cluster \
  --services api-production
```

**Post-Rollback:**
- [ ] Check load balancer health
- [ ] Verify all tasks running
- [ ] Check CloudWatch logs

---

## Database Rollback

### Database Migration Rollback

**Caution:** Database rollbacks are risky. Only do this if absolutely necessary.

**Prisma:**

```bash
# 1. Create backup FIRST
npm run db:backup

# 2. Check migration history
npx prisma migrate status

# 3. Rollback last migration (Prisma doesn't support this directly)
# You need to:
# - Create a new migration that reverses changes
# OR
# - Restore from backup

# 4. Restore from backup (if needed)
psql $DATABASE_URL < backup-[timestamp].sql
```

**Drizzle:**

```bash
# 1. Backup database
npm run db:backup

# 2. List migrations
npm run db:studio

# 3. Manually reverse migration
# Create down migration file
npm run db:generate -- --name revert_[feature]

# 4. Apply rollback
npm run db:migrate
```

**Direct SQL Rollback:**

```sql
-- Example: Rolling back a table addition
BEGIN;

-- Drop the table that was added
DROP TABLE IF EXISTS new_table CASCADE;

-- Verify other tables are intact
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM organizations;

-- If everything looks good, commit
COMMIT;

-- If something is wrong, rollback
-- ROLLBACK;
```

### Database Restore from Backup

**PostgreSQL (Supabase/Railway/Fly):**

```bash
# 1. Stop application (prevent writes)
# Disable deployments or scale to 0

# 2. Create current state backup (just in case)
pg_dump $DATABASE_URL > emergency-backup-$(date +%Y%m%d-%H%M%S).sql

# 3. Find last good backup
ls -lh backups/

# 4. Restore from backup
psql $DATABASE_URL < backups/backup-[good-timestamp].sql

# 5. Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 6. Restart application
```

**Important Notes:**
- ⚠️ Database restore will lose any data created after backup
- ⚠️ Communicate with users about data loss
- ⚠️ Consider point-in-time recovery if available (AWS RDS)

---

## Code Rollback (Git)

### Revert Recent Commit

```bash
# 1. Identify bad commit
git log --oneline -10

# 2. Revert the commit (creates new commit that undoes changes)
git revert [bad-commit-hash]

# 3. Push to trigger redeploy
git push origin main

# This is safer than reset - keeps history
```

### Hard Reset (Use with Caution)

```bash
# WARNING: This rewrites history
# Only use if you haven't shared the bad commit

# 1. Find last good commit
git log --oneline

# 2. Reset to that commit
git reset --hard [good-commit-hash]

# 3. Force push (dangerous!)
git push --force origin main

# This triggers redeploy to last good state
```

---

## Post-Rollback Actions

### Immediate (< 15 minutes)

- [ ] Verify rollback successful
- [ ] Run complete smoke test
- [ ] Check all critical flows work
- [ ] Monitor error rates (should drop)
- [ ] Update status page: "Resolved"
- [ ] Post on Twitter: "Issue resolved"
- [ ] Notify team in war room

### Short-term (< 1 hour)

- [ ] Identify root cause of failure
- [ ] Document what went wrong
- [ ] Create fix in separate branch
- [ ] Write tests to prevent recurrence
- [ ] Review with team
- [ ] Plan re-deployment

### Follow-up (< 24 hours)

- [ ] Email affected users
- [ ] Post detailed post-mortem
- [ ] Update monitoring/alerts
- [ ] Improve deployment process
- [ ] Schedule re-deployment
- [ ] Team retrospective

---

## Communication Templates

### Status Page - Investigating
```
We're investigating reports of [ISSUE]. Our team is working to resolve this as quickly as possible.

Status: Investigating
Started: [TIME]
Updates: We'll post an update in 15 minutes
```

### Status Page - Rolling Back
```
We've identified the issue and are rolling back to a previous stable version. This should resolve the problem within 5 minutes.

Status: Rolling Back
Started: [TIME]
ETA: 5 minutes
```

### Status Page - Resolved
```
✅ Resolved

The deployment has been rolled back and all systems are operating normally. The issue affected [X%] of users for [Y] minutes.

Root cause: [Brief description]
Resolution: Rolled back to previous stable version
Duration: [X] minutes

We apologize for any inconvenience and are working to prevent this in the future.
```

### Twitter Update
```
We've rolled back a deployment that was causing issues. Everything is back to normal now. We're sorry for the disruption and are working to ensure this doesn't happen again. 🙏
```

### Email to Affected Users
```
Subject: Service Disruption - Resolved

Hi [NAME],

We wanted to let you know about a brief service disruption today.

What happened:
A recent deployment caused [ISSUE] between [START TIME] and [END TIME].

What we did:
Our team immediately rolled back to a previous stable version, resolving the issue within [X] minutes.

Your data:
All your data is safe and secure. No data was lost during this incident.

What's next:
We're conducting a thorough review to prevent this from happening again.

We sincerely apologize for any inconvenience. If you experienced any issues that weren't resolved by the rollback, please reach out to us at support@yourapp.com.

Thank you for your patience and understanding.

[YOUR NAME]
[COMPANY]
```

---

## Prevention: Pre-Deployment Checklist

To avoid needing rollbacks, always:

- [ ] Test in staging environment
- [ ] Run full test suite
- [ ] Deploy during low-traffic hours
- [ ] Use feature flags for risky changes
- [ ] Deploy to small percentage first (canary)
- [ ] Monitor metrics during deployment
- [ ] Have rollback plan ready
- [ ] Keep team on standby
- [ ] Test rollback procedure in staging

---

## Rollback Decision Matrix

```
┌─────────────────────────────────────────────────────────┐
│                 ROLLBACK DECISION TREE                  │
└─────────────────────────────────────────────────────────┘

Is the site down for all users?
├─ YES → ROLLBACK IMMEDIATELY
└─ NO → Continue

Is payment processing broken?
├─ YES → ROLLBACK IMMEDIATELY
└─ NO → Continue

Is data being corrupted?
├─ YES → ROLLBACK IMMEDIATELY
└─ NO → Continue

Is error rate > 10%?
├─ YES → Rollback in 5 minutes if not improving
└─ NO → Continue

Are critical features broken?
├─ YES → Rollback in 15 minutes if no quick fix
└─ NO → Continue

Is error rate < 5% and stable?
├─ YES → Monitor and fix forward
└─ NO → Consider rollback
```

---

## Rollback Drill

**Practice quarterly:**

1. Schedule drill during low-traffic period
2. Deploy intentionally broken version to staging
3. Execute rollback procedure
4. Time each step
5. Document improvements
6. Update this playbook

---

## Emergency Contacts

```
On-Call Engineering: [PHONE]
DevOps Lead: [PHONE]
CTO: [PHONE]

Platform Support:
- Vercel: support.vercel.com
- Railway: help.railway.app
- Fly.io: community.fly.io
- AWS: aws.amazon.com/premiumsupport/
```

---

**Remember**: Rollbacks are not failures - they're safety mechanisms. It's always better to rollback and investigate than to leave users with a broken experience.

**HermeticSaaS Principle**: When in doubt, rollback. You can always redeploy after fixing the issue properly.
