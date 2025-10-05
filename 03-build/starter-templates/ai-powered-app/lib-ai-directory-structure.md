# lib/ai/ Directory Structure

Complete directory structure and file documentation for AI integration layer.

## Directory Tree

```
lib/ai/
├── providers/
│   ├── openai.ts              # OpenAI GPT integration
│   ├── anthropic.ts           # Anthropic Claude integration
│   ├── base-provider.ts       # Abstract base class for providers
│   ├── provider-factory.ts    # Provider selection and initialization
│   └── types.ts               # Shared types for all providers
│
├── rag/
│   ├── embeddings.ts          # Embedding generation (OpenAI, Cohere)
│   ├── vector-search.ts       # Supabase pgvector search operations
│   ├── chunking.ts            # Text chunking strategies
│   ├── retrieval.ts           # Context retrieval and ranking
│   ├── document-processor.ts  # File upload and processing pipeline
│   └── hybrid-search.ts       # Vector + keyword search combination
│
├── prompts/
│   ├── templates.ts           # Reusable prompt templates
│   ├── system-prompts.ts      # System prompts by use case
│   ├── few-shot.ts            # Few-shot learning examples
│   ├── prompt-builder.ts      # Dynamic prompt construction
│   └── validators.ts          # Prompt validation and testing
│
├── streaming/
│   ├── stream-handler.ts      # Server-side streaming logic
│   ├── sse.ts                 # Server-Sent Events utilities
│   ├── client-stream.ts       # Client-side stream consumption
│   └── stream-transformer.ts  # Stream data transformation
│
├── cost/
│   ├── token-counter.ts       # Accurate token counting (tiktoken)
│   ├── pricing.ts             # Cost calculation for all models
│   ├── tracker.ts             # Usage tracking and logging
│   ├── budget.ts              # Budget enforcement
│   └── optimizer.ts           # Cost optimization recommendations
│
├── memory/
│   ├── conversation.ts        # Conversation history management
│   ├── cache.ts               # Response caching (Redis)
│   ├── semantic-cache.ts      # Semantic similarity caching
│   ├── context-window.ts      # Context window management
│   └── summarization.ts       # Conversation summarization
│
├── tools/
│   ├── function-calling.ts    # OpenAI function calling
│   ├── tool-definitions.ts    # Tool/function schemas
│   ├── tool-executor.ts       # Execute called functions
│   └── tool-validator.ts      # Validate tool outputs
│
├── safety/
│   ├── moderation.ts          # Content moderation (OpenAI)
│   ├── pii-detection.ts       # Detect and anonymize PII
│   ├── rate-limiter.ts        # Rate limiting per user
│   └── content-filter.ts      # Custom content filtering
│
├── evaluation/
│   ├── quality-metrics.ts     # Response quality evaluation
│   ├── a-b-testing.ts         # A/B test different prompts/models
│   ├── benchmarks.ts          # Performance benchmarking
│   └── feedback.ts            # User feedback collection
│
└── utils/
    ├── errors.ts              # Custom error classes
    ├── retry.ts               # Retry logic with backoff
    ├── timeout.ts             # Request timeout handling
    ├── logger.ts              # Structured logging
    └── validators.ts          # Input/output validation
```

## File Descriptions

### providers/

#### openai.ts
```typescript
/**
 * OpenAI GPT integration
 *
 * Features:
 * - Chat completions (GPT-3.5, GPT-4)
 * - Streaming responses
 * - Function calling
 * - Embeddings generation
 * - Vision (GPT-4V)
 *
 * Usage:
 * import { createChatCompletion, streamChatCompletion } from '@/lib/ai/providers/openai';
 */

export async function createChatCompletion(config: ChatCompletionConfig): Promise<ChatResponse>
export async function streamChatCompletion(config: StreamConfig): AsyncIterable<string>
export async function generateEmbedding(text: string): Promise<number[]>
export async function moderateContent(text: string): Promise<ModerationResult>
```

#### anthropic.ts
```typescript
/**
 * Anthropic Claude integration
 *
 * Features:
 * - Claude-3 models (Haiku, Sonnet, Opus)
 * - Streaming responses
 * - Extended context (200k tokens)
 * - Tool use
 *
 * Usage:
 * import { createClaudeCompletion } from '@/lib/ai/providers/anthropic';
 */

export async function createClaudeCompletion(config: ClaudeConfig): Promise<ClaudeResponse>
export async function streamClaudeCompletion(config: StreamConfig): AsyncIterable<string>
```

#### base-provider.ts
```typescript
/**
 * Abstract base class for AI providers
 * Ensures consistent interface across providers
 */

export abstract class BaseAIProvider {
  abstract generate(messages: Message[]): Promise<string>;
  abstract stream(messages: Message[]): AsyncIterable<string>;
  abstract embed(text: string): Promise<number[]>;
  abstract countTokens(text: string): number;
  abstract calculateCost(inputTokens: number, outputTokens: number): number;
}
```

#### provider-factory.ts
```typescript
/**
 * Factory for creating and managing AI providers
 * Handles provider selection, fallbacks, and load balancing
 */

export function getProvider(name?: string): BaseAIProvider
export function getAllProviders(): BaseAIProvider[]
export async function executeWithFallback(fn: () => Promise<T>): Promise<T>
```

### rag/

#### embeddings.ts
```typescript
/**
 * Embedding generation for semantic search
 *
 * Supports:
 * - OpenAI text-embedding-3-small/large
 * - Cohere embeddings
 * - Custom embedding models
 *
 * Features:
 * - Batch processing
 * - Caching
 * - Dimension reduction
 */

export async function generateEmbedding(text: string, model?: string): Promise<number[]>
export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]>
export async function getCachedEmbedding(text: string): Promise<number[] | null>
```

#### vector-search.ts
```typescript
/**
 * Vector similarity search using Supabase pgvector
 *
 * Operations:
 * - Similarity search (cosine, L2, inner product)
 * - Filtering by metadata
 * - Hybrid search (vector + keyword)
 * - Re-ranking
 */

export async function searchSimilar(query: string, options: SearchOptions): Promise<Document[]>
export async function storeEmbeddings(embeddings: EmbeddingData[]): Promise<void>
export async function deleteEmbeddings(documentId: string): Promise<void>
```

#### chunking.ts
```typescript
/**
 * Text chunking strategies for RAG
 *
 * Strategies:
 * - Fixed-size chunks
 * - Sentence-aware chunking
 * - Paragraph-aware chunking
 * - Semantic chunking
 * - Sliding window with overlap
 */

export function chunkText(text: string, options: ChunkOptions): Chunk[]
export function estimateChunks(text: string, chunkSize: number): number
export function mergeChunks(chunks: Chunk[]): string
```

#### retrieval.ts
```typescript
/**
 * Context retrieval and ranking
 *
 * Features:
 * - Multi-query retrieval
 * - Re-ranking by relevance
 * - Diversity sampling
 * - Token budget management
 */

export async function retrieveContext(query: string, options: RetrievalOptions): Promise<string>
export async function rerank(documents: Document[], query: string): Promise<Document[]>
export async function diversifySample(documents: Document[], k: number): Promise<Document[]>
```

#### document-processor.ts
```typescript
/**
 * File upload and processing pipeline
 *
 * Supported formats:
 * - PDF (pdf-parse)
 * - Word (mammoth)
 * - Text files
 * - Markdown
 * - CSV
 * - JSON
 *
 * Pipeline:
 * 1. Extract text
 * 2. Clean and normalize
 * 3. Chunk
 * 4. Generate embeddings
 * 5. Store in vector DB
 */

export async function processDocument(file: File, userId: string): Promise<ProcessResult>
export async function extractText(file: File): Promise<string>
export async function deleteDocument(documentId: string): Promise<void>
```

### prompts/

#### templates.ts
```typescript
/**
 * Reusable prompt templates
 *
 * Categories:
 * - Summarization
 * - Translation
 * - Extraction
 * - Classification
 * - Generation
 * - Q&A
 */

export const PROMPT_TEMPLATES = {
  summarize: (text: string, maxWords: number) => string,
  translate: (text: string, targetLang: string) => string,
  extract: (text: string, fields: string[]) => string,
  classify: (text: string, categories: string[]) => string,
  ragQuery: (context: string, question: string) => string
}
```

#### system-prompts.ts
```typescript
/**
 * System prompts by use case
 *
 * Use cases:
 * - Customer support
 * - Content writing
 * - Code assistant
 * - Data analyst
 * - Teacher/tutor
 */

export const SYSTEM_PROMPTS = {
  customerSupport: string,
  contentWriter: string,
  codeAssistant: string,
  dataAnalyst: string,
  teacher: string
}
```

#### few-shot.ts
```typescript
/**
 * Few-shot learning examples
 *
 * Improves:
 * - Accuracy
 * - Consistency
 * - Format compliance
 */

export function buildFewShotPrompt(task: string, examples: Example[]): string
export const FEW_SHOT_EXAMPLES = {
  intentClassification: Example[],
  entityExtraction: Example[],
  sentimentAnalysis: Example[]
}
```

### streaming/

#### stream-handler.ts
```typescript
/**
 * Server-side streaming logic
 *
 * Features:
 * - Token-by-token streaming
 * - Progress tracking
 * - Error handling
 * - Cancellation
 */

export async function handleStream(
  aiStream: AsyncIterable<string>,
  callbacks: StreamCallbacks
): Promise<string>

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}
```

#### sse.ts
```typescript
/**
 * Server-Sent Events utilities
 *
 * For real-time streaming to client
 */

export function createSSEStream(iterator: AsyncIterable<string>): ReadableStream
export function parseSSEMessage(data: string): any
export function formatSSEMessage(data: any): string
```

### cost/

#### token-counter.ts
```typescript
/**
 * Accurate token counting using tiktoken
 *
 * Models supported:
 * - GPT-3.5 (cl100k_base)
 * - GPT-4 (cl100k_base)
 * - Claude (custom tokenizer)
 */

export function countTokens(text: string, model: string): number
export function countMessageTokens(messages: Message[], model: string): number
export function estimateTokens(text: string): number
export function truncateToTokenLimit(text: string, limit: number): string
```

#### pricing.ts
```typescript
/**
 * Cost calculation for all models
 *
 * Updated pricing as of 2024
 */

export const PRICING: Record<Model, { input: number; output: number }>
export function calculateCost(inputTokens: number, outputTokens: number, model: Model): number
export function estimateCost(config: CompletionConfig): number
export function compareProviderCosts(task: Task): CostComparison
```

#### tracker.ts
```typescript
/**
 * Usage tracking and logging
 *
 * Tracks:
 * - Tokens used
 * - Costs
 * - Latency
 * - Success/failure
 *
 * Stores in Supabase usage_logs table
 */

export async function trackUsage(data: UsageData): Promise<void>
export async function getUserUsage(userId: string, period: Period): Promise<Usage>
export async function getSystemUsage(period: Period): Promise<SystemUsage>
```

#### budget.ts
```typescript
/**
 * Budget enforcement and alerts
 *
 * Features:
 * - Per-request limits
 * - Daily/monthly limits
 * - User tier-based limits
 * - Cost alerts
 */

export async function checkBudget(userId: string, estimatedCost: number): Promise<boolean>
export async function enforceLimit(userId: string, tier: Tier): Promise<void>
export async function sendCostAlert(userId: string, usage: Usage): Promise<void>
```

### memory/

#### conversation.ts
```typescript
/**
 * Conversation history management
 *
 * Features:
 * - Message pruning
 * - Token budget management
 * - Auto-summarization
 * - Persistent storage
 */

export class ConversationMemory {
  addMessage(role: string, content: string): void
  getMessages(): Message[]
  pruneMessages(maxTokens: number): void
  summarize(): Promise<void>
  save(): Promise<void>
  load(conversationId: string): Promise<void>
}
```

#### cache.ts
```typescript
/**
 * Response caching with Redis
 *
 * Cache strategies:
 * - Exact match caching
 * - Prefix caching
 * - Semantic caching (via embeddings)
 */

export async function getCachedResponse(prompt: string): Promise<string | null>
export async function cacheResponse(prompt: string, response: string, ttl?: number): Promise<void>
export async function invalidateCache(pattern: string): Promise<void>
```

#### semantic-cache.ts
```typescript
/**
 * Semantic similarity caching
 *
 * More flexible than exact match:
 * - Finds similar queries
 * - Returns cached response if above threshold
 * - Reduces redundant API calls
 */

export async function semanticCacheLookup(query: string, threshold?: number): Promise<string | null>
export async function semanticCacheStore(query: string, response: string): Promise<void>
```

### tools/

#### function-calling.ts
```typescript
/**
 * OpenAI function calling / tool use
 *
 * Enables AI to:
 * - Call external APIs
 * - Query databases
 * - Perform calculations
 * - Execute custom logic
 */

export async function completionWithTools(
  messages: Message[],
  tools: Tool[]
): Promise<ToolResponse>

export function parseToolCall(response: any): ToolCall
export async function executeToolCall(toolCall: ToolCall): Promise<any>
```

#### tool-definitions.ts
```typescript
/**
 * Tool/function schemas
 *
 * Pre-defined tools:
 * - get_weather
 * - search_database
 * - send_email
 * - calculate
 * - get_user_info
 */

export const TOOL_DEFINITIONS: Record<string, ToolDefinition>
export function createToolDefinition(name: string, schema: JSONSchema): ToolDefinition
```

### safety/

#### moderation.ts
```typescript
/**
 * Content moderation using OpenAI Moderation API
 *
 * Detects:
 * - Hate speech
 * - Self-harm
 * - Sexual content
 * - Violence
 * - Harassment
 */

export async function moderateContent(text: string): Promise<ModerationResult>
export async function moderateConversation(messages: Message[]): Promise<ModerationResult>
export function isSafe(result: ModerationResult): boolean
```

#### pii-detection.ts
```typescript
/**
 * Detect and anonymize PII
 *
 * Detects:
 * - Email addresses
 * - Phone numbers
 * - SSN
 * - Credit card numbers
 * - IP addresses
 * - Names (NER)
 */

export function detectPII(text: string): PIIDetection[]
export function anonymizePII(text: string): string
export function redactPII(text: string, piiTypes: PIIType[]): string
```

#### rate-limiter.ts
```typescript
/**
 * Rate limiting per user
 *
 * Uses Upstash Redis for distributed rate limiting
 *
 * Limits:
 * - Requests per minute
 * - Tokens per minute
 * - Requests per day
 */

export async function checkRateLimit(userId: string): Promise<RateLimitResult>
export async function consumeRateLimit(userId: string, tokens: number): Promise<void>
export async function getRateLimitStatus(userId: string): Promise<RateLimitStatus>
```

### evaluation/

#### quality-metrics.ts
```typescript
/**
 * Response quality evaluation
 *
 * Metrics:
 * - Relevance
 * - Coherence
 * - Factuality
 * - Completeness
 * - User satisfaction
 */

export async function evaluateResponse(
  query: string,
  response: string,
  context?: string
): Promise<QualityMetrics>

export function calculateRelevanceScore(query: string, response: string): number
export function detectHallucination(response: string, context: string): boolean
```

#### a-b-testing.ts
```typescript
/**
 * A/B test different prompts and models
 *
 * Features:
 * - Variant assignment
 * - Performance tracking
 * - Statistical significance
 * - Winner selection
 */

export function assignVariant(userId: string, experiment: string): Variant
export async function trackExperiment(data: ExperimentData): Promise<void>
export async function analyzeExperiment(experimentId: string): Promise<Analysis>
```

### utils/

#### errors.ts
```typescript
/**
 * Custom error classes for AI operations
 */

export class AIProviderError extends Error
export class TokenLimitError extends Error
export class BudgetExceededError extends Error
export class RateLimitError extends Error
export class ModerationError extends Error
export class EmbeddingError extends Error
```

#### retry.ts
```typescript
/**
 * Retry logic with exponential backoff
 */

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T>

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (error: Error, attempt: number) => void;
}
```

## Usage Examples

### Example 1: Simple Chat

```typescript
import { createChatCompletion } from '@/lib/ai/providers/openai';

const response = await createChatCompletion({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is RAG?' }
  ],
  model: 'gpt-3.5-turbo'
});
```

### Example 2: RAG Query

```typescript
import { retrieveContext } from '@/lib/ai/rag/retrieval';
import { createChatCompletion } from '@/lib/ai/providers/openai';

const context = await retrieveContext(userQuestion, { topK: 5 });
const response = await createChatCompletion({
  messages: [
    { role: 'system', content: `Context: ${context}` },
    { role: 'user', content: userQuestion }
  ]
});
```

### Example 3: Streaming with Cost Tracking

```typescript
import { streamChatCompletion } from '@/lib/ai/providers/openai';
import { trackUsage } from '@/lib/ai/cost/tracker';

let fullResponse = '';
const stream = streamChatCompletion({
  messages,
  onToken: (token) => {
    fullResponse += token;
    updateUI(token);
  },
  onComplete: async (response) => {
    await trackUsage({
      userId,
      model: 'gpt-4',
      inputTokens: countMessageTokens(messages),
      outputTokens: countTokens(response),
      cost: calculateCost(...)
    });
  }
});
```

### Example 4: Document Processing

```typescript
import { processDocument } from '@/lib/ai/rag/document-processor';

const result = await processDocument(uploadedFile, userId);
// Document is chunked, embedded, and stored automatically
```

## Best Practices

1. **Always track costs** - Use the cost tracking utilities
2. **Implement rate limiting** - Protect against abuse
3. **Cache aggressively** - Reduce redundant API calls
4. **Use appropriate models** - GPT-3.5 for simple tasks, GPT-4 for complex
5. **Handle errors gracefully** - Implement fallbacks
6. **Monitor quality** - Track response quality metrics
7. **Respect privacy** - Anonymize PII before sending to AI
8. **Test thoroughly** - Use mock responses for testing
9. **Optimize prompts** - Iterate on prompts for better results
10. **Version control** - Track prompt and model versions

## Testing

Each module includes:
- Unit tests
- Integration tests
- Mock implementations for testing
- Example usage

Run tests:
```bash
npm test
```

## Performance Targets

- Embedding generation: < 200ms
- Vector search: < 100ms
- Streaming first token: < 500ms
- Cache lookup: < 10ms
- Rate limit check: < 5ms

## Security Considerations

- Never log API keys
- Sanitize user inputs
- Validate all outputs
- Implement content moderation
- Use row-level security in Supabase
- Encrypt sensitive data
- Rate limit all endpoints
- Monitor for abuse

---

This directory structure provides a complete, production-ready AI integration layer following Hermetic principles.
