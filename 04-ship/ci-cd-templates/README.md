# CI/CD Templates for HermeticSaaS

Production-ready CI/CD workflows that automate testing, building, and deployment for all your SaaS applications.

## Overview

These templates provide complete CI/CD pipelines for:
- **Next.js Applications** - Web apps deployed to Vercel
- **React Native Apps** - Mobile apps via Expo EAS
- **Python APIs** - FastAPI/Django on AWS ECS
- **Full-Stack Apps** - Multi-tier deployments

## Quick Start

### 1. Next.js + Vercel Setup

```bash
# Copy workflow to your project
cp github-actions-nextjs.yml your-project/.github/workflows/deploy.yml

# Copy Vercel config
cp vercel-config.json your-project/vercel.json

# Set required secrets in GitHub
# Settings > Secrets and variables > Actions > New repository secret
```

**Required GitHub Secrets:**
```
VERCEL_TOKEN              # Get from vercel.com/account/tokens
VERCEL_ORG_ID            # From .vercel/project.json
VERCEL_PROJECT_ID        # From .vercel/project.json
TEST_DATABASE_URL        # PostgreSQL test database
TEST_SUPABASE_URL        # Supabase project URL
TEST_SUPABASE_ANON_KEY   # Supabase anon key
SLACK_WEBHOOK_URL        # Optional: Slack notifications
```

**Setup Steps:**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link your project
vercel link

# 3. Get project details
cat .vercel/project.json

# 4. Add package.json scripts
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "test:unit": "jest",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:smoke": "playwright test smoke/",
    "db:migrate": "npx prisma migrate deploy",
    "db:backup": "npx prisma db pull",
    "db:verify": "npx prisma validate"
  }
}
```

### 2. React Native + Expo Setup

```bash
# Copy workflow
cp github-actions-react-native.yml your-app/.github/workflows/mobile-deploy.yml

# Initialize EAS
cd your-app
npm install -g eas-cli
eas login
eas build:configure
```

**Required GitHub Secrets:**
```
EXPO_TOKEN                           # From expo.dev/accounts/[account]/settings/access-tokens
EXPO_APPLE_APP_SPECIFIC_PASSWORD    # From appleid.apple.com
GOOGLE_SERVICE_ACCOUNT_KEY          # From Google Play Console
```

**EAS Build Profiles (eas.json):**
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "staging": {
      "distribution": "internal",
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABC123"
      }
    }
  }
}
```

### 3. Python API + AWS ECS Setup

```bash
# Copy workflow
cp github-actions-python-api.yml your-api/.github/workflows/deploy-api.yml

# Create Dockerfile
```

**Required GitHub Secrets:**
```
AWS_ACCESS_KEY_ID         # IAM user with ECS permissions
AWS_SECRET_ACCESS_KEY     # IAM secret key
ECR_REGISTRY             # 123456789.dkr.ecr.us-east-1.amazonaws.com
ECR_REPOSITORY           # your-api-repo
SUBNET_IDS               # subnet-xxx,subnet-yyy
SECURITY_GROUP_ID        # sg-xxxxx
DATABASE_URL             # PostgreSQL connection string
REDIS_URL                # Redis connection string
```

**Dockerfile Example:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

## Workflow Features

### Next.js Workflow
- **Multi-stage testing**: TypeScript, lint, unit, integration, E2E
- **Preview deployments**: Automatic preview for every PR
- **Environment promotion**: develop → staging → production
- **Database migrations**: Automated with rollback capability
- **Performance monitoring**: Lighthouse CI on every deployment
- **Security scanning**: npm audit + dependency checks
- **Zero-downtime deploys**: Vercel handles rollout

### React Native Workflow
- **Multi-platform builds**: iOS and Android in parallel
- **Staged releases**: Internal → TestFlight/Play Internal → Production
- **OTA updates**: Instant updates via Expo Updates
- **Version management**: Automatic version bumping
- **Code signing**: Automated via EAS
- **Store submission**: Automated TestFlight + Play Store uploads

### Python API Workflow
- **Comprehensive testing**: pytest with coverage reporting
- **Static analysis**: mypy, flake8, bandit security scanning
- **Docker builds**: Multi-stage builds with caching
- **Blue-green deployment**: Zero-downtime ECS deployments
- **Database backups**: Automatic RDS snapshots before migration
- **Load testing**: k6 performance validation
- **Auto-rollback**: Automatic rollback on health check failure

## Environment Management

### Branch Strategy
```
develop  → Preview deployments (PRs)
staging  → Staging environment (internal testing)
main     → Production (live users)
```

### Environment Variables

**Vercel Environment Setup:**
```bash
# Production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production

# Staging
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add DATABASE_URL preview

# Development
vercel env add NEXT_PUBLIC_APP_URL development
```

**GitHub Environments:**
```yaml
Settings > Environments > New environment

Environment: production
- Required reviewers: 1
- Wait timer: 0 minutes
- Deployment branches: main only

Environment: staging
- Required reviewers: 0
- Deployment branches: staging only
```

## Deployment Strategies

### 1. Feature Deployment (Preview)
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Creates PR → Triggers preview deployment
# Preview URL posted to PR comments
```

### 2. Staging Deployment
```bash
git checkout staging
git merge feature/new-feature
git push origin staging
# Deploys to staging environment
# Run manual tests
```

### 3. Production Deployment
```bash
git checkout main
git merge staging
git push origin main
# Triggers full production pipeline
# Runs all tests + smoke tests
# Deploys with zero downtime
```

## Monitoring & Notifications

### Slack Integration
```yaml
# Add to workflow
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment ${{ job.status }}",
        "blocks": [...]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**Create Slack Webhook:**
1. Go to api.slack.com/apps
2. Create new app
3. Enable Incoming Webhooks
4. Create webhook for channel
5. Add URL to GitHub secrets

### Performance Monitoring

**Lighthouse CI Setup:**
```bash
npm install -g @lhci/cli

# Create lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:seo': ['error', {minScore: 0.9}]
      }
    }
  }
};
```

## Security Best Practices

### Secret Management
```bash
# Never commit secrets
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use GitHub encrypted secrets
# Rotate secrets every 90 days
# Use different secrets per environment
```

### Dependency Scanning
```yaml
# Automated in workflows
npm audit --audit-level=high
bandit -r app/  # Python
trivy image your-image:tag  # Docker
```

### Access Control
```bash
# AWS IAM policies - least privilege
# Vercel team members only
# GitHub branch protection rules
# Environment-specific secrets
```

## Troubleshooting

### Common Issues

**1. Vercel Build Fails**
```bash
# Check build logs
vercel logs your-deployment-url

# Test locally
vercel build

# Common fixes:
- Clear build cache: vercel --force
- Check environment variables
- Verify Node version matches
```

**2. ECS Deployment Stuck**
```bash
# Check service events
aws ecs describe-services --cluster prod --services api

# Check task logs
aws logs tail /ecs/api-prod --follow

# Common fixes:
- Health check failing
- Security group blocking traffic
- Out of memory (increase task memory)
```

**3. Mobile Build Fails**
```bash
# Check EAS build logs
eas build:list

# View specific build
eas build:view [build-id]

# Common fixes:
- Update native dependencies
- Check Apple certificates
- Verify Android keystore
```

### Debug Mode

**Enable verbose logging:**
```yaml
# In workflow file
- name: Deploy
  run: vercel deploy --debug
  # or
  run: eas build --platform ios --profile production --non-interactive --verbose
```

## Cost Optimization

### Vercel
- Free tier: $0/month (hobby projects)
- Pro: $20/month (1 team member, unlimited sites)
- Tips: Use ISR instead of SSR, optimize images

### AWS ECS
- Fargate pricing: $0.04/vCPU/hour + $0.004/GB/hour
- Tips: Right-size tasks, use spot instances for staging
- Expected cost: ~$50-200/month per service

### Expo EAS
- Free tier: Limited builds
- Production: $99/month (unlimited builds)
- Tips: Use preview builds for testing, production for releases

## Next Steps

1. **Copy templates to your projects**
2. **Configure secrets in GitHub**
3. **Test with preview deployment**
4. **Deploy to staging**
5. **Monitor and iterate**

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Expo EAS**: https://docs.expo.dev/eas/
- **AWS ECS**: https://docs.aws.amazon.com/ecs/
- **GitHub Actions**: https://docs.github.com/actions

---

**HermeticSaaS Principle**: Deployment should be boring, predictable, and automatic. These templates ensure every deployment is reliable and stress-free.
