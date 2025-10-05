# AI-Powered App Starter - Project Index

Complete reference for all files and features in this starter template.

## Quick Navigation

- **Getting Started**: [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)
- **Prompt Examples**: [example-prompts-and-use-cases.md](./example-prompts-and-use-cases.md)
- **Directory Structure**: [lib-ai-directory-structure.md](./lib-ai-directory-structure.md)
- **Main Documentation**: [README.md](./README.md)

## File Structure

```
ai-powered-app/
│
├── Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.js            # Next.js configuration
│   ├── .env.example              # Environment variables template
│   ├── .gitignore                # Git ignore rules
│   └── tailwind.config.ts        # (Create) Tailwind CSS config
│
├── Documentation
│   ├── README.md                           # Main documentation
│   ├── IMPLEMENTATION-GUIDE.md             # Step-by-step implementation
│   ├── example-prompts-and-use-cases.md    # 20+ prompt examples
│   ├── lib-ai-directory-structure.md       # AI library organization
│   └── PROJECT-INDEX.md                    # This file
│
├── Database
│   └── supabase-migrations-example.sql     # Complete DB schema
│
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   │
│   ├── (auth)/                   # Auth routes (public)
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/              # Protected routes
│   │   ├── chat/                 # Chat interface
│   │   ├── documents/            # Document management
│   │   ├── settings/             # User settings
│   │   └── usage/                # Usage dashboard
│   │
│   └── api/                      # API routes
│       ├── chat/
│       │   ├── route.ts          # Standard chat
│       │   ├── stream/route.ts   # Streaming chat
│       │   └── rag/route.ts      # RAG chat
│       ├── embeddings/
│       │   └── route.ts          # Generate embeddings
│       ├── documents/
│       │   ├── upload/route.ts   # Upload documents
│       │   └── process/route.ts  # Process documents
│       └── usage/
│           └── route.ts          # Usage statistics
│
├── components/                   # React components
│   ├── ai/
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   ├── streaming-message.tsx
│   │   └── token-counter.tsx
│   ├── documents/
│   │   ├── file-upload.tsx
│   │   └── document-list.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── lib/                          # Core library code
│   ├── ai/                       # AI integration layer
│   │   │
│   │   ├── providers/            # AI provider integrations
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── base-provider.ts
│   │   │   ├── provider-factory.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── rag/                  # RAG implementation
│   │   │   ├── embeddings.ts
│   │   │   ├── vector-search.ts
│   │   │   ├── chunking.ts
│   │   │   ├── retrieval.ts
│   │   │   ├── document-processor.ts
│   │   │   └── hybrid-search.ts
│   │   │
│   │   ├── prompts/              # Prompt engineering
│   │   │   ├── templates.ts
│   │   │   ├── system-prompts.ts
│   │   │   ├── few-shot.ts
│   │   │   ├── prompt-builder.ts
│   │   │   └── validators.ts
│   │   │
│   │   ├── streaming/            # Streaming responses
│   │   │   ├── stream-handler.ts
│   │   │   ├── sse.ts
│   │   │   ├── client-stream.ts
│   │   │   └── stream-transformer.ts
│   │   │
│   │   ├── cost/                 # Cost management
│   │   │   ├── token-counter.ts
│   │   │   ├── pricing.ts
│   │   │   ├── tracker.ts
│   │   │   ├── budget.ts
│   │   │   └── optimizer.ts
│   │   │
│   │   ├── memory/               # Conversation memory
│   │   │   ├── conversation.ts
│   │   │   ├── cache.ts
│   │   │   ├── semantic-cache.ts
│   │   │   ├── context-window.ts
│   │   │   └── summarization.ts
│   │   │
│   │   ├── tools/                # Function calling
│   │   │   ├── function-calling.ts
│   │   │   ├── tool-definitions.ts
│   │   │   ├── tool-executor.ts
│   │   │   └── tool-validator.ts
│   │   │
│   │   ├── safety/               # Content safety
│   │   │   ├── moderation.ts
│   │   │   ├── pii-detection.ts
│   │   │   ├── rate-limiter.ts
│   │   │   └── content-filter.ts
│   │   │
│   │   ├── evaluation/           # Quality & testing
│   │   │   ├── quality-metrics.ts
│   │   │   ├── a-b-testing.ts
│   │   │   ├── benchmarks.ts
│   │   │   └── feedback.ts
│   │   │
│   │   └── utils/                # Utilities
│   │       ├── errors.ts
│   │       ├── retry.ts
│   │       ├── timeout.ts
│   │       ├── logger.ts
│   │       └── validators.ts
│   │
│   ├── supabase/                 # Supabase client
│   │   ├── client.ts             # Client-side
│   │   ├── server.ts             # Server-side
│   │   └── types.ts              # Generated types
│   │
│   └── utils/                    # General utilities
│       ├── cn.ts                 # Class name merger
│       └── ...
│
├── types/                        # TypeScript types
│   ├── ai.ts                     # AI-related types
│   ├── database.ts               # Database types
│   └── supabase.ts               # Supabase generated types
│
├── hooks/                        # React hooks
│   ├── use-chat.ts               # Chat hook
│   ├── use-documents.ts          # Documents hook
│   └── use-usage.ts              # Usage tracking hook
│
├── middleware.ts                 # Next.js middleware (auth, rate limiting)
│
└── public/                       # Static assets
    ├── favicon.ico
    └── ...
```

## Core Features

### 1. Multi-LLM Support
- **OpenAI**: GPT-3.5, GPT-4 Turbo
- **Anthropic**: Claude 3 (Haiku, Sonnet, Opus)
- **Provider Fallback**: Automatic failover
- **Model Selection**: Cost vs. quality optimization

### 2. RAG (Retrieval Augmented Generation)
- **Vector Search**: Supabase pgvector
- **Embeddings**: OpenAI text-embedding-3-small
- **Document Processing**: PDF, Word, TXT, MD
- **Smart Chunking**: Sentence-aware, token-optimized
- **Hybrid Search**: Vector + keyword

### 3. Streaming Responses
- **Token-by-token**: Real-time UI updates
- **Server-Sent Events**: Efficient streaming
- **Progress Tracking**: Token counting during stream
- **Error Handling**: Graceful stream failures

### 4. Cost Management
- **Token Counting**: Accurate tiktoken-based
- **Cost Tracking**: Per-request and aggregate
- **Usage Limits**: Tier-based quotas
- **Budget Alerts**: Email notifications
- **Optimization**: Caching, model selection

### 5. Conversation Memory
- **Short-term**: In-context history
- **Long-term**: Database persistence
- **Auto-summarization**: Compress old messages
- **Token Budget**: Context window management

### 6. Content Safety
- **Moderation**: OpenAI Moderation API
- **PII Detection**: Regex + NER
- **Rate Limiting**: Per-user throttling
- **Data Anonymization**: Privacy-first

### 7. Quality & Testing
- **A/B Testing**: Prompt comparison
- **Quality Metrics**: Relevance scoring
- **Feedback Loop**: User ratings
- **Performance Benchmarks**: Latency tracking

## Database Schema

### Core Tables

#### conversations
- `id`: UUID (PK)
- `user_id`: UUID (FK → auth.users)
- `title`: TEXT
- `model`: TEXT
- `system_prompt`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

#### messages
- `id`: UUID (PK)
- `conversation_id`: UUID (FK → conversations)
- `role`: TEXT (user/assistant/system)
- `content`: TEXT
- `input_tokens`, `output_tokens`: INTEGER
- `cost`: DECIMAL
- `timestamp`: TIMESTAMP

#### documents
- `id`: UUID (PK)
- `user_id`: UUID (FK → auth.users)
- `filename`: TEXT
- `file_type`: TEXT
- `storage_path`: TEXT
- `status`: TEXT (pending/processing/completed/failed)
- `chunk_count`: INTEGER
- `metadata`: JSONB
- `created_at`, `processed_at`: TIMESTAMP

#### embeddings
- `id`: BIGSERIAL (PK)
- `user_id`: UUID (FK → auth.users)
- `document_id`: UUID (FK → documents)
- `content`: TEXT
- `embedding`: VECTOR(1536)
- `metadata`: JSONB
- `created_at`: TIMESTAMP

#### usage_logs
- `id`: UUID (PK)
- `user_id`: UUID (FK → auth.users)
- `conversation_id`: UUID (FK → conversations)
- `model`: TEXT
- `provider`: TEXT
- `operation_type`: TEXT
- `input_tokens`, `output_tokens`: INTEGER
- `cost`: DECIMAL
- `latency_ms`: INTEGER
- `success`: BOOLEAN
- `timestamp`: TIMESTAMP

### Database Functions

#### match_documents()
Vector similarity search function
```sql
match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_user_id UUID DEFAULT NULL
)
```

#### get_user_usage_stats()
Get usage statistics for a user
```sql
get_user_usage_stats(
  target_user_id UUID,
  start_date TIMESTAMP DEFAULT NOW() - INTERVAL '30 days'
)
```

## API Routes

### Chat APIs

#### POST /api/chat
Standard chat completion
```typescript
Body: {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
}
Response: {
  message: { role: string; content: string };
  usage: { input_tokens: number; output_tokens: number };
}
```

#### POST /api/chat/stream
Streaming chat completion
```typescript
Body: {
  messages: Array<{ role: string; content: string }>;
}
Response: Server-Sent Events stream
```

#### POST /api/chat/rag
RAG-enhanced chat
```typescript
Body: {
  question: string;
  userId: string;
  documentIds?: string[];
}
Response: {
  answer: string;
  sources: Array<{ id: string; content: string; similarity: number }>;
  usage: { input_tokens: number; output_tokens: number };
}
```

### Document APIs

#### POST /api/documents/upload
Upload document
```typescript
Body: FormData with file
Response: {
  documentId: string;
  filename: string;
  status: string;
}
```

#### POST /api/documents/process
Process uploaded document
```typescript
Body: {
  documentId: string;
  userId: string;
}
Response: {
  success: boolean;
  chunks: number;
}
```

### Usage APIs

#### GET /api/usage
Get usage statistics
```typescript
Query: {
  period?: 'day' | 'week' | 'month';
}
Response: {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  successRate: number;
}
```

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

### Optional
- `ANTHROPIC_API_KEY` - Claude support
- `UPSTASH_REDIS_URL` - Caching
- `UPSTASH_REDIS_TOKEN` - Caching
- `SENTRY_DSN` - Error tracking
- `RESEND_API_KEY` - Email alerts

### Configuration
- `DEFAULT_AI_PROVIDER` - 'openai' | 'anthropic'
- `DEFAULT_MODEL` - Model name
- `ENABLE_RAG` - true | false
- `MAX_TOKENS_PER_REQUEST` - Number
- `ENABLE_STREAMING` - true | false

See `.env.example` for complete list.

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "db:generate": "supabase gen types typescript",
  "db:push": "supabase db push",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

## Key Dependencies

### AI & ML
- `openai`: ^4.28.0 - OpenAI GPT integration
- `@anthropic-ai/sdk`: ^0.17.0 - Claude integration
- `gpt-tokenizer`: ^2.1.2 - Token counting
- `tiktoken`: ^1.0.10 - Accurate tokenization
- `langchain`: ^0.1.20 - LangChain framework

### Database
- `@supabase/supabase-js`: ^2.39.3 - Supabase client
- `@supabase/auth-helpers-nextjs`: ^0.9.0 - Auth helpers

### Framework
- `next`: ^14.1.0 - Next.js framework
- `react`: ^18.2.0 - React library
- `typescript`: ^5.3.3 - TypeScript

### UI
- `@radix-ui/*` - Headless UI components
- `tailwindcss`: ^3.4.1 - CSS framework
- `react-markdown`: ^9.0.1 - Markdown rendering

### Utilities
- `zod`: ^3.22.4 - Schema validation
- `date-fns`: ^3.3.1 - Date utilities
- `@upstash/redis`: ^1.28.4 - Redis caching
- `@upstash/ratelimit`: ^1.0.1 - Rate limiting

## Pricing Reference

### OpenAI
- **GPT-4 Turbo**: $0.01/1K input, $0.03/1K output
- **GPT-3.5 Turbo**: $0.0005/1K input, $0.0015/1K output
- **Embeddings (small)**: $0.00002/1K tokens

### Anthropic
- **Claude 3 Opus**: $0.015/1K input, $0.075/1K output
- **Claude 3 Sonnet**: $0.003/1K input, $0.015/1K output
- **Claude 3 Haiku**: $0.00025/1K input, $0.00125/1K output

### Example Costs
- **Simple chat (GPT-3.5)**: ~$0.001 per exchange
- **Complex reasoning (GPT-4)**: ~$0.02 per exchange
- **Document embedding (1000 pages)**: ~$0.50
- **RAG query**: ~$0.005 per query

## Performance Targets

- **API Latency**: < 200ms (excluding LLM)
- **Streaming First Token**: < 500ms
- **Embedding Generation**: < 200ms per chunk
- **Vector Search**: < 100ms for top-5
- **Cache Hit Rate**: > 30%
- **Uptime**: > 99.9%

## Security Best Practices

1. **Never expose service role key** to client
2. **Use Row Level Security** for all tables
3. **Validate all inputs** before AI processing
4. **Implement rate limiting** per user
5. **Sanitize AI outputs** before display
6. **Monitor for abuse** patterns
7. **Encrypt sensitive data** at rest
8. **Rotate API keys** regularly
9. **Use content moderation** for UGC
10. **Log all AI operations** for audit

## Testing Strategy

### Unit Tests
- Token counting accuracy
- Cost calculation correctness
- Chunking algorithm validation
- Prompt template generation

### Integration Tests
- OpenAI API integration
- Supabase database operations
- Vector search accuracy
- End-to-end chat flow

### Performance Tests
- Response time benchmarks
- Concurrent user handling
- Large document processing
- Vector search at scale

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Vector indexes created
- [ ] Rate limiting enabled
- [ ] Cost alerts configured
- [ ] Error monitoring set up
- [ ] API keys rotated
- [ ] SSL/TLS enabled
- [ ] Backups configured
- [ ] Documentation updated

## Support & Resources

### Documentation
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Tools
- [OpenAI Playground](https://platform.openai.com/playground)
- [Anthropic Console](https://console.anthropic.com)
- [Supabase Dashboard](https://app.supabase.com)

### Community
- [Discord Server](#) - (Add your link)
- [GitHub Discussions](#) - (Add your link)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/openai)

---

## Quick Commands

```bash
# Install
npm install

# Setup environment
cp .env.example .env.local

# Run database migrations
supabase db push

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Generate Supabase types
npm run db:generate
```

---

**Last Updated**: 2025-10-05
**Version**: 1.0.0
**License**: MIT

For questions or issues, please refer to the comprehensive documentation in README.md or IMPLEMENTATION-GUIDE.md.
