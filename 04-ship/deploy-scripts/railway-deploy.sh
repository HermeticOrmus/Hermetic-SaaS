#!/bin/bash

# Railway One-Click Deployment Script for HermeticSaaS
# Supports full-stack apps with database, backend, and frontend
# Usage: ./railway-deploy.sh [init|deploy|logs|rollback]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMMAND=${1:-deploy}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HermeticSaaS Railway Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Installing..."
    npm install -g @railway/cli
    print_success "Railway CLI installed"
fi

# Function to initialize Railway project
init_railway() {
    print_info "Initializing Railway project..."

    if railway login; then
        print_success "Logged into Railway"
    else
        print_error "Railway login failed"
        exit 1
    fi

    # Create new project
    print_info "Creating Railway project..."
    railway init

    # Add PostgreSQL database
    print_info "Adding PostgreSQL database..."
    railway add --database postgres

    # Add Redis (optional)
    read -p "Add Redis? (y/n): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway add --database redis
        print_success "Redis added"
    fi

    # Set environment variables
    print_info "Setting up environment variables..."

    # Read from .env.production
    if [[ -f ".env.production" ]]; then
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z $key ]] && continue

            # Remove quotes from value
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')

            # Set variable in Railway
            railway variables --set "$key=$value"
        done < ".env.production"
        print_success "Environment variables loaded"
    else
        print_warning ".env.production not found, skipping env vars"
    fi

    # Create railway.json config
    cat > railway.json <<EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
    print_success "railway.json created"

    # Create Procfile
    cat > Procfile <<EOF
web: npm start
worker: npm run worker
release: npm run db:migrate
EOF
    print_success "Procfile created"

    print_success "Railway project initialized!"
    echo ""
    print_info "Next steps:"
    echo "1. Review railway.json and Procfile"
    echo "2. Run: ./railway-deploy.sh deploy"
    echo "3. Set custom domain in Railway dashboard"
}

# Function to deploy
deploy_railway() {
    print_info "Deploying to Railway..."

    # Pre-deployment checks
    print_info "Running pre-deployment checks..."

    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        print_warning "You have uncommitted changes"
        read -p "Continue anyway? (y/n): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi

    # Run tests
    if [[ -f "package.json" ]] && grep -q "\"test\"" package.json; then
        print_info "Running tests..."
        if npm test; then
            print_success "Tests passed"
        else
            print_error "Tests failed"
            read -p "Deploy anyway? (y/n): " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi

    # Build check
    if [[ -f "package.json" ]] && grep -q "\"build\"" package.json; then
        print_info "Testing build..."
        if npm run build; then
            print_success "Build successful"
        else
            print_error "Build failed"
            exit 1
        fi
    fi

    # Database backup before migration
    print_info "Creating database backup..."
    railway run -- pg_dump \$DATABASE_URL > "backup-$(date +%Y%m%d-%H%M%S).sql" 2>/dev/null || print_warning "Backup failed (continuing)"

    # Deploy
    print_info "Deploying to Railway..."
    if railway up; then
        print_success "Deployment initiated"
    else
        print_error "Deployment failed"
        exit 1
    fi

    # Wait for deployment
    print_info "Waiting for deployment to complete..."
    sleep 30

    # Get deployment URL
    DEPLOYMENT_URL=$(railway domain)

    if [[ -n "$DEPLOYMENT_URL" ]]; then
        print_success "Deployment complete!"
        echo ""
        echo -e "${GREEN}URL: https://$DEPLOYMENT_URL${NC}"
        echo ""

        # Health check
        print_info "Running health check..."
        sleep 5

        if curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
            print_success "Health check passed"
        else
            print_warning "Health check failed - check logs"
        fi

        # Open in browser
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "https://$DEPLOYMENT_URL"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "https://$DEPLOYMENT_URL"
        fi
    else
        print_error "Could not get deployment URL"
    fi

    # Show logs
    print_info "Recent logs:"
    railway logs --lines 20
}

# Function to view logs
view_logs() {
    print_info "Viewing Railway logs..."
    railway logs --follow
}

# Function to rollback
rollback_railway() {
    print_warning "Rolling back to previous deployment..."

    railway status

    read -p "Enter deployment ID to rollback to: " DEPLOYMENT_ID

    if [[ -n "$DEPLOYMENT_ID" ]]; then
        railway rollback "$DEPLOYMENT_ID"
        print_success "Rollback complete"
    else
        print_error "No deployment ID provided"
        exit 1
    fi
}

# Function to run migrations
run_migrations() {
    print_info "Running database migrations..."

    # Backup first
    print_info "Creating backup..."
    railway run -- pg_dump \$DATABASE_URL > "migration-backup-$(date +%Y%m%d-%H%M%S).sql"

    # Run migrations
    if railway run npm run db:migrate; then
        print_success "Migrations completed"
    else
        print_error "Migrations failed"
        exit 1
    fi
}

# Function to open Railway dashboard
open_dashboard() {
    print_info "Opening Railway dashboard..."
    railway open
}

# Main command router
case "$COMMAND" in
    init)
        init_railway
        ;;
    deploy)
        deploy_railway
        ;;
    logs)
        view_logs
        ;;
    rollback)
        rollback_railway
        ;;
    migrate)
        run_migrations
        ;;
    dashboard)
        open_dashboard
        ;;
    *)
        echo "Usage: $0 {init|deploy|logs|rollback|migrate|dashboard}"
        echo ""
        echo "Commands:"
        echo "  init      - Initialize new Railway project"
        echo "  deploy    - Deploy application to Railway"
        echo "  logs      - View application logs"
        echo "  rollback  - Rollback to previous deployment"
        echo "  migrate   - Run database migrations"
        echo "  dashboard - Open Railway dashboard"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
