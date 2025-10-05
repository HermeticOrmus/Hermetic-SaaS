# AI-Powered App Implementation Guide

Step-by-step guide to implement AI features in your SaaS application using this starter template.

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start-5-minutes)
2. [Core Implementation (30 minutes)](#core-implementation-30-minutes)
3. [RAG Setup (45 minutes)](#rag-setup-45-minutes)
4. [Advanced Features](#advanced-features)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start (5 minutes)

Get a basic AI chat working in your app.

### Step 1: Install Dependencies

```bash
cd /path/to/ai-powered-app
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with minimum required values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=sk-...
```

### Step 3: Create Basic Chat API Route

```typescript
// app/api/chat/route.ts
import { OpenAI } from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return Response.json({
      message: response.choices[0].message,
      usage: response.usage
    });
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
```

### Step 4: Create Simple Chat Component

```typescript
// components/simple-chat.tsx
'use client';

import { useState } from 'react';

export function SimpleChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();
      setMessages([...newMessages, data.message]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded ${
              msg.role === 'user' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'
            }`}
          >
            <p className="text-sm font-semibold mb-1">
              {msg.role === 'user' ? 'You' : 'AI'}
            </p>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### Step 5: Test

```bash
npm run dev
```

Visit http://localhost:3000 and test your chat!

---

## Core Implementation (30 minutes)

Add streaming, cost tracking, and error handling.

### Step 1: Set Up OpenAI Provider

```typescript
// lib/ai/providers/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionConfig {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function createChatCompletion(config: ChatCompletionConfig) {
  const {
    messages,
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 1000
  } = config;

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  });

  return {
    content: response.choices[0].message.content,
    usage: response.usage,
    model: response.model
  };
}

// Streaming version
export async function streamChatCompletion(config: ChatCompletionConfig) {
  const {
    messages,
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 1000
  } = config;

  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true
  });

  return stream;
}
```

### Step 2: Create Streaming Chat Route

```typescript
// app/api/chat/stream/route.ts
import { streamChatCompletion } from '@/lib/ai/providers/openai';
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Use edge runtime for streaming

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    const stream = await streamChatCompletion({ messages });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return Response.json(
      { error: 'Streaming failed' },
      { status: 500 }
    );
  }
}
```

### Step 3: Add Token Counting

```typescript
// lib/ai/cost/token-counter.ts
import { encode } from 'gpt-tokenizer';

export function countTokens(text: string): number {
  try {
    const tokens = encode(text);
    return tokens.length;
  } catch (error) {
    // Fallback: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

export function countMessageTokens(messages: Array<{ role: string; content: string }>): number {
  let tokenCount = 0;

  for (const message of messages) {
    tokenCount += 4; // Message overhead
    tokenCount += countTokens(message.role);
    tokenCount += countTokens(message.content);
  }

  tokenCount += 2; // Priming tokens

  return tokenCount;
}
```

### Step 4: Add Cost Tracking

```typescript
// lib/ai/cost/pricing.ts
export const PRICING = {
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
} as const;

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: keyof typeof PRICING
): number {
  const pricing = PRICING[model] || PRICING['gpt-3.5-turbo'];
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}
```

### Step 5: Database Setup

Run the SQL migration from `supabase-migrations-example.sql`:

```bash
# Using Supabase CLI
supabase db push

# Or paste into Supabase SQL Editor
```

### Step 6: Track Usage

```typescript
// lib/ai/cost/tracker.ts
import { createClient } from '@/lib/supabase/server';
import { calculateCost } from './pricing';

export async function trackUsage(data: {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  conversationId?: string;
}) {
  const supabase = createClient();
  const cost = calculateCost(data.inputTokens, data.outputTokens, data.model as any);

  await supabase.from('usage_logs').insert({
    user_id: data.userId,
    model: data.model,
    input_tokens: data.inputTokens,
    output_tokens: data.outputTokens,
    cost,
    conversation_id: data.conversationId,
    success: true
  });
}
```

---

## RAG Setup (45 minutes)

Implement Retrieval Augmented Generation for document Q&A.

### Step 1: Enable pgvector

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 2: Create Embeddings Function

```typescript
// lib/ai/rag/embeddings.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float'
  });

  return response.data[0].embedding;
}

export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    encoding_format: 'float'
  });

  return response.data.map(d => d.embedding);
}
```

### Step 3: Text Chunking

```typescript
// lib/ai/rag/chunking.ts
import { countTokens } from '../cost/token-counter';

export interface Chunk {
  text: string;
  tokens: number;
  index: number;
}

export interface ChunkOptions {
  maxChunkSize: number;  // in tokens
  overlap: number;        // in tokens
  preserveSentences?: boolean;
}

export function chunkText(
  text: string,
  options: ChunkOptions = {
    maxChunkSize: 512,
    overlap: 50,
    preserveSentences: true
  }
): Chunk[] {
  const chunks: Chunk[] = [];

  if (options.preserveSentences) {
    // Split by sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const sentenceTokens = countTokens(sentence);

      if (currentTokens + sentenceTokens > options.maxChunkSize && currentChunk) {
        // Save current chunk
        chunks.push({
          text: currentChunk.trim(),
          tokens: currentTokens,
          index: chunkIndex++
        });

        // Start new chunk with overlap (last sentence)
        currentChunk = sentence;
        currentTokens = sentenceTokens;
      } else {
        currentChunk += sentence;
        currentTokens += sentenceTokens;
      }
    }

    // Add final chunk
    if (currentChunk) {
      chunks.push({
        text: currentChunk.trim(),
        tokens: currentTokens,
        index: chunkIndex
      });
    }
  } else {
    // Simple fixed-size chunking
    const words = text.split(/\s+/);
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const word of words) {
      const wordTokens = countTokens(word);

      if (currentTokens + wordTokens > options.maxChunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          tokens: currentTokens,
          index: chunkIndex++
        });

        currentChunk = word;
        currentTokens = wordTokens;
      } else {
        currentChunk += ' ' + word;
        currentTokens += wordTokens;
      }
    }

    if (currentChunk) {
      chunks.push({
        text: currentChunk.trim(),
        tokens: currentTokens,
        index: chunkIndex
      });
    }
  }

  return chunks;
}
```

### Step 4: Document Processing

```typescript
// lib/ai/rag/document-processor.ts
import { chunkText } from './chunking';
import { generateEmbedding } from './embeddings';
import { createClient } from '@/lib/supabase/server';

export async function processDocument(params: {
  documentId: string;
  text: string;
  userId: string;
}) {
  const { documentId, text, userId } = params;

  // 1. Chunk the text
  const chunks = chunkText(text, {
    maxChunkSize: 512,
    overlap: 50,
    preserveSentences: true
  });

  console.log(`Created ${chunks.length} chunks`);

  // 2. Generate embeddings for each chunk
  const embeddings = await Promise.all(
    chunks.map(chunk => generateEmbedding(chunk.text))
  );

  console.log(`Generated ${embeddings.length} embeddings`);

  // 3. Store in database
  const supabase = createClient();

  const embeddingRecords = chunks.map((chunk, i) => ({
    user_id: userId,
    document_id: documentId,
    content: chunk.text,
    embedding: embeddings[i],
    metadata: {
      chunk_index: chunk.index,
      tokens: chunk.tokens
    }
  }));

  const { error } = await supabase
    .from('embeddings')
    .insert(embeddingRecords);

  if (error) throw error;

  // 4. Update document status
  await supabase
    .from('documents')
    .update({
      status: 'completed',
      chunk_count: chunks.length,
      processed_at: new Date().toISOString()
    })
    .eq('id', documentId);

  return { chunks: chunks.length, success: true };
}
```

### Step 5: Vector Search

```typescript
// lib/ai/rag/vector-search.ts
import { generateEmbedding } from './embeddings';
import { createClient } from '@/lib/supabase/server';

export interface SearchOptions {
  topK?: number;
  threshold?: number;
  userId?: string;
  documentIds?: string[];
}

export async function searchSimilarDocuments(
  query: string,
  options: SearchOptions = {}
) {
  const { topK = 5, threshold = 0.7, userId, documentIds } = options;

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Search database
  const supabase = createClient();
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: topK,
    filter_user_id: userId
  });

  if (error) throw error;

  // Filter by document IDs if specified
  let results = data;
  if (documentIds && documentIds.length > 0) {
    results = data.filter((doc: any) =>
      documentIds.includes(doc.document_id)
    );
  }

  return results.map((doc: any) => ({
    id: doc.id,
    documentId: doc.document_id,
    content: doc.content,
    similarity: doc.similarity,
    metadata: doc.metadata
  }));
}
```

### Step 6: Context Retrieval

```typescript
// lib/ai/rag/retrieval.ts
import { searchSimilarDocuments } from './vector-search';
import { countTokens } from '../cost/token-counter';

export async function retrieveContext(
  query: string,
  options: {
    topK?: number;
    maxTokens?: number;
    userId?: string;
    documentIds?: string[];
  } = {}
) {
  const { topK = 5, maxTokens = 2000, userId, documentIds } = options;

  // Search for relevant documents
  const documents = await searchSimilarDocuments(query, {
    topK,
    threshold: 0.7,
    userId,
    documentIds
  });

  if (documents.length === 0) {
    return null;
  }

  // Build context within token limit
  let context = '';
  let tokenCount = 0;

  for (const doc of documents) {
    const docTokens = countTokens(doc.content);

    if (tokenCount + docTokens > maxTokens) break;

    context += `${doc.content}\n\n`;
    tokenCount += docTokens;
  }

  return context.trim();
}
```

### Step 7: RAG Chat API

```typescript
// app/api/chat/rag/route.ts
import { retrieveContext } from '@/lib/ai/rag/retrieval';
import { createChatCompletion } from '@/lib/ai/providers/openai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { question, userId, documentIds } = await req.json();

  try {
    // Retrieve relevant context
    const context = await retrieveContext(question, {
      topK: 5,
      maxTokens: 2000,
      userId,
      documentIds
    });

    if (!context) {
      return Response.json({
        answer: "I couldn't find relevant information in your documents to answer that question.",
        sources: []
      });
    }

    // Generate answer with context
    const response = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: `Answer questions based only on the provided context. If the answer isn't in the context, say so. Be concise and factual.`
        },
        {
          role: 'system',
          content: `Context:\n\n${context}`
        },
        {
          role: 'user',
          content: question
        }
      ],
      model: 'gpt-4-turbo-preview',
      temperature: 0.2 // Lower for factual accuracy
    });

    return Response.json({
      answer: response.content,
      usage: response.usage
    });
  } catch (error) {
    console.error('RAG error:', error);
    return Response.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
```

---

## Advanced Features

### Add Anthropic Claude Support

```typescript
// lib/ai/providers/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function createClaudeCompletion(config: any) {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: config.maxTokens || 1000,
    messages: config.messages
  });

  return {
    content: response.content[0].text,
    usage: response.usage
  };
}
```

### Add Response Caching

```typescript
// lib/ai/memory/cache.ts
import { createHash } from 'crypto';

// Simple in-memory cache (use Redis in production)
const cache = new Map<string, { response: string; timestamp: number }>();

function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex');
}

export async function getCachedResponse(prompt: string): Promise<string | null> {
  const key = hashPrompt(prompt);
  const cached = cache.get(key);

  if (!cached) return null;

  // Check if expired (1 hour TTL)
  if (Date.now() - cached.timestamp > 3600000) {
    cache.delete(key);
    return null;
  }

  return cached.response;
}

export async function cacheResponse(prompt: string, response: string): Promise<void> {
  const key = hashPrompt(prompt);
  cache.set(key, {
    response,
    timestamp: Date.now()
  });
}
```

---

## Production Deployment

### 1. Environment Variables

Ensure all required env vars are set in production:

```bash
# Vercel
vercel env add OPENAI_API_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... etc
```

### 2. Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
});

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
}
```

### 3. Error Monitoring

Add Sentry or similar:

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 4. Cost Alerts

```typescript
// lib/ai/cost/alerts.ts
export async function checkAndAlertUsage(userId: string) {
  const usage = await getUserUsage(userId, 'day');

  if (usage.cost > 10) {
    await sendAlert({
      to: getUserEmail(userId),
      subject: 'High AI Usage Alert',
      message: `Your AI usage today is $${usage.cost.toFixed(2)}`
    });
  }
}
```

---

## Troubleshooting

### Issue: Embeddings search returns no results

**Solution**: Check similarity threshold
```typescript
// Lower threshold
const results = await searchSimilarDocuments(query, { threshold: 0.5 });
```

### Issue: Rate limit errors from OpenAI

**Solution**: Implement retry with backoff
```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
}
```

### Issue: High costs

**Solutions**:
1. Use GPT-3.5 for simple tasks
2. Enable caching
3. Reduce max_tokens
4. Implement user quotas

### Issue: Slow embedding generation

**Solution**: Batch processing
```typescript
// Instead of one-by-one
const embeddings = await batchGenerateEmbeddings(texts); // Much faster!
```

---

## Next Steps

1. **Customize prompts** in `/lib/ai/prompts/`
2. **Add authentication** with Supabase Auth
3. **Build UI components** for chat and documents
4. **Set up monitoring** and alerts
5. **Test with real users** and iterate

For more details, see the comprehensive README.md and example-prompts-and-use-cases.md.

---

**Questions or issues?** Check the documentation or create an issue in the repository.
