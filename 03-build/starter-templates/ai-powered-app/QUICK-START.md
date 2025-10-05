# Quick Start Guide - AI-Powered App

Get your AI-powered SaaS up and running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- OpenAI API key
- Basic knowledge of Next.js and TypeScript

## 15-Minute Setup

### Step 1: Get API Keys (5 min)

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize
4. Go to Settings → API
5. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API keys
4. Create new secret key
5. Copy → `OPENAI_API_KEY`

### Step 2: Install & Configure (3 min)

```bash
# Navigate to template
cd /c/Users/ormus/Projects/\(10\)\ HermeticSaas/03-build/starter-templates/ai-powered-app/

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-...
```

### Step 3: Database Setup (5 min)

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase-migrations-example.sql` from this template
3. Copy and paste entire file
4. Click "Run"
5. Verify tables created in Table Editor

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 4: Test (2 min)

```bash
# Start development server
npm run dev
```

Visit http://localhost:3000

Test with the simple chat component (create if needed):

```bash
# Create test page
mkdir -p app/test
```

Create `app/test/page.tsx`:
```typescript
import { SimpleChat } from '@/components/simple-chat';

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Chat Test</h1>
      <SimpleChat />
    </div>
  );
}
```

Visit http://localhost:3000/test and chat!

## What You Get

### Working Features
- ✅ Basic chat with GPT-3.5/GPT-4
- ✅ Streaming responses
- ✅ Conversation storage
- ✅ Token counting
- ✅ Cost tracking
- ✅ User authentication (Supabase)
- ✅ Vector database (pgvector)

### Next Steps
1. **Add RAG**: Follow [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md#rag-setup-45-minutes)
2. **Customize prompts**: See [example-prompts-and-use-cases.md](./example-prompts-and-use-cases.md)
3. **Build UI**: Create chat interface in `/components/ai/`
4. **Add auth**: Implement Supabase Auth
5. **Deploy**: Deploy to Vercel

## Common Issues

### "OpenAI API key is invalid"
- Check key starts with `sk-`
- Ensure no extra spaces
- Verify key is not revoked in OpenAI dashboard

### "Supabase connection failed"
- Verify URL and keys are correct
- Check project is not paused (free tier)
- Ensure keys are in `.env.local`, not `.env.example`

### "Database tables not found"
- Run the SQL migration
- Check tables exist in Supabase dashboard
- Verify RLS policies are enabled

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Vector search returns no results
- Check pgvector extension is enabled: `CREATE EXTENSION vector;`
- Verify embeddings table has data
- Lower similarity threshold in search (try 0.5 instead of 0.7)

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# In another terminal - watch types
npm run type-check -- --watch

# Run tests
npm test
```

### Before Committing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Test
npm test

# Build check
npm run build
```

### Database Changes

```bash
# After modifying schema in Supabase dashboard
npm run db:generate  # Regenerate TypeScript types
```

## Project Structure Quick Reference

```
Key Files:
├── app/api/chat/route.ts          # Chat API
├── lib/ai/providers/openai.ts     # OpenAI integration
├── lib/ai/cost/token-counter.ts   # Token counting
├── components/simple-chat.tsx     # Basic chat UI
└── .env.local                     # Your config (gitignored)

Key Docs:
├── README.md                      # Full documentation
├── IMPLEMENTATION-GUIDE.md        # Step-by-step setup
├── example-prompts-and-use-cases.md  # 20+ examples
└── QUICK-START.md                 # This file
```

## Cost Monitoring

### Check Your OpenAI Usage

1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Set up usage limits in Settings → Billing
3. Recommended limits for testing:
   - Hard limit: $10/month
   - Email alert at: $5

### Track in Your App

Query usage logs:
```sql
-- In Supabase SQL Editor
SELECT
  DATE(timestamp) as date,
  COUNT(*) as requests,
  SUM(total_tokens) as tokens,
  SUM(cost) as cost
FROM usage_logs
WHERE user_id = 'your-user-id'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

## Essential Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:generate        # Generate types from Supabase
npm run db:push           # Push migrations

# Code Quality
npm run lint              # Lint code
npm run type-check        # Check TypeScript
npm test                  # Run tests
```

## Testing Checklist

Test these before building features:

- [ ] Basic chat works (send message, get response)
- [ ] Streaming chat works (see tokens arrive one by one)
- [ ] Conversation saves to database
- [ ] Token counting is accurate
- [ ] Cost tracking records in `usage_logs`
- [ ] Vector search works (after adding embeddings)
- [ ] Authentication works (if implemented)

## Performance Tips

### Speed Up Development

```bash
# Use Turbopack (faster than webpack)
npm run dev --turbo
```

### Optimize API Calls

```typescript
// Cache common queries
const cached = await getCachedResponse(prompt);
if (cached) return cached;

// Use GPT-3.5 for simple tasks (10x cheaper)
model: 'gpt-3.5-turbo'

// Reduce tokens for testing
max_tokens: 100  // Instead of 1000+
```

### Database Performance

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM embeddings
WHERE user_id = 'xxx';

-- Keep tables optimized
VACUUM ANALYZE embeddings;
```

## Next Features to Add

### Week 1: Core Chat
- [ ] Proper chat UI
- [ ] Message history
- [ ] Copy/paste code blocks
- [ ] Markdown rendering

### Week 2: Documents
- [ ] File upload UI
- [ ] Document processing
- [ ] RAG implementation
- [ ] Search interface

### Week 3: Polish
- [ ] User settings
- [ ] Usage dashboard
- [ ] Cost alerts
- [ ] Export conversations

### Week 4: Production
- [ ] Error monitoring (Sentry)
- [ ] Analytics (PostHog)
- [ ] Rate limiting
- [ ] Deploy to Vercel

## Getting Help

### Documentation
1. **This template**: Start with [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)
2. **OpenAI**: [platform.openai.com/docs](https://platform.openai.com/docs)
3. **Supabase**: [supabase.com/docs](https://supabase.com/docs)
4. **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

### Debugging

Enable debug mode:
```env
# .env.local
NEXT_PUBLIC_DEBUG=true
LOG_LEVEL=debug
```

Check logs:
```bash
# Development server logs
# Look for AI operation logs

# Supabase logs
# Check in Supabase Dashboard → Logs
```

### Community Resources
- [OpenAI Community Forum](https://community.openai.com)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js Discord](https://discord.gg/nextjs)

## Production Checklist

Before deploying:

### Security
- [ ] All API keys in environment variables
- [ ] Service role key NEVER exposed to client
- [ ] RLS policies enabled on all tables
- [ ] Rate limiting implemented
- [ ] Content moderation enabled

### Performance
- [ ] Vector indexes created
- [ ] Response caching configured
- [ ] Image optimization enabled
- [ ] Build completed without errors

### Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Usage alerts set up
- [ ] Logging configured
- [ ] Analytics integrated

### Costs
- [ ] OpenAI billing limits set
- [ ] Usage quotas implemented
- [ ] Cost alerts configured
- [ ] Budget approved

## Budget Planning

### Expected Costs (Small SaaS)

**Development** (per month):
- OpenAI API: $10-50
- Supabase: Free tier
- Vercel: Free tier
- **Total**: ~$10-50/month

**Production** (100 active users):
- OpenAI API: $100-500
- Supabase: $25 (Pro tier)
- Vercel: $20 (Pro tier)
- Upstash Redis: $10
- **Total**: ~$155-555/month

**Cost per user**: ~$1.55-5.55/month

### Optimization Tips
1. Use GPT-3.5 by default (10x cheaper than GPT-4)
2. Cache common queries (30%+ cost reduction)
3. Implement user quotas
4. Use Claude for long contexts (cheaper than GPT-4)
5. Batch API calls when possible

## Success Metrics

Track these KPIs:

### Technical
- API response time < 2s
- Streaming latency < 500ms
- Uptime > 99.9%
- Error rate < 0.1%

### Business
- Cost per conversation < $0.05
- User retention > 40%
- Daily active users growth
- Feature usage rates

### Quality
- User satisfaction > 4.5/5
- Response accuracy > 90%
- Cache hit rate > 30%

## Congratulations!

You now have a production-ready AI-powered SaaS starter.

**Next Steps**:
1. Customize for your use case
2. Add your unique features
3. Test with real users
4. Iterate based on feedback
5. Launch and grow!

---

**Need help?** Check the comprehensive guides:
- [README.md](./README.md) - Complete documentation
- [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) - Detailed setup
- [example-prompts-and-use-cases.md](./example-prompts-and-use-cases.md) - 20+ examples
- [PROJECT-INDEX.md](./PROJECT-INDEX.md) - Complete reference

**Happy building!** 🚀
