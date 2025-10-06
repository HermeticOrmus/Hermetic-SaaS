#!/bin/bash

# Vercel One-Click Deployment Script for HermeticSaaS
# Usage: ./vercel-deploy.sh [production|staging|preview]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-preview}
PROJECT_DIR=$(pwd)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HermeticSaaS Vercel Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel@latest
    print_success "Vercel CLI installed"
fi

# Check if git is clean (for production)
if [[ "$ENVIRONMENT" == "production" ]]; then
    if [[ -n $(git status -s) ]]; then
        print_error "Git working directory is not clean. Commit or stash changes before deploying to production."
        exit 1
    fi
    print_success "Git working directory is clean"
fi

# Run pre-deployment checks
print_info "Running pre-deployment checks..."

# Check Node version
NODE_VERSION=$(node -v)
print_info "Node version: $NODE_VERSION"

# Check for required files
REQUIRED_FILES=("package.json" "next.config.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done
print_success "All required files present"

# Install dependencies
print_info "Installing dependencies..."
npm ci
print_success "Dependencies installed"

# Run TypeScript type checking
print_info "Running TypeScript type check..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Run linting
print_info "Running linter..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting had warnings (continuing anyway)"
fi

# Run tests
print_info "Running tests..."
if npm run test:unit; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Build locally to check for errors
print_info "Running local build test..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed"
    exit 1
fi

# Check environment variables
print_info "Checking environment variables..."
ENV_FILE=""
case "$ENVIRONMENT" in
    production)
        ENV_FILE=".env.production"
        ;;
    staging)
        ENV_FILE=".env.staging"
        ;;
    preview)
        ENV_FILE=".env.local"
        ;;
esac

if [[ -f "$ENV_FILE" ]]; then
    print_success "Environment file found: $ENV_FILE"
else
    print_warning "Environment file not found: $ENV_FILE"
fi

# Deploy to Vercel
echo ""
print_info "Deploying to Vercel ($ENVIRONMENT)..."
echo ""

DEPLOY_FLAGS=""
case "$ENVIRONMENT" in
    production)
        DEPLOY_FLAGS="--prod"
        print_warning "You are deploying to PRODUCTION. This will be live for all users."
        read -p "Continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_info "Deployment cancelled"
            exit 0
        fi
        ;;
    staging)
        DEPLOY_FLAGS="--target=preview --name=staging"
        ;;
    preview)
        DEPLOY_FLAGS=""
        ;;
esac

# Execute deployment
DEPLOYMENT_URL=$(vercel deploy $DEPLOY_FLAGS --yes 2>&1 | tee /dev/tty | grep -o 'https://[^ ]*' | tail -1)

if [[ -z "$DEPLOYMENT_URL" ]]; then
    print_error "Deployment failed - no URL returned"
    exit 1
fi

print_success "Deployment successful!"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}URL:${NC} $DEPLOYMENT_URL"
echo ""

# Run post-deployment checks
print_info "Running post-deployment smoke tests..."

# Wait for deployment to be ready
sleep 10

# Health check
print_info "Checking deployment health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")

if [[ "$HTTP_STATUS" == "200" ]]; then
    print_success "Health check passed (HTTP $HTTP_STATUS)"
else
    print_error "Health check failed (HTTP $HTTP_STATUS)"
    exit 1
fi

# Check critical pages
CRITICAL_PAGES=("/" "/api/health")
for page in "${CRITICAL_PAGES[@]}"; do
    print_info "Checking: $page"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}${page}")
    if [[ "$STATUS" == "200" ]]; then
        print_success "$page - OK"
    else
        print_warning "$page - HTTP $STATUS"
    fi
done

# Performance check
print_info "Checking page load time..."
START_TIME=$(date +%s%N)
curl -s "$DEPLOYMENT_URL" > /dev/null
END_TIME=$(date +%s%N)
LOAD_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [[ $LOAD_TIME -lt 1000 ]]; then
    print_success "Page load time: ${LOAD_TIME}ms (excellent)"
elif [[ $LOAD_TIME -lt 3000 ]]; then
    print_success "Page load time: ${LOAD_TIME}ms (good)"
else
    print_warning "Page load time: ${LOAD_TIME}ms (slow)"
fi

# Open in browser
print_info "Opening deployment in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$DEPLOYMENT_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$DEPLOYMENT_URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start "$DEPLOYMENT_URL"
fi

# Save deployment info
DEPLOY_LOG="deployments.log"
echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") | $ENVIRONMENT | $DEPLOYMENT_URL | $(git rev-parse --short HEAD)" >> "$DEPLOY_LOG"

echo ""
print_success "Deployment information saved to $DEPLOY_LOG"
echo ""

# Show next steps
echo -e "${YELLOW}Next Steps:${NC}"
if [[ "$ENVIRONMENT" == "preview" ]]; then
    echo "1. Test the preview deployment thoroughly"
    echo "2. Deploy to staging: ./vercel-deploy.sh staging"
    echo "3. After staging validation, deploy to production"
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    echo "1. Run full QA on staging environment"
    echo "2. Verify all integrations work correctly"
    echo "3. Deploy to production: ./vercel-deploy.sh production"
elif [[ "$ENVIRONMENT" == "production" ]]; then
    echo "1. Monitor error rates in your analytics"
    echo "2. Check performance metrics"
    echo "3. Verify critical user flows work"
    echo "4. Monitor Slack/email for error notifications"
fi

echo ""
echo -e "${GREEN}🚀 Happy shipping!${NC}"
