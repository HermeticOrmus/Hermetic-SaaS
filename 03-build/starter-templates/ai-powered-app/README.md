# AI-Powered App Starter Template

A production-ready Next.js 14 starter template for building AI-powered SaaS applications with GPT-4, Claude, RAG, and vector search capabilities.

## Features

- **Multi-LLM Support**: OpenAI GPT-4, Anthropic Claude with easy provider switching
- **Streaming Responses**: Real-time AI responses with token-by-token streaming
- **RAG Implementation**: Retrieval Augmented Generation with semantic search
- **Vector Database**: Supabase pgvector for embeddings storage
- **Token Management**: Real-time cost tracking and usage monitoring
- **Chat Interface**: Professional chat UI with conversation history
- **File Processing**: Upload and process documents for RAG
- **Cost Optimization**: Caching, prompt optimization, and batch processing
- **Authentication**: Supabase Auth with user management
- **TypeScript**: Full type safety across the stack

## Architecture

```
ai-powered-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── chat/
│   │   ├── documents/
│   │   ├── settings/
│   │   └── usage/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Streaming chat endpoint
│   │   ├── embeddings/
│   │   │   └── route.ts          # Generate embeddings
│   │   ├── documents/
│   │   │   ├── upload/route.ts   # Document upload
│   │   │   └── process/route.ts  # Document processing
│   │   └── usage/
│   │       └── route.ts          # Usage tracking
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ai/
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   ├── streaming-message.tsx
│   │   └── token-counter.tsx
│   ├── documents/
│   │   ├── file-upload.tsx
│   │   └── document-list.tsx
│   └── ui/
│       └── ...
├── lib/
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── openai.ts         # OpenAI integration
│   │   │   ├── anthropic.ts      # Claude integration
│   │   │   └── types.ts          # Shared types
│   │   ├── rag/
│   │   │   ├── embeddings.ts     # Embedding generation
│   │   │   ├── vector-search.ts  # Semantic search
│   │   │   ├── chunking.ts       # Text chunking
│   │   │   └── retrieval.ts      # Context retrieval
│   │   ├── prompts/
│   │   │   ├── templates.ts      # Prompt templates
│   │   │   ├── system-prompts.ts # System prompts
│   │   │   └── few-shot.ts       # Few-shot examples
│   │   ├── streaming/
│   │   │   ├── stream-handler.ts # Stream processing
│   │   │   └── sse.ts            # Server-Sent Events
│   │   ├── cost/
│   │   │   ├── token-counter.ts  # Token counting
│   │   │   ├── pricing.ts        # Cost calculation
│   │   │   └── tracker.ts        # Usage tracking
│   │   └── memory/
│   │       ├── conversation.ts   # Conversation memory
│   │       └── cache.ts          # Response caching
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils/
│       └── ...
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_vector_extension.sql
│   │   ├── 003_embeddings_table.sql
│   │   └── 004_usage_tracking.sql
│   └── functions/
│       └── match-documents.sql
├── types/
│   ├── ai.ts
│   ├── database.ts
│   └── supabase.ts
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

## Quick Start

### 1. Clone and Install

```bash
cd /path/to/hermetic-saas/starter-templates/ai-powered-app
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...  # Optional

# Anthropic (Optional)
ANTHROPIC_API_KEY=sk-ant-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEFAULT_AI_PROVIDER=openai  # or 'anthropic'
DEFAULT_MODEL=gpt-4-turbo-preview
ENABLE_RAG=true
MAX_TOKENS=4096
TEMPERATURE=0.7
```

### 3. Database Setup

#### Enable pgvector Extension

```sql
-- Run in Supabase SQL Editor
create extension if not exists vector;
```

#### Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or run migrations manually in SQL Editor
```

#### Create Tables

The migrations create these tables:

- `conversations` - Chat conversations
- `messages` - Individual messages
- `documents` - Uploaded documents
- `embeddings` - Vector embeddings (1536 dimensions for OpenAI)
- `usage_logs` - Token and cost tracking

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## AI Integration Patterns

### 1. Simple Chat Completion

**Use Case**: Direct Q&A, content generation, text transformation

```typescript
import { createChatCompletion } from '@/lib/ai/providers/openai';

const response = await createChatCompletion({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing' }
  ],
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 1000
});
```

### 2. Streaming Chat

**Use Case**: Real-time responses, better UX for long answers

```typescript
import { streamChatCompletion } from '@/lib/ai/providers/openai';

const stream = await streamChatCompletion({
  messages: conversationHistory,
  onToken: (token) => {
    // Update UI with each token
    setResponse(prev => prev + token);
  },
  onComplete: (fullResponse) => {
    // Save to database
    saveMessage(fullResponse);
  },
  onError: (error) => {
    console.error('Stream error:', error);
  }
});
```

### 3. RAG (Retrieval Augmented Generation)

**Use Case**: Knowledge base Q&A, document search, context-aware responses

```typescript
import { retrieveContext } from '@/lib/ai/rag/retrieval';
import { createChatCompletion } from '@/lib/ai/providers/openai';

// 1. Find relevant context
const context = await retrieveContext({
  query: userQuestion,
  topK: 5,
  threshold: 0.75
});

// 2. Build prompt with context
const messages = [
  {
    role: 'system',
    content: `Answer questions based on this context:\n\n${context}`
  },
  {
    role: 'user',
    content: userQuestion
  }
];

// 3. Generate response
const response = await createChatCompletion({ messages });
```

### 4. Multi-Provider Fallback

**Use Case**: Reliability, cost optimization, feature availability

```typescript
import { generateResponse } from '@/lib/ai/providers';

const response = await generateResponse({
  messages,
  providers: ['openai', 'anthropic'], // Try in order
  fallback: true,
  maxRetries: 2
});
```

### 5. Function Calling / Tools

**Use Case**: Structured data extraction, API integration

```typescript
const response = await createChatCompletion({
  messages,
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current weather',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string' },
            unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
          },
          required: ['location']
        }
      }
    }
  ],
  tool_choice: 'auto'
});
```

## Prompt Engineering Guide

### System Prompts

**Structure for Consistency**

```typescript
// lib/ai/prompts/system-prompts.ts
export const SYSTEM_PROMPTS = {
  customer_support: `You are a helpful customer support agent.

Guidelines:
- Be empathetic and professional
- Provide step-by-step solutions
- Ask clarifying questions if needed
- Escalate complex issues
- Use the customer's name when known

Tone: Friendly, professional, solution-oriented`,

  content_writer: `You are an expert content writer specializing in SaaS marketing.

Guidelines:
- Write clear, concise copy
- Use active voice
- Include relevant keywords naturally
- Structure with headers and lists
- Target audience: B2B decision makers

Format: Markdown with proper headings`,

  code_assistant: `You are an expert software engineer.

Guidelines:
- Provide working, tested code
- Explain your solutions
- Follow best practices
- Consider edge cases
- Optimize for readability

Languages: TypeScript, React, Node.js`
};
```

### Few-Shot Examples

**Improve Accuracy and Format**

```typescript
// lib/ai/prompts/few-shot.ts
export const extractEmailIntent = (email: string) => {
  const fewShot = [
    {
      input: "I can't log into my account",
      output: { intent: 'technical_support', priority: 'high', category: 'authentication' }
    },
    {
      input: "What's your pricing?",
      output: { intent: 'sales', priority: 'medium', category: 'pricing' }
    },
    {
      input: "Cancel my subscription",
      output: { intent: 'cancellation', priority: 'high', category: 'billing' }
    }
  ];

  return `Classify customer emails into intent, priority, and category.

Examples:
${fewShot.map(ex => `Input: "${ex.input}"\nOutput: ${JSON.stringify(ex.output)}`).join('\n\n')}

Now classify:
Input: "${email}"
Output:`;
};
```

### Prompt Templates

**Reusable Structures**

```typescript
// lib/ai/prompts/templates.ts
export const promptTemplates = {
  summarize: (text: string, maxWords: number) =>
    `Summarize the following text in ${maxWords} words or less:\n\n${text}`,

  translate: (text: string, targetLang: string) =>
    `Translate the following to ${targetLang}:\n\n${text}`,

  extract_structured: (text: string, schema: object) =>
    `Extract information from this text and return as JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nText:\n${text}`,

  rag_query: (context: string, question: string) =>
    `Use only the following context to answer the question. If the answer is not in the context, say "I don't have enough information to answer that."\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`
};
```

### Prompt Optimization

**Token Efficiency**

```typescript
// Bad: Verbose prompt (wastes tokens)
const badPrompt = `
I would like you to please help me by writing a summary of the following text.
Please make sure that the summary is concise and captures the main points.
Thank you for your help!

Text: ${longText}
`;

// Good: Concise prompt (saves tokens)
const goodPrompt = `Summarize concisely:\n\n${longText}`;
```

**Chain of Thought for Complex Tasks**

```typescript
const complexPrompt = `Let's solve this step-by-step:

1. First, identify the key requirements
2. Then, analyze the constraints
3. Finally, provide the optimal solution

Problem: ${problem}

Work through each step:`;
```

## RAG Implementation

### Document Processing Pipeline

```typescript
// lib/ai/rag/document-processor.ts
import { chunkText } from './chunking';
import { generateEmbedding } from './embeddings';
import { storeEmbeddings } from './vector-search';

export async function processDocument(file: File, userId: string) {
  // 1. Extract text
  const text = await extractText(file);

  // 2. Chunk into smaller pieces (overlap for context)
  const chunks = chunkText(text, {
    maxChunkSize: 512,      // tokens
    overlap: 50,            // tokens
    preserveSentences: true
  });

  // 3. Generate embeddings for each chunk
  const embeddings = await Promise.all(
    chunks.map(chunk => generateEmbedding(chunk.text))
  );

  // 4. Store in vector database
  await storeEmbeddings({
    userId,
    documentId: file.name,
    chunks: chunks.map((chunk, i) => ({
      text: chunk.text,
      embedding: embeddings[i],
      metadata: {
        page: chunk.page,
        position: chunk.position
      }
    }))
  });

  return { chunks: chunks.length, success: true };
}
```

### Text Chunking Strategies

```typescript
// lib/ai/rag/chunking.ts
export interface ChunkOptions {
  maxChunkSize: number;    // In tokens
  overlap: number;         // In tokens
  preserveSentences: boolean;
  preserveParagraphs: boolean;
}

// Strategy 1: Fixed-size chunks
export function fixedSizeChunking(text: string, size: number, overlap: number) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// Strategy 2: Sentence-aware chunking (recommended)
export function sentenceAwareChunking(text: string, maxTokens: number, overlap: number) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    if (currentTokens + sentenceTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk);
      // Keep last sentence for overlap
      currentChunk = sentence;
      currentTokens = sentenceTokens;
    } else {
      currentChunk += sentence;
      currentTokens += sentenceTokens;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

// Strategy 3: Semantic chunking (advanced)
export async function semanticChunking(text: string, maxTokens: number) {
  // Group sentences by semantic similarity
  // More complex but produces better results
}
```

### Embedding Generation

```typescript
// lib/ai/rag/embeddings.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // $0.02 per 1M tokens
    input: text,
    encoding_format: 'float'
  });

  return response.data[0].embedding;
}

// Batch processing for efficiency
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    encoding_format: 'float'
  });

  return response.data.map(d => d.embedding);
}

// Alternative: Use smaller dimensions (cheaper, faster)
export async function generateEmbeddingSmall(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 512, // vs default 1536 - 3x cheaper
    encoding_format: 'float'
  });

  return response.data[0].embedding;
}
```

### Vector Search

```typescript
// lib/ai/rag/vector-search.ts
import { createClient } from '@/lib/supabase/server';

export async function searchSimilarDocuments(
  query: string,
  options: {
    topK?: number;
    threshold?: number;
    userId?: string;
  } = {}
) {
  const { topK = 5, threshold = 0.7, userId } = options;

  // 1. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search vector database
  const supabase = createClient();
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: topK,
    filter_user_id: userId
  });

  if (error) throw error;

  return data.map((doc: any) => ({
    text: doc.content,
    similarity: doc.similarity,
    metadata: doc.metadata
  }));
}

// Hybrid search: Vector + keyword
export async function hybridSearch(query: string, options = {}) {
  const [vectorResults, keywordResults] = await Promise.all([
    searchSimilarDocuments(query, options),
    searchKeywords(query, options)
  ]);

  // Merge and re-rank results
  return mergeResults(vectorResults, keywordResults);
}
```

### Context Retrieval

```typescript
// lib/ai/rag/retrieval.ts
export async function retrieveContext(
  query: string,
  options: {
    topK?: number;
    maxTokens?: number;
    includeMetadata?: boolean;
  } = {}
) {
  const { topK = 5, maxTokens = 2000, includeMetadata = false } = options;

  // 1. Search for relevant documents
  const documents = await searchSimilarDocuments(query, { topK });

  // 2. Filter by similarity threshold
  const relevantDocs = documents.filter(doc => doc.similarity > 0.7);

  // 3. Build context within token limit
  let context = '';
  let tokenCount = 0;

  for (const doc of relevantDocs) {
    const docTokens = estimateTokens(doc.text);

    if (tokenCount + docTokens > maxTokens) break;

    if (includeMetadata) {
      context += `[Source: ${doc.metadata.source}]\n${doc.text}\n\n`;
    } else {
      context += `${doc.text}\n\n`;
    }

    tokenCount += docTokens;
  }

  return context.trim();
}
```

## Vector Database Setup

### Supabase pgvector Configuration

```sql
-- supabase/migrations/002_vector_extension.sql

-- Enable pgvector extension
create extension if not exists vector;

-- Create embeddings table
create table embeddings (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  document_id text not null,
  content text not null,
  embedding vector(1536), -- OpenAI ada-002 / text-embedding-3-small
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Create index for vector similarity search (HNSW for speed)
create index embeddings_embedding_idx on embeddings
using hnsw (embedding vector_cosine_ops)
with (m = 16, ef_construction = 64);

-- Create index for filtering
create index embeddings_user_id_idx on embeddings(user_id);
create index embeddings_document_id_idx on embeddings(document_id);

-- Row Level Security
alter table embeddings enable row level security;

create policy "Users can view their own embeddings"
  on embeddings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own embeddings"
  on embeddings for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own embeddings"
  on embeddings for delete
  using (auth.uid() = user_id);

-- Function for similarity search
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5,
  filter_user_id uuid default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    embeddings.id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where
    (filter_user_id is null or embeddings.user_id = filter_user_id)
    and 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### Performance Optimization

```sql
-- For large datasets, use IVFFlat index (faster inserts, slightly slower search)
create index embeddings_embedding_ivf_idx on embeddings
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Analyze table for query optimization
analyze embeddings;

-- Vacuum regularly
vacuum analyze embeddings;
```

## Token Management & Cost Tracking

### Token Counting

```typescript
// lib/ai/cost/token-counter.ts
import { encode } from 'gpt-tokenizer';

export function countTokens(text: string, model: string = 'gpt-4'): number {
  // Use tiktoken for accurate counting
  const tokens = encode(text);
  return tokens.length;
}

export function estimateTokens(text: string): number {
  // Quick estimation: ~4 chars per token
  return Math.ceil(text.length / 4);
}

export function countMessageTokens(messages: Array<{ role: string; content: string }>): number {
  let tokenCount = 0;

  for (const message of messages) {
    tokenCount += 4; // Every message has overhead
    tokenCount += countTokens(message.content);
    tokenCount += countTokens(message.role);
  }

  tokenCount += 2; // Priming tokens
  return tokenCount;
}
```

### Cost Calculation

```typescript
// lib/ai/cost/pricing.ts
export const PRICING = {
  'gpt-4-turbo-preview': {
    input: 0.01,   // per 1K tokens
    output: 0.03
  },
  'gpt-4': {
    input: 0.03,
    output: 0.06
  },
  'gpt-3.5-turbo': {
    input: 0.0005,
    output: 0.0015
  },
  'claude-3-opus': {
    input: 0.015,
    output: 0.075
  },
  'claude-3-sonnet': {
    input: 0.003,
    output: 0.015
  },
  'text-embedding-3-small': {
    input: 0.00002,
    output: 0
  }
} as const;

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: keyof typeof PRICING
): number {
  const pricing = PRICING[model];
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}
```

### Usage Tracking

```typescript
// lib/ai/cost/tracker.ts
import { createClient } from '@/lib/supabase/server';

export async function trackUsage(data: {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  conversationId?: string;
}) {
  const supabase = createClient();

  await supabase.from('usage_logs').insert({
    user_id: data.userId,
    model: data.model,
    input_tokens: data.inputTokens,
    output_tokens: data.outputTokens,
    total_tokens: data.inputTokens + data.outputTokens,
    cost: data.cost,
    conversation_id: data.conversationId,
    timestamp: new Date().toISOString()
  });
}

export async function getUserUsage(userId: string, period: 'day' | 'month' = 'month') {
  const supabase = createClient();

  const startDate = period === 'day'
    ? new Date(Date.now() - 24 * 60 * 60 * 1000)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString());

  const total = data?.reduce((acc, log) => ({
    tokens: acc.tokens + log.total_tokens,
    cost: acc.cost + log.cost,
    requests: acc.requests + 1
  }), { tokens: 0, cost: 0, requests: 0 });

  return total;
}
```

### Usage Limits & Quotas

```typescript
// lib/ai/cost/limits.ts
export const USAGE_LIMITS = {
  free: {
    tokensPerMonth: 100_000,
    costPerMonth: 5,
    requestsPerDay: 50
  },
  pro: {
    tokensPerMonth: 1_000_000,
    costPerMonth: 50,
    requestsPerDay: 500
  },
  enterprise: {
    tokensPerMonth: 10_000_000,
    costPerMonth: 500,
    requestsPerDay: 5000
  }
};

export async function checkUsageLimit(userId: string, tier: keyof typeof USAGE_LIMITS) {
  const usage = await getUserUsage(userId, 'month');
  const limits = USAGE_LIMITS[tier];

  return {
    withinLimit: usage.cost < limits.costPerMonth,
    usage,
    limits,
    percentage: (usage.cost / limits.costPerMonth) * 100
  };
}
```

## Token Optimization Strategies

### 1. Prompt Caching

```typescript
// lib/ai/memory/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

export async function getCachedResponse(prompt: string): Promise<string | null> {
  const cacheKey = `ai:${hashPrompt(prompt)}`;
  return await redis.get(cacheKey);
}

export async function cacheResponse(prompt: string, response: string, ttl = 3600) {
  const cacheKey = `ai:${hashPrompt(prompt)}`;
  await redis.set(cacheKey, response, { ex: ttl });
}

// Semantic caching (more flexible)
export async function semanticCache(query: string, threshold = 0.95) {
  const embedding = await generateEmbedding(query);

  // Search for similar cached queries
  const similar = await searchCachedQueries(embedding, threshold);

  if (similar.length > 0) {
    return similar[0].response; // Return cached response
  }

  return null;
}
```

### 2. Token Budget Management

```typescript
// lib/ai/optimization/budget.ts
export function optimizeConversationHistory(
  messages: Message[],
  maxTokens: number
): Message[] {
  let totalTokens = 0;
  const optimized: Message[] = [];

  // Always keep system message
  if (messages[0]?.role === 'system') {
    optimized.push(messages[0]);
    totalTokens += countTokens(messages[0].content);
  }

  // Work backwards from most recent
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'system') continue;

    const msgTokens = countTokens(msg.content);

    if (totalTokens + msgTokens > maxTokens) break;

    optimized.unshift(msg);
    totalTokens += msgTokens;
  }

  return optimized;
}

// Summarize old messages to save tokens
export async function summarizeHistory(messages: Message[]): Promise<Message[]> {
  if (messages.length < 10) return messages;

  const oldMessages = messages.slice(0, -5);
  const recentMessages = messages.slice(-5);

  const summary = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'Summarize this conversation concisely, preserving key context.'
      },
      {
        role: 'user',
        content: JSON.stringify(oldMessages)
      }
    ],
    model: 'gpt-3.5-turbo', // Use cheaper model for summarization
    maxTokens: 200
  });

  return [
    { role: 'system', content: `Previous conversation summary: ${summary}` },
    ...recentMessages
  ];
}
```

### 3. Model Selection

```typescript
// lib/ai/optimization/model-selector.ts
export function selectOptimalModel(task: {
  complexity: 'simple' | 'medium' | 'complex';
  maxLatency: number; // milliseconds
  maxCost: number;    // dollars
}): string {
  // Simple tasks: use GPT-3.5
  if (task.complexity === 'simple') {
    return 'gpt-3.5-turbo';
  }

  // Low latency required: use GPT-3.5
  if (task.maxLatency < 2000) {
    return 'gpt-3.5-turbo';
  }

  // Complex tasks with budget: use GPT-4
  if (task.complexity === 'complex' && task.maxCost > 0.01) {
    return 'gpt-4-turbo-preview';
  }

  // Default: balanced option
  return 'gpt-3.5-turbo';
}
```

### 4. Batch Processing

```typescript
// Process multiple requests in parallel
export async function batchProcess(items: string[]) {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}
```

## Conversation Memory

### Short-term Memory (In-Context)

```typescript
// lib/ai/memory/conversation.ts
export class ConversationMemory {
  private messages: Message[] = [];
  private maxTokens: number;

  constructor(maxTokens = 4000) {
    this.maxTokens = maxTokens;
  }

  addMessage(role: 'user' | 'assistant' | 'system', content: string) {
    this.messages.push({ role, content });
    this.pruneMessages();
  }

  private pruneMessages() {
    const optimized = optimizeConversationHistory(this.messages, this.maxTokens);
    this.messages = optimized;
  }

  getMessages(): Message[] {
    return this.messages;
  }

  async summarizeAndReset() {
    if (this.messages.length > 5) {
      const summary = await summarizeHistory(this.messages);
      this.messages = summary;
    }
  }
}
```

### Long-term Memory (Database)

```typescript
// Store conversations in Supabase
export async function saveConversation(data: {
  userId: string;
  title: string;
  messages: Message[];
}) {
  const supabase = createClient();

  const { data: conversation } = await supabase
    .from('conversations')
    .insert({
      user_id: data.userId,
      title: data.title,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  // Save messages
  await supabase.from('messages').insert(
    data.messages.map(msg => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date().toISOString()
    }))
  );

  return conversation;
}

export async function loadConversation(conversationId: string) {
  const supabase = createClient();

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });

  return messages;
}
```

## Hermetic Principles for AI Apps

### 1. Deterministic AI (Where Possible)

```typescript
// Set temperature to 0 for consistent outputs
const config = {
  temperature: 0,      // Deterministic
  seed: 12345,         // Reproducible
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
};
```

### 2. Fail-Safe Defaults

```typescript
// Always have fallbacks
export async function generateResponse(prompt: string) {
  try {
    return await aiProvider.generate(prompt);
  } catch (error) {
    // Fallback to cached response
    const cached = await getCachedResponse(prompt);
    if (cached) return cached;

    // Fallback to alternative provider
    return await alternativeProvider.generate(prompt);
  }
}
```

### 3. Observable AI Operations

```typescript
// Log all AI operations
export async function trackedCompletion(config: CompletionConfig) {
  const startTime = Date.now();

  try {
    const response = await createChatCompletion(config);

    // Log success
    await logAIOperation({
      type: 'completion',
      model: config.model,
      tokens: response.usage,
      latency: Date.now() - startTime,
      success: true
    });

    return response;
  } catch (error) {
    // Log failure
    await logAIOperation({
      type: 'completion',
      model: config.model,
      error: error.message,
      latency: Date.now() - startTime,
      success: false
    });

    throw error;
  }
}
```

### 4. Cost-Conscious Architecture

```typescript
// Check budget before expensive operations
export async function costAwareCompletion(config: CompletionConfig) {
  const estimatedCost = estimateCost(config);

  // Check user's remaining budget
  const budget = await getUserBudget(config.userId);

  if (estimatedCost > budget.remaining) {
    throw new Error('Insufficient budget for this operation');
  }

  return await createChatCompletion(config);
}
```

### 5. Testable AI Components

```typescript
// Mock AI responses for testing
export function createMockAI() {
  return {
    generate: jest.fn().mockResolvedValue('Mocked response'),
    stream: jest.fn().mockImplementation(async function* () {
      yield 'Mocked ';
      yield 'streaming ';
      yield 'response';
    })
  };
}

// Test with fixtures
describe('AI Integration', () => {
  it('should handle responses correctly', async () => {
    const mockAI = createMockAI();
    const response = await mockAI.generate('test prompt');
    expect(response).toBe('Mocked response');
  });
});
```

### 6. Privacy-First AI

```typescript
// Anonymize data before sending to AI
export function anonymizeData(text: string): string {
  return text
    .replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g, '[EMAIL]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    .replace(/\b\d{16}\b/g, '[CREDIT_CARD]');
}

// Opt-in for AI features
export async function checkAIConsent(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_preferences')
    .select('ai_features_enabled')
    .eq('user_id', userId)
    .single();

  return data?.ai_features_enabled ?? false;
}
```

## Deployment Guide

### Environment Configuration

```bash
# Production environment variables
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional: Redis for caching
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_TOKENS_PER_MINUTE=100000

# Cost limits
MAX_COST_PER_REQUEST=0.50
MAX_COST_PER_USER_PER_DAY=10.00
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY production
vercel env add SUPABASE_URL production
# ... add all required env vars
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t ai-app .
docker run -p 3000:3000 --env-file .env ai-app
```

### Monitoring & Alerts

```typescript
// Set up cost alerts
export async function checkCostAlerts() {
  const users = await getAllUsers();

  for (const user of users) {
    const usage = await getUserUsage(user.id, 'day');

    if (usage.cost > 10) {
      await sendAlert({
        to: user.email,
        subject: 'High AI Usage Alert',
        message: `Your AI usage today is $${usage.cost.toFixed(2)}`
      });
    }
  }
}
```

## Production Checklist

- [ ] API keys secured in environment variables
- [ ] Rate limiting implemented
- [ ] Usage tracking configured
- [ ] Cost alerts set up
- [ ] Error handling for AI failures
- [ ] Fallback providers configured
- [ ] Token limits enforced
- [ ] Response caching enabled
- [ ] Database indexes created
- [ ] Row-level security enabled
- [ ] Monitoring & logging configured
- [ ] GDPR compliance (data anonymization)
- [ ] Terms of service for AI usage
- [ ] User consent for AI features

## Example Use Cases

### 1. Customer Support Chatbot

```typescript
// AI-powered support with RAG
const supportBot = async (question: string, userId: string) => {
  // Retrieve relevant help docs
  const context = await retrieveContext(question, {
    topK: 3,
    maxTokens: 1500
  });

  const response = await streamChatCompletion({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.customer_support
      },
      {
        role: 'system',
        content: `Use this knowledge base:\n\n${context}`
      },
      {
        role: 'user',
        content: question
      }
    ],
    model: 'gpt-3.5-turbo', // Cost-effective for support
    temperature: 0.7
  });

  return response;
};
```

### 2. Content Generation

```typescript
// Blog post generator
const generateBlogPost = async (topic: string, keywords: string[]) => {
  const outline = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'Create a detailed blog post outline'
      },
      {
        role: 'user',
        content: `Topic: ${topic}\nKeywords: ${keywords.join(', ')}`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.8
  });

  const fullPost = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.content_writer
      },
      {
        role: 'user',
        content: `Write a full blog post based on this outline:\n${outline}`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000
  });

  return fullPost;
};
```

### 3. Document Analysis

```typescript
// Extract insights from uploaded documents
const analyzeDocument = async (fileId: string, query: string) => {
  // Document already processed and embedded
  const relevantSections = await searchSimilarDocuments(query, {
    documentId: fileId,
    topK: 5
  });

  const analysis = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'Analyze documents and provide insights'
      },
      {
        role: 'user',
        content: `Document sections:\n${relevantSections.map(s => s.text).join('\n\n')}\n\nQuery: ${query}`
      }
    ],
    model: 'gpt-4-turbo-preview'
  });

  return analysis;
};
```

### 4. Code Assistant

```typescript
// AI pair programmer
const codeAssistant = async (task: string, context: string) => {
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.code_assistant
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nTask: ${task}`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.2 // Lower for more consistent code
  });

  return response;
};
```

## Common Patterns

### Retry with Exponential Backoff

```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Response Validation

```typescript
export function validateAIResponse(response: string, schema: any): boolean {
  try {
    const parsed = JSON.parse(response);
    // Validate against schema (use Zod, Joi, etc.)
    return true;
  } catch {
    return false;
  }
}
```

### Streaming to Client

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const aiStream = await streamChatCompletion({ messages });

      for await (const chunk of aiStream) {
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

## Performance Benchmarks

Target metrics for production:

- **Streaming latency**: < 500ms to first token
- **Embedding generation**: < 200ms per chunk
- **Vector search**: < 100ms for top-5 results
- **Cache hit rate**: > 30% for common queries
- **Cost per conversation**: < $0.05
- **Uptime**: > 99.9%

## Support & Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [Supabase pgvector Guide](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Token Optimization Guide](https://help.openai.com/en/articles/4936856)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)

## License

MIT License - See LICENSE file

---

**Built with Hermetic Principles**

- Deterministic operations where possible
- Comprehensive error handling
- Cost-conscious by default
- Privacy-first architecture
- Production-ready from day one
- Observable and debuggable
- Testable components

Start building AI-powered SaaS applications with confidence.
