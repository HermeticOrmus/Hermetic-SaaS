#!/bin/bash

# Fly.io Global Deployment Script for HermeticSaaS
# Deploys apps globally with automatic scaling
# Usage: ./flyio-deploy.sh [init|deploy|scale|regions|logs]

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
echo -e "${BLUE}  HermeticSaaS Fly.io Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Fly CLI
if ! command -v flyctl &> /dev/null; then
    print_error "Fly CLI not found. Installing..."
    curl -L https://fly.io/install.sh | sh
    print_success "Fly CLI installed"
    print_warning "Please add Fly to your PATH and restart your terminal"
    exit 1
fi

# Initialize Fly app
init_fly() {
    print_info "Initializing Fly.io application..."

    # Login
    if flyctl auth login; then
        print_success "Logged into Fly.io"
    else
        print_error "Fly.io login failed"
        exit 1
    fi

    # Launch app
    print_info "Creating Fly app..."
    flyctl launch --no-deploy

    # Create fly.toml if it doesn't exist
    if [[ ! -f "fly.toml" ]]; then
        cat > fly.toml <<'EOF'
app = "your-app-name"
primary_region = "iad"

[build]
  [build.args]
    NODE_VERSION = "20"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

  [http_service.concurrency]
    type = "connections"
    hard_limit = 250
    soft_limit = 200

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[[services]]
  protocol = "tcp"
  internal_port = 8080
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 250
    soft_limit = 200

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "5s"
    restart_limit = 0

  [[services.http_checks]]
    interval = "10s"
    grace_period = "5s"
    method = "get"
    path = "/api/health"
    protocol = "http"
    timeout = "2s"
    tls_skip_verify = false
    headers = {}

[metrics]
  port = 9091
  path = "/metrics"

[[statics]]
  guest_path = "/app/public"
  url_prefix = "/static/"
EOF
        print_success "fly.toml created"
    fi

    # Create Dockerfile if it doesn't exist
    if [[ ! -f "Dockerfile" ]]; then
        cat > Dockerfile <<'EOF'
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF
        print_success "Dockerfile created"
    fi

    # Create .dockerignore
    cat > .dockerignore <<'EOF'
node_modules
npm-debug.log
.next
.git
.env.local
.env.*.local
*.md
.github
.vscode
EOF

    print_success "Fly.io app initialized!"
    echo ""
    print_info "Next steps:"
    echo "1. Review fly.toml configuration"
    echo "2. Set secrets: flyctl secrets set KEY=value"
    echo "3. Deploy: ./flyio-deploy.sh deploy"
}

# Deploy to Fly.io
deploy_fly() {
    print_info "Deploying to Fly.io..."

    # Pre-deployment checks
    if [[ ! -f "fly.toml" ]]; then
        print_error "fly.toml not found. Run: ./flyio-deploy.sh init"
        exit 1
    fi

    # Run tests
    if [[ -f "package.json" ]] && grep -q "\"test\"" package.json; then
        print_info "Running tests..."
        if npm test; then
            print_success "Tests passed"
        else
            print_warning "Tests failed - continuing anyway"
        fi
    fi

    # Deploy
    print_info "Deploying application..."
    if flyctl deploy --ha=false; then
        print_success "Deployment successful!"
    else
        print_error "Deployment failed"
        exit 1
    fi

    # Get app info
    APP_NAME=$(grep "^app" fly.toml | cut -d'"' -f2)
    APP_URL="https://${APP_NAME}.fly.dev"

    echo ""
    print_success "Application deployed!"
    echo -e "${GREEN}URL: $APP_URL${NC}"
    echo ""

    # Health check
    print_info "Running health check..."
    sleep 10

    if curl -f -s "${APP_URL}/api/health" > /dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed - check logs"
    fi

    # Show status
    flyctl status
}

# Scale application
scale_fly() {
    print_info "Scaling Fly.io application..."

    echo "Current scaling:"
    flyctl scale show

    echo ""
    echo "Scale options:"
    echo "1. Scale VM size"
    echo "2. Scale machine count"
    echo "3. Scale by region"
    echo "4. Auto-scaling config"

    read -p "Choose option (1-4): " OPTION

    case "$OPTION" in
        1)
            read -p "Enter VM size (shared-cpu-1x, dedicated-cpu-1x, etc): " VM_SIZE
            flyctl scale vm "$VM_SIZE"
            ;;
        2)
            read -p "Enter machine count: " COUNT
            flyctl scale count "$COUNT"
            ;;
        3)
            read -p "Enter region (e.g., iad): " REGION
            read -p "Enter count: " COUNT
            flyctl scale count "$COUNT" --region "$REGION"
            ;;
        4)
            print_info "Configuring auto-scaling..."
            read -p "Minimum machines: " MIN
            read -p "Maximum machines: " MAX

            # Update fly.toml
            sed -i "s/min_machines_running = .*/min_machines_running = $MIN/" fly.toml
            # Note: max requires paid plan
            print_warning "Max machines requires Fly.io paid plan"
            ;;
    esac

    print_success "Scaling updated"
}

# Manage regions
manage_regions() {
    print_info "Managing Fly.io regions..."

    echo "Available regions:"
    flyctl platform regions

    echo ""
    echo "Current regions:"
    flyctl regions list

    echo ""
    echo "1. Add region"
    echo "2. Remove region"
    echo "3. Set backup region"

    read -p "Choose option (1-3): " OPTION

    case "$OPTION" in
        1)
            read -p "Enter region code (e.g., syd, fra): " REGION
            flyctl regions add "$REGION"
            print_success "Region $REGION added"
            ;;
        2)
            read -p "Enter region code to remove: " REGION
            flyctl regions remove "$REGION"
            print_success "Region $REGION removed"
            ;;
        3)
            read -p "Enter backup region code: " REGION
            flyctl regions set "$REGION" --backup
            print_success "Backup region set to $REGION"
            ;;
    esac
}

# View logs
view_logs() {
    print_info "Viewing Fly.io logs..."
    flyctl logs
}

# Set secrets
set_secrets() {
    print_info "Setting secrets..."

    if [[ -f ".env.production" ]]; then
        print_info "Loading from .env.production..."

        while IFS='=' read -r key value; do
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z $key ]] && continue

            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')

            print_info "Setting: $key"
            flyctl secrets set "$key=$value"
        done < ".env.production"

        print_success "Secrets set from .env.production"
    else
        print_warning ".env.production not found"
        echo "Set secrets manually:"
        echo "flyctl secrets set KEY=value"
    fi
}

# Database setup
setup_database() {
    print_info "Setting up Postgres database..."

    read -p "Enter database name: " DB_NAME

    # Create Postgres cluster
    if flyctl postgres create --name "$DB_NAME" --region iad; then
        print_success "Postgres created"

        # Attach to app
        flyctl postgres attach "$DB_NAME"
        print_success "Database attached to app"
    else
        print_error "Database creation failed"
        exit 1
    fi
}

# Redis setup
setup_redis() {
    print_info "Setting up Redis..."

    read -p "Enter Redis name: " REDIS_NAME

    # Create Upstash Redis
    if flyctl redis create --name "$REDIS_NAME" --region iad; then
        print_success "Redis created"

        # Get connection string
        flyctl redis status "$REDIS_NAME"
    else
        print_error "Redis creation failed"
        exit 1
    fi
}

# Main command router
case "$COMMAND" in
    init)
        init_fly
        ;;
    deploy)
        deploy_fly
        ;;
    scale)
        scale_fly
        ;;
    regions)
        manage_regions
        ;;
    logs)
        view_logs
        ;;
    secrets)
        set_secrets
        ;;
    database)
        setup_database
        ;;
    redis)
        setup_redis
        ;;
    *)
        echo "Usage: $0 {init|deploy|scale|regions|logs|secrets|database|redis}"
        echo ""
        echo "Commands:"
        echo "  init     - Initialize new Fly.io app"
        echo "  deploy   - Deploy application"
        echo "  scale    - Scale application"
        echo "  regions  - Manage deployment regions"
        echo "  logs     - View application logs"
        echo "  secrets  - Set environment secrets"
        echo "  database - Set up Postgres database"
        echo "  redis    - Set up Redis"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
