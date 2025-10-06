#!/bin/bash

# Supabase Complete Setup Script for HermeticSaaS
# Sets up database, auth, storage, and edge functions
# Usage: ./supabase-setup.sh [init|migrate|deploy|backup]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMMAND=${1:-init}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HermeticSaaS Supabase Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        brew install supabase/tap/supabase
    else
        print_error "Please install Supabase CLI manually: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    print_success "Supabase CLI installed"
fi

# Initialize Supabase project
init_supabase() {
    print_info "Initializing Supabase project..."

    # Login
    if supabase login; then
        print_success "Logged into Supabase"
    else
        print_error "Supabase login failed"
        exit 1
    fi

    # Initialize project
    supabase init

    # Create base schema
    mkdir -p supabase/migrations

    # Create initial migration
    cat > supabase/migrations/00000000000000_initial_schema.sql <<'EOF'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    billing_email TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create organizations table
CREATE TABLE public.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations FOR SELECT
    USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = id AND user_id = auth.uid()
        )
    );

-- Create organization members table
CREATE TABLE public.organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL,
    price_id TEXT,
    quantity INTEGER DEFAULT 1,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_or_org CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL) OR
        (user_id IS NULL AND organization_id IS NOT NULL)
    )
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EOF

    print_success "Initial migration created"

    # Create storage buckets setup
    cat > supabase/migrations/00000000000001_storage_setup.sql <<'EOF'
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('avatars', 'avatars', true),
    ('documents', 'documents', false),
    ('uploads', 'uploads', false);

-- Avatars policies
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Documents policies
CREATE POLICY "Users can view their own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload their own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Uploads policies
CREATE POLICY "Users can view their own uploads"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
EOF

    print_success "Storage setup migration created"

    # Create config.toml
    cat > supabase/config.toml <<'EOF'
[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[auth.external.google]
enabled = false
client_id = ""
secret = ""
redirect_uri = ""

[auth.external.github]
enabled = false
client_id = ""
secret = ""
redirect_uri = ""
EOF

    print_success "Supabase configuration created"

    # Create seed data
    cat > supabase/seed.sql <<'EOF'
-- Seed data for development
-- This file is run after migrations in local development

-- Insert test user (password: testpassword123)
-- You'll need to sign up through the UI or use the Supabase dashboard
EOF

    print_success "Seed file created"

    print_success "Supabase project initialized!"
    echo ""
    print_info "Next steps:"
    echo "1. Start local Supabase: supabase start"
    echo "2. View Studio: http://localhost:54323"
    echo "3. Link to remote project: supabase link --project-ref your-project-ref"
    echo "4. Deploy: ./supabase-setup.sh deploy"
}

# Deploy to production
deploy_supabase() {
    print_info "Deploying to Supabase..."

    # Check if linked
    if [[ ! -f ".git/supabase/config.toml" ]]; then
        print_warning "Not linked to a remote project"
        read -p "Enter your Supabase project ref: " PROJECT_REF

        if [[ -n "$PROJECT_REF" ]]; then
            supabase link --project-ref "$PROJECT_REF"
            print_success "Linked to project"
        else
            print_error "No project ref provided"
            exit 1
        fi
    fi

    # Run migrations
    print_info "Running migrations..."
    if supabase db push; then
        print_success "Migrations deployed"
    else
        print_error "Migration deployment failed"
        exit 1
    fi

    # Deploy Edge Functions
    if [[ -d "supabase/functions" ]]; then
        print_info "Deploying Edge Functions..."

        for func in supabase/functions/*/; do
            func_name=$(basename "$func")
            print_info "Deploying function: $func_name"

            if supabase functions deploy "$func_name"; then
                print_success "$func_name deployed"
            else
                print_warning "$func_name deployment failed"
            fi
        done
    fi

    print_success "Deployment complete!"
}

# Run migrations
run_migrations() {
    print_info "Running database migrations..."

    # Check environment
    read -p "Deploy to (local/production): " ENV

    if [[ "$ENV" == "production" ]]; then
        # Backup first
        print_info "Creating backup..."
        backup_database

        # Deploy migrations
        if supabase db push; then
            print_success "Migrations deployed to production"
        else
            print_error "Migration failed"
            exit 1
        fi
    else
        # Local migrations
        if supabase db reset; then
            print_success "Local database reset with migrations"
        else
            print_error "Local migration failed"
            exit 1
        fi
    fi
}

# Backup database
backup_database() {
    print_info "Creating database backup..."

    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"

    if supabase db dump -f "$BACKUP_FILE"; then
        print_success "Backup created: $BACKUP_FILE"
    else
        print_error "Backup failed"
        exit 1
    fi
}

# Generate types
generate_types() {
    print_info "Generating TypeScript types..."

    OUTPUT_FILE="types/supabase.ts"
    mkdir -p types

    if supabase gen types typescript --local > "$OUTPUT_FILE"; then
        print_success "Types generated: $OUTPUT_FILE"
    else
        print_error "Type generation failed"
        exit 1
    fi
}

# Start local development
start_local() {
    print_info "Starting local Supabase..."

    supabase start

    print_success "Supabase running locally!"
    echo ""
    print_info "Services:"
    echo "  Studio: http://localhost:54323"
    echo "  API: http://localhost:54321"
    echo "  DB: postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    print_info "To stop: supabase stop"
}

# Main command router
case "$COMMAND" in
    init)
        init_supabase
        ;;
    deploy)
        deploy_supabase
        ;;
    migrate)
        run_migrations
        ;;
    backup)
        backup_database
        ;;
    types)
        generate_types
        ;;
    start)
        start_local
        ;;
    *)
        echo "Usage: $0 {init|deploy|migrate|backup|types|start}"
        echo ""
        echo "Commands:"
        echo "  init    - Initialize new Supabase project"
        echo "  deploy  - Deploy migrations and functions to production"
        echo "  migrate - Run database migrations"
        echo "  backup  - Create database backup"
        echo "  types   - Generate TypeScript types"
        echo "  start   - Start local Supabase"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
