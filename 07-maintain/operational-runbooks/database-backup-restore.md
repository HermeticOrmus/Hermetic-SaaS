# Database Backup and Restore

Procedures for backing up and restoring your Supabase/PostgreSQL database.

## Overview

**Backup Strategy:**
- Automatic daily backups (Supabase built-in)
- Weekly full backups (stored off-site)
- Pre-deployment snapshots
- Point-in-time recovery (PITR)

**Retention:**
- Daily backups: 30 days
- Weekly backups: 90 days
- Monthly backups: 1 year
- Pre-deployment: 7 days

## Automatic Backups (Supabase)

### Supabase Pro/Team Plans

Supabase provides automated backups:
- **Daily backups**: Last 7 days (Pro)
- **Point-in-time recovery**: Up to 7 days (Pro+)
- **Geo-redundant**: Stored in multiple regions

**Access Backups:**
1. Go to Supabase Dashboard
2. Select your project
3. Settings > Database > Backups
4. Download or restore

## Manual Backups

### Full Database Backup

```bash
# Using pg_dump (recommended)
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump

# Or with plain SQL
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --file=backup_$(date +%Y%m%d_%H%M%S).sql
```

**Environment Variables:**
```bash
# Add to .env.local
DATABASE_URL="postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres"
```

### Schema-Only Backup

```bash
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  --file=schema_$(date +%Y%m%d).sql
```

### Data-Only Backup

```bash
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  --file=data_$(date +%Y%m%d).sql
```

### Specific Tables

```bash
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --table=users \
  --table=subscriptions \
  --file=critical_tables_$(date +%Y%m%d).sql
```

## Automated Backup Script

```bash
#!/bin/bash
# backup.sh - Automated database backup with S3 upload

set -e

# Configuration
DB_HOST="db.xxxxx.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"
BACKUP_DIR="/var/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.dump"
S3_BUCKET="s3://your-backup-bucket/database"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup at $(date)"
pg_dump -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  --format=custom \
  --file="${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
echo "Compressing backup..."
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" "${S3_BUCKET}/${BACKUP_FILE}.gz"

# Clean up old local backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +7 -delete

echo "Backup completed successfully at $(date)"

# Send notification
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"✅ Database backup completed: ${BACKUP_FILE}\"}"
```

**Schedule with Cron:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

## Pre-Deployment Backup

```bash
#!/bin/bash
# pre-deploy-backup.sh

set -e

echo "Creating pre-deployment backup..."

BACKUP_FILE="pre_deploy_$(date +%Y%m%d_%H%M%S).dump"

pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --format=custom \
  --file="/var/backups/pre-deploy/${BACKUP_FILE}"

echo "Backup saved: ${BACKUP_FILE}"
echo "BACKUP_FILE=${BACKUP_FILE}" >> $GITHUB_ENV
```

**Use in GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
- name: Backup database before deployment
  run: ./scripts/pre-deploy-backup.sh
  env:
    PGPASSWORD: ${{ secrets.DATABASE_PASSWORD }}

- name: Deploy
  run: vercel deploy --prod

- name: Verify deployment
  run: ./scripts/health-check.sh

# Restore on failure
- name: Restore backup on failure
  if: failure()
  run: ./scripts/restore-backup.sh $BACKUP_FILE
```

## Restore Procedures

### Full Database Restore

```bash
# From custom format
pg_restore -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  --if-exists \
  backup_20241005.dump

# From SQL file
psql -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_20241005.sql
```

### Restore to New Database

```bash
# Create new database
createdb -h db.xxxxx.supabase.co \
  -U postgres \
  -T template0 \
  restored_db

# Restore to new database
pg_restore -h db.xxxxx.supabase.co \
  -U postgres \
  -d restored_db \
  backup_20241005.dump
```

### Restore Specific Tables

```bash
# Restore single table
pg_restore -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --table=users \
  backup_20241005.dump

# Restore multiple tables
pg_restore -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --table=users \
  --table=subscriptions \
  backup_20241005.dump
```

### Point-in-Time Recovery (Supabase Pro+)

```sql
-- Restore to specific timestamp
SELECT pg_restore_to_time('2024-10-05 14:30:00');

-- Or use Supabase Dashboard:
-- Settings > Database > Point-in-Time Recovery
```

## Restore Verification

```bash
#!/bin/bash
# verify-restore.sh

set -e

echo "Verifying database restore..."

# Check row counts
psql -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT
    'users' as table_name, COUNT(*) as rows FROM users
    UNION ALL
    SELECT 'subscriptions', COUNT(*) FROM subscriptions
    UNION ALL
    SELECT 'projects', COUNT(*) FROM projects;"

# Check data integrity
psql -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT
    COUNT(*) as orphaned_subscriptions
    FROM subscriptions
    WHERE user_id NOT IN (SELECT id FROM users);"

# Check constraints
psql -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT
    table_name,
    constraint_name,
    constraint_type
    FROM information_schema.table_constraints
    WHERE table_schema = 'public';"

echo "Verification complete!"
```

## Disaster Recovery

### Scenario 1: Data Corruption

**Symptoms:**
- Invalid data in tables
- Referential integrity errors
- User reports of missing data

**Recovery:**
1. Identify affected time range
2. Stop write operations
3. Restore from last known good backup
4. Verify data integrity
5. Resume operations

**Commands:**
```bash
# 1. Create snapshot of current state
pg_dump [...] -f current_corrupted_state.dump

# 2. Restore from backup
pg_restore [...] last_good_backup.dump

# 3. Verify
./verify-restore.sh

# 4. Compare with current state if needed
diff <(pg_dump current) <(pg_dump restored)
```

### Scenario 2: Accidental Deletion

**Symptoms:**
- User reports deleted data
- Missing records
- Empty tables

**Recovery:**
```sql
-- 1. Check if using Supabase (has soft deletes)
SELECT * FROM users WHERE deleted_at IS NOT NULL;

-- 2. Restore deleted records from backup
CREATE TEMP TABLE users_backup AS
  SELECT * FROM backup_schema.users;

-- 3. Restore missing records
INSERT INTO users
SELECT * FROM users_backup
WHERE id NOT IN (SELECT id FROM users);

-- 4. Verify
SELECT COUNT(*) FROM users;
```

### Scenario 3: Complete Database Loss

**Recovery:**
1. Provision new Supabase project
2. Restore schema from version control
3. Restore data from latest backup
4. Update connection strings
5. Verify all services
6. Switch DNS/traffic

**Commands:**
```bash
# 1. Create new database
# (Via Supabase Dashboard)

# 2. Restore schema
psql -h new-db.supabase.co \
  -U postgres \
  -d postgres \
  -f schema.sql

# 3. Restore data
pg_restore -h new-db.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  latest_backup.dump

# 4. Update environment variables
# Update DATABASE_URL in Vercel

# 5. Deploy with new config
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
vercel deploy --prod
```

## Backup Best Practices

### 1. Test Restores Regularly

```bash
# Monthly restore test
./scripts/test-restore.sh

# Test script:
#!/bin/bash
# Create test database
createdb test_restore_$(date +%Y%m%d)

# Restore latest backup
pg_restore [...] -d test_restore_$(date +%Y%m%d)

# Run verification queries
./verify-restore.sh

# Cleanup
dropdb test_restore_$(date +%Y%m%d)
```

### 2. Monitor Backup Status

```typescript
// Check backup age
async function checkBackupAge() {
  const lastBackup = await getLastBackupTime();
  const hoursSinceBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);

  if (hoursSinceBackup > 25) {
    await sendAlert('Backup is over 24 hours old!');
  }
}
```

### 3. Secure Backups

```bash
# Encrypt backups
gpg --encrypt \
  --recipient your@email.com \
  backup_20241005.dump

# Upload encrypted
aws s3 cp backup_20241005.dump.gpg \
  s3://your-backup-bucket/ \
  --server-side-encryption AES256
```

### 4. Document Recovery Time Objectives

**RTO (Recovery Time Objective):**
- P0 incident: 1 hour
- P1 incident: 4 hours
- P2 incident: 24 hours

**RPO (Recovery Point Objective):**
- Maximum data loss: 24 hours
- With PITR: 5 minutes

## Backup Checklist

**Daily:**
- [ ] Automated backup runs
- [ ] Backup uploaded to S3
- [ ] Backup age < 25 hours
- [ ] No backup errors in logs

**Weekly:**
- [ ] Verify backup file size
- [ ] Test restore on staging
- [ ] Clean up old backups
- [ ] Review backup retention

**Monthly:**
- [ ] Full restore test
- [ ] Disaster recovery drill
- [ ] Update documentation
- [ ] Review backup strategy

## Storage Costs

**Estimate for 10GB database:**
- Supabase backups: Included in plan
- S3 storage: ~$0.25/month per backup
- 30 daily backups: ~$7.50/month
- Total: < $10/month for peace of mind

## Resources

- [Supabase Backups Docs](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 for Backups](https://aws.amazon.com/s3/)
