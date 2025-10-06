# Deployment Scripts for HermeticSaaS

One-click deployment scripts for all major platforms. Deploy your SaaS in minutes, not hours.

## Overview

These scripts automate deployment to:
- **Vercel** - Next.js apps with zero config
- **Railway** - Full-stack apps with database
- **Fly.io** - Global edge deployment
- **Supabase** - Database, auth, and storage

## Quick Start

### 1. Vercel Deployment (Next.js)

**Best for**: Next.js apps, static sites, serverless functions

```bash
# Make script executable
chmod +x vercel-deploy.sh

# Deploy to preview
./vercel-deploy.sh preview

# Deploy to staging
./vercel-deploy.sh staging

# Deploy to production
./vercel-deploy.sh production
```

**What it does**:
- Runs TypeScript type checking
- Lints your code
- Runs all tests
- Builds locally to catch errors
- Deploys to Vercel
- Runs health checks
- Opens deployment in browser

**First-time setup**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# The script handles the rest!
```

### 2. Railway Deployment (Full-Stack)

**Best for**: Full-stack apps, APIs with database, monorepos

```bash
# Make script executable
chmod +x railway-deploy.sh

# Initialize new project
./railway-deploy.sh init

# Deploy
./railway-deploy.sh deploy

# View logs
./railway-deploy.sh logs

# Rollback if needed
./railway-deploy.sh rollback
```

**What it does**:
- Creates Railway project
- Provisions PostgreSQL database
- Optionally adds Redis
- Sets environment variables from .env.production
- Creates railway.json config
- Runs database migrations
- Deploys with health checks

**Database migrations**:
```bash
# Create migration
npm run db:migrate:create add_users_table

# Run migrations on deploy
./railway-deploy.sh migrate
```

### 3. Fly.io Deployment (Global Edge)

**Best for**: Apps needing global distribution, low latency, edge computing

```bash
# Make script executable
chmod +x flyio-deploy.sh

# Initialize app
./flyio-deploy.sh init

# Set secrets
./flyio-deploy.sh secrets

# Deploy
./flyio-deploy.sh deploy

# Scale globally
./flyio-deploy.sh regions

# Scale resources
./flyio-deploy.sh scale
```

**What it does**:
- Creates Fly.io app
- Generates optimized Dockerfile
- Configures multi-region deployment
- Sets up health checks
- Deploys with zero downtime
- Configures auto-scaling

**Global deployment**:
```bash
# Add regions for global coverage
./flyio-deploy.sh regions

# Popular regions:
# iad - Washington DC (US East)
# lax - Los Angeles (US West)
# fra - Frankfurt (Europe)
# syd - Sydney (Australia)
# sin - Singapore (Asia)
```

### 4. Supabase Setup (Backend as a Service)

**Best for**: Database, authentication, storage, real-time subscriptions

```bash
# Make script executable
chmod +x supabase-setup.sh

# Initialize project
./supabase-setup.sh init

# Start local development
./supabase-setup.sh start

# Run migrations
./supabase-setup.sh migrate

# Deploy to production
./supabase-setup.sh deploy

# Generate TypeScript types
./supabase-setup.sh types

# Backup database
./supabase-setup.sh backup
```

**What it does**:
- Initializes Supabase project
- Creates database schema
- Sets up authentication
- Configures Row Level Security (RLS)
- Creates storage buckets
- Deploys migrations
- Generates TypeScript types

**Local development**:
```bash
# Start Supabase locally
./supabase-setup.sh start

# Access services:
# Studio: http://localhost:54323
# API: http://localhost:54321
# DB: postgresql://postgres:postgres@localhost:54322/postgres
```

## Platform Comparison

### Vercel
**Pros**:
- Best Next.js integration
- Automatic preview deployments
- Global CDN
- Zero config
- Great DX

**Pricing**:
- Free: Hobby projects
- $20/mo: Pro (1 team member)
- $150/mo: Team

**Best for**: Next.js apps, landing pages, marketing sites

### Railway
**Pros**:
- Simple full-stack deployment
- Integrated database
- Fair pricing
- Great for monorepos
- Instant preview environments

**Pricing**:
- $5/mo minimum
- Pay per usage
- ~$20-50/mo typical

**Best for**: Full-stack apps, APIs, background workers

### Fly.io
**Pros**:
- Global edge network
- Run anywhere
- Auto-scaling
- WebSocket support
- Persistent storage

**Pricing**:
- 3 VMs free
- $0.0025/second after
- ~$5-20/mo typical

**Best for**: Global apps, real-time features, WebSockets

### Supabase
**Pros**:
- Complete backend
- PostgreSQL database
- Built-in auth
- Real-time subscriptions
- File storage

**Pricing**:
- Free: 500MB database, 1GB storage
- $25/mo: Pro (8GB database, 100GB storage)

**Best for**: Database + auth + storage all-in-one

## Deployment Workflows

### Solo Developer Workflow
```bash
# 1. Build feature locally
npm run dev

# 2. Deploy to preview (automatic with PR)
git push origin feature-branch

# 3. Test preview URL
# (Posted automatically to PR)

# 4. Merge to main
git checkout main
git merge feature-branch

# 5. Auto-deploy to production
git push origin main
```

### Team Workflow
```bash
# Developer:
git checkout -b feature/new-feature
git push origin feature/new-feature
# → Preview deployment created

# QA:
# Test preview URL
# Approve PR

# Lead:
git checkout staging
git merge feature/new-feature
git push origin staging
# → Staging deployment

# After validation:
git checkout main
git merge staging
git push origin main
# → Production deployment
```

## Environment Variables

### Required for all platforms:
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Payments (if using Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (if using Resend)
RESEND_API_KEY=re_...

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Setting secrets:

**Vercel**:
```bash
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
```

**Railway**:
```bash
railway variables --set DATABASE_URL=xxx
railway variables --set STRIPE_SECRET_KEY=xxx
```

**Fly.io**:
```bash
flyctl secrets set DATABASE_URL=xxx
flyctl secrets set STRIPE_SECRET_KEY=xxx
```

**Supabase**:
```bash
# Set in Supabase dashboard or use env vars in your app
```

## Database Migrations

### Prisma (recommended)
```bash
# Create migration
npx prisma migrate dev --name add_users

# Deploy to production
npx prisma migrate deploy

# Included in deployment scripts automatically
```

### Drizzle
```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push

# Migrations run automatically on deploy
```

### Supabase
```bash
# Create migration
supabase migration new add_users

# Apply locally
supabase db reset

# Deploy to production
./supabase-setup.sh deploy
```

## Rollback Procedures

### Vercel
```bash
# Via CLI
vercel rollback

# Via dashboard
# Go to deployments → Click previous → Promote to production
```

### Railway
```bash
# Via script
./railway-deploy.sh rollback

# Or manually
railway status
railway rollback [deployment-id]
```

### Fly.io
```bash
# List deployments
flyctl releases

# Rollback
flyctl releases rollback [version]
```

## Monitoring Deployments

### Health Checks

All scripts include health checks:
```bash
# Vercel
curl https://yourapp.vercel.app/api/health

# Railway
curl https://yourapp.railway.app/api/health

# Fly.io
curl https://yourapp.fly.dev/api/health
```

**Create health endpoint**:
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
```

### View Logs

```bash
# Vercel
vercel logs [deployment-url]

# Railway
./railway-deploy.sh logs
# or: railway logs

# Fly.io
./flyio-deploy.sh logs
# or: flyctl logs
```

## Cost Optimization

### Vercel
- Use ISR instead of SSR where possible
- Optimize images with next/image
- Enable edge caching
- Use serverless functions efficiently

### Railway
- Right-size your services
- Use sleep mode for dev environments
- Monitor usage dashboard
- Set up usage alerts

### Fly.io
- Use auto-stop machines in fly.toml
- Scale down unused regions
- Use shared CPU for lower traffic
- Monitor metrics

## Troubleshooting

### Deployment Fails

**Vercel**:
```bash
# Check build logs
vercel logs [url] --follow

# Test locally
vercel build

# Clear cache
vercel --force
```

**Railway**:
```bash
# View logs
railway logs

# Check service status
railway status

# Restart service
railway restart
```

**Fly.io**:
```bash
# View logs
flyctl logs

# Check app status
flyctl status

# SSH into machine
flyctl ssh console
```

### Database Connection Issues

```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Check network/firewall
# Ensure app can reach database
```

### Environment Variables Not Working

```bash
# Vercel - check they're set for correct environment
vercel env ls

# Railway - verify variables
railway variables

# Fly.io - check secrets
flyctl secrets list
```

## Best Practices

1. **Always test locally first**
   ```bash
   npm run build
   npm run test
   ```

2. **Use preview deployments**
   - Never push directly to production
   - Test in preview/staging first

3. **Back up before migrations**
   - All scripts include automatic backups
   - Keep backups for 30 days

4. **Monitor after deployment**
   - Check error rates
   - Verify critical paths work
   - Monitor performance

5. **Have rollback ready**
   - Know how to rollback quickly
   - Test rollback procedure
   - Keep previous version accessible

## Next Steps

1. Choose your platform(s)
2. Run the init script
3. Configure environment variables
4. Deploy to preview
5. Test thoroughly
6. Deploy to production
7. Monitor and iterate

## Support

- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **Fly.io**: https://fly.io/docs
- **Supabase**: https://supabase.com/docs

---

**HermeticSaaS Principle**: Deployment should be a single command. These scripts make it boring and reliable.
