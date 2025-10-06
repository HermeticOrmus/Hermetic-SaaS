# 04-SHIP: Complete Deployment & CI/CD Infrastructure

Production-ready deployment automation that makes shipping effortless for solo founders.

## Overview

This directory contains everything you need to deploy, test, and launch your SaaS application with confidence. Built on the HermeticSaaS principle: **deployment should be boring, predictable, and automatic**.

## What's Inside

### 1. CI/CD Templates (`ci-cd-templates/`)

Production-ready GitHub Actions workflows for automated testing and deployment.

**Includes:**
- Next.js + Vercel deployment workflow
- React Native + Expo EAS workflow
- Python API + AWS ECS workflow
- Vercel configuration templates
- Multi-environment support (preview/staging/production)

**Key Features:**
- Automated testing on every commit
- Preview deployments for PRs
- Zero-downtime production deploys
- Automatic rollback on failure
- Performance monitoring with Lighthouse
- Security scanning

**Time to Setup:** 30 minutes
**ROI:** Save 10+ hours per week on manual deployments

[View CI/CD Templates →](./ci-cd-templates/README.md)

---

### 2. Deployment Scripts (`deploy-scripts/`)

One-click deployment scripts for all major platforms.

**Platforms:**
- **Vercel** - Next.js apps with automatic preview deployments
- **Railway** - Full-stack apps with PostgreSQL database
- **Fly.io** - Global edge deployment with auto-scaling
- **Supabase** - Database + auth + storage setup

**Each Script Includes:**
- Pre-deployment checks (tests, linting, type-checking)
- Health checks after deployment
- Automatic rollback on failure
- Deployment logging
- Performance verification

**Usage:**
```bash
# Vercel (Next.js)
./vercel-deploy.sh production

# Railway (Full-stack)
./railway-deploy.sh deploy

# Fly.io (Global)
./flyio-deploy.sh deploy

# Supabase (Backend)
./supabase-setup.sh deploy
```

**Time to First Deploy:** 10-15 minutes
**Deployment Time:** 2-5 minutes

[View Deployment Scripts →](./deploy-scripts/README.md)

---

### 3. Testing Framework (`testing-framework/`)

Comprehensive testing setup for bulletproof deployments.

**Test Types:**
- **Unit Tests** - Jest + React Testing Library
- **Integration Tests** - API + database testing
- **E2E Tests** - Playwright for critical user flows
- **Load Tests** - k6 for performance validation
- **Test Data** - Faker.js generators

**Coverage:**
```
src/components/     ████████████ 95%
src/lib/            ████████████ 92%
src/api/            ███████████░ 88%
src/hooks/          ████████████ 94%
────────────────────────────────────
Total               ███████████░ 91%
```

**Testing Commands:**
```bash
npm run test:unit        # Run unit tests
npm run test:integration # API + DB tests
npm run test:e2e        # End-to-end tests
npm run test:load       # Load testing with k6
npm run test:all        # Everything
```

**Time to Setup:** 1-2 hours
**Time Saved:** Catch bugs before users do

[View Testing Framework →](./testing-framework/README.md)

---

### 4. Launch Checklists (`launch-checklists/`)

Battle-tested checklists for successful product launches.

**Includes:**
- **Pre-Launch Checklist** - 200+ items to verify before launch
- **Launch Day Protocol** - Hour-by-hour playbook
- **Post-Launch Monitoring** - Week 1 monitoring guide
- **Rollback Procedures** - Emergency procedures

**Launch Timeline:**
```
Week -2: Pre-Launch Preparation
├─ Technical infrastructure
├─ Security audit
├─ Performance optimization
└─ Team preparation

Week -1: Final Testing
├─ QA testing
├─ Load testing
├─ Content review
└─ Dry run deployment

Day 0: LAUNCH! 🚀
├─ Execute protocol
├─ Active monitoring
├─ User engagement
└─ Rapid response

Week 1: Monitor & Optimize
├─ Daily metrics review
├─ User feedback
├─ Performance tuning
└─ Weekly retrospective
```

**Launch Readiness Score:**
- 90-100%: Ready to launch! 🚀
- 80-89%: Launch in 1-2 days
- 70-79%: Launch next week
- < 70%: Keep building

[View Launch Checklists →](./launch-checklists/README.md)

---

## Quick Start Guide

### For a Brand New Project

**1. Choose Your Stack**
```bash
# Next.js on Vercel
cd your-nextjs-app
cp ci-cd-templates/github-actions-nextjs.yml .github/workflows/deploy.yml
cp deploy-scripts/vercel-deploy.sh ./
chmod +x vercel-deploy.sh

# React Native on Expo
cd your-mobile-app
cp ci-cd-templates/github-actions-react-native.yml .github/workflows/mobile.yml

# Python API on AWS
cd your-api
cp ci-cd-templates/github-actions-python-api.yml .github/workflows/api.yml
```

**2. Set Up Testing**
```bash
# Copy test configs
cp testing-framework/jest.config.js ./
cp testing-framework/jest.setup.js ./
cp testing-framework/playwright.config.ts ./

# Install dependencies
npm install -D jest @testing-library/react @playwright/test

# Run tests
npm run test
```

**3. Configure Deployment**
```bash
# Install platform CLI
npm i -g vercel  # or railway, flyctl, etc.

# Login and link project
vercel login
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
```

**4. Deploy!**
```bash
# Deploy to preview
./vercel-deploy.sh preview

# Deploy to production
./vercel-deploy.sh production
```

**Total Time:** 1-2 hours for complete setup

---

### For an Existing Project

**1. Add CI/CD**
```bash
# Copy workflow for your stack
cp ci-cd-templates/github-actions-nextjs.yml .github/workflows/deploy.yml

# Configure GitHub secrets
# Go to Settings > Secrets > Add:
# - VERCEL_TOKEN
# - VERCEL_PROJECT_ID
# - VERCEL_ORG_ID
# - DATABASE_URL
# - etc.
```

**2. Add Tests**
```bash
# Copy test framework
cp -r testing-framework/example-tests/ ./tests/

# Update package.json
{
  "scripts": {
    "test:unit": "jest",
    "test:e2e": "playwright test"
  }
}

# Run tests in CI
npm run test:unit
```

**3. Improve Deployment**
```bash
# Add deployment script
cp deploy-scripts/vercel-deploy.sh ./
chmod +x vercel-deploy.sh

# Use for deployments
./vercel-deploy.sh production
```

**Total Time:** 30-60 minutes

---

## Deployment Strategies

### 1. Continuous Deployment (Recommended)

**What:** Automatically deploy on every push to main

**Setup:**
```yaml
# In .github/workflows/deploy.yml
on:
  push:
    branches: [main]
```

**Benefits:**
- Ship features faster
- Smaller, safer deploys
- Always deployable main branch

**Best For:** Mature teams, good test coverage

### 2. Manual Deployment with Automation

**What:** Run deployment script when ready

**Setup:**
```bash
# When ready to deploy
./vercel-deploy.sh production
```

**Benefits:**
- Full control over timing
- Can batch features
- Deploy during low-traffic

**Best For:** Solo founders, early stage

### 3. Staged Deployment

**What:** Deploy to preview → staging → production

**Setup:**
```bash
# 1. Deploy to preview
git push origin feature-branch
# Auto-deploys preview

# 2. Merge to staging
git checkout staging
git merge feature-branch
git push
# Auto-deploys staging

# 3. Test, then production
git checkout main
git merge staging
git push
# Auto-deploys production
```

**Benefits:**
- Catch issues before production
- Full testing at each stage
- Gradual rollout

**Best For:** Teams, critical applications

---

## Platform Comparison

| Platform | Best For | Pros | Cons | Cost |
|----------|----------|------|------|------|
| **Vercel** | Next.js apps | Zero config, great DX | Vendor lock-in | $20/mo |
| **Railway** | Full-stack apps | Simple, fair pricing | Newer platform | $20-50/mo |
| **Fly.io** | Global apps | Edge network, flexible | More complex | $5-20/mo |
| **AWS ECS** | Large scale | Full control, enterprise | Steep learning curve | Varies |
| **Supabase** | Backend services | Complete backend | Postgres only | $25/mo |

**Recommendation for Solo Founders:**
- **Web App:** Vercel (Next.js)
- **Mobile App:** Expo EAS
- **API:** Railway or Fly.io
- **Database:** Supabase
- **Total Cost:** ~$50-100/mo

---

## Deployment Checklist

Before deploying to production:

### Technical
- [ ] All tests passing
- [ ] TypeScript has no errors
- [ ] Linting passes
- [ ] Build succeeds locally
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Monitoring configured

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Secrets in env vars (not code)
- [ ] Dependencies updated
- [ ] npm audit passed
- [ ] Authentication tested
- [ ] Rate limiting enabled

### Performance
- [ ] Lighthouse score > 90
- [ ] Page load < 2s
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN enabled
- [ ] Bundle size optimized

### Business
- [ ] Terms of Service ready
- [ ] Privacy Policy ready
- [ ] Payment processing tested
- [ ] Email delivery verified
- [ ] Support system ready
- [ ] Analytics configured

**Use:** [Full Pre-Launch Checklist](./launch-checklists/pre-launch-checklist.md)

---

## Common Workflows

### Daily Development

```bash
# 1. Create feature branch
git checkout -b feature/new-thing

# 2. Make changes
# ... code code code ...

# 3. Run tests
npm run test

# 4. Commit and push
git add .
git commit -m "Add new thing"
git push origin feature/new-thing

# 5. Open PR → Auto-deploy preview
# 6. Review preview URL
# 7. Merge → Auto-deploy production
```

### Weekly Deployment

```bash
# Monday: Plan week
# Tuesday-Thursday: Build features
# Friday: Deploy

# Friday afternoon:
npm run test:all
./vercel-deploy.sh staging

# Test staging thoroughly
# If good:
git checkout main
git merge staging
git push

# Auto-deploys to production
```

### Emergency Hotfix

```bash
# 1. Identify issue
# 2. Create hotfix branch
git checkout -b hotfix/critical-bug

# 3. Fix and test
npm run test

# 4. Deploy immediately
git checkout main
git merge hotfix/critical-bug
git push

# Auto-deploys in 2-3 minutes

# Or rollback:
./vercel-deploy.sh rollback
```

---

## Monitoring & Observability

### Essential Metrics to Track

**Application:**
- Error rate (target: < 0.5%)
- Response time (target: < 500ms)
- Uptime (target: 99.9%)
- Page load time (target: < 2s)

**Business:**
- Daily active users
- Signup conversion rate
- Trial-to-paid conversion
- Churn rate
- MRR/ARR growth

**Infrastructure:**
- Server CPU/memory usage
- Database query performance
- CDN hit rate
- API rate limits

### Recommended Tools

**Free Tier:**
- Error Tracking: Sentry
- Analytics: Google Analytics + PostHog
- Uptime: UptimeRobot
- Performance: Vercel Analytics

**Paid ($50-100/mo):**
- Error Tracking: Sentry Pro
- APM: Datadog or New Relic
- Uptime: Pingdom
- Logs: Better Stack

---

## Cost Breakdown

### Minimal Setup ($50/mo)
- Vercel Pro: $20/mo
- Supabase Pro: $25/mo
- Sentry (free tier): $0
- Uptime monitoring: $0
- **Total: $45/mo**

### Recommended Setup ($150/mo)
- Vercel Pro: $20/mo
- Railway/Fly: $20/mo
- Supabase Pro: $25/mo
- Expo EAS: $99/mo (if mobile)
- Monitoring: $10/mo
- **Total: $174/mo**

### Growth Setup ($500/mo)
- Hosting: $100/mo
- Database: $75/mo
- Monitoring: $100/mo
- Mobile: $99/mo
- Email/services: $50/mo
- CDN/assets: $75/mo
- **Total: $499/mo**

**ROI:** Time saved vs. managing your own infrastructure: **Priceless**

---

## Best Practices

### 1. Deploy Often
- Small, frequent deploys > large, rare deploys
- Easier to debug
- Lower risk
- Faster iteration

### 2. Monitor Everything
- Set up monitoring before launch
- Alert on critical metrics
- Review metrics daily
- Act on trends

### 3. Automate Testing
- Write tests as you code
- Run tests in CI
- Block merges on test failures
- Maintain >70% coverage

### 4. Document Everything
- Update READMEs
- Document deployment process
- Keep runbooks current
- Share learnings

### 5. Plan for Failures
- Know how to rollback
- Practice rollback procedure
- Have status page ready
- Communicate proactively

---

## Troubleshooting

### Deployment Fails

**Check:**
1. Build logs for errors
2. Environment variables set correctly
3. Database migrations ran
4. Tests passing locally

**Fix:**
```bash
# Test locally first
npm run build
npm run test

# Check env vars
vercel env ls

# Redeploy
./vercel-deploy.sh production
```

### Tests Failing in CI

**Check:**
1. Node version matches locally
2. Dependencies installed correctly
3. Environment variables for tests set
4. Database available for tests

**Fix:**
```bash
# Run tests locally
npm run test

# Update CI Node version
# In .github/workflows/deploy.yml:
node-version: '20'  # Match your local version
```

### Performance Issues

**Check:**
1. Lighthouse scores
2. Bundle size
3. Database query performance
4. CDN configuration

**Fix:**
```bash
# Analyze bundle
npm run build
npm run analyze

# Optimize images
npm install next-optimized-images

# Add caching
# Update next.config.js
```

---

## Migration Guides

### From Manual Deployment

**Before:** SSH into server, git pull, restart

**After:** Git push → auto-deploy

**Migration Steps:**
1. Set up CI/CD workflow (30 min)
2. Configure platform (Vercel/Railway) (20 min)
3. Test with preview deployment (10 min)
4. Switch DNS to new platform (5 min)
5. Decommission old server (10 min)

**Time:** 1-2 hours
**Benefit:** Save 30+ min per deploy forever

### From Another Platform

**Moving from Heroku:**
```bash
# 1. Export database
heroku pg:backups:capture
heroku pg:backups:download

# 2. Set up new platform
./railway-deploy.sh init

# 3. Import database
railway run -- psql < latest.dump

# 4. Deploy app
./railway-deploy.sh deploy

# 5. Switch DNS
# 6. Decommission Heroku
```

---

## Learning Resources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Fly.io Docs](https://fly.io/docs)
- [GitHub Actions](https://docs.github.com/actions)

### Video Tutorials
- [Deploying Next.js to Vercel](https://www.youtube.com/vercel)
- [Railway Full Tutorial](https://www.youtube.com/railway)
- [GitHub Actions CI/CD](https://www.youtube.com/github)

### Communities
- [Vercel Discord](https://vercel.com/discord)
- [Railway Discord](https://discord.gg/railway)
- [DevOps Subreddit](https://reddit.com/r/devops)

---

## Support

**Issues with scripts?**
- Check README in each directory
- Review example configurations
- Test in staging first

**Platform-specific help:**
- Vercel: support.vercel.com
- Railway: help.railway.app
- Fly.io: community.fly.io

**General deployment help:**
- Discord community
- GitHub issues
- Twitter @HermeticSaaS

---

## What's Next?

After setting up deployment:

1. **Launch Your App** ✅
   - Use launch checklists
   - Follow launch day protocol
   - Monitor closely

2. **Marketing (05-market/)** →
   - Drive traffic to your app
   - Convert visitors to users
   - Build audience

3. **Sales (06-sell/)** →
   - Convert trials to paid
   - Upsell customers
   - Reduce churn

4. **Maintain (07-maintain/)** →
   - Keep app running smoothly
   - Fix bugs quickly
   - Ship new features

---

## Quick Reference

**Need to deploy right now?**
```bash
./vercel-deploy.sh production
```

**Deployment failing?**
- Check [Rollback Procedures](./launch-checklists/rollback-procedures.md)

**Launching soon?**
- Review [Pre-Launch Checklist](./launch-checklists/pre-launch-checklist.md)

**Launched today?**
- Follow [Launch Day Protocol](./launch-checklists/launch-day-protocol.md)

---

**HermeticSaaS Principle**: Deployment should be boring. The excitement should come from building great features and delighting users, not from wrestling with infrastructure.

**Make it boring. Make it automatic. Make it reliable.**

🚀 Happy shipping!
