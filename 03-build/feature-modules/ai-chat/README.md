# AI Chat Module

Production-ready AI chat interface with OpenAI and Claude integration. Copy-paste into any MicroSaaS app.

## Features

- Chat interface component
- OpenAI GPT-4 integration
- Anthropic Claude integration
- Streaming responses
- Conversation memory
- Token tracking and limits
- Message history persistence
- Context management
- Custom system prompts
- Function calling support

## Installation

```bash
npm install openai @anthropic-ai/sdk
```

## Environment Variables

Add to your `.env.local`:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Choose default provider
DEFAULT_AI_PROVIDER=openai  # or 'anthropic'
```

## Quick Start

### 1. Add Chat Interface

```tsx
import { ChatInterface } from '@/features/ai-chat/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-screen">
      <ChatInterface
        userId={user.id}
        systemPrompt="You are a helpful assistant."
      />
    </div>
  );
}
```

### 2. Create API Route

Create `app/api/chat/route.ts`:

```tsx
import { handleChatRequest } from '@/features/ai-chat/api/chat-handler';

export async function POST(request: Request) {
  return handleChatRequest(request);
}
```

### 3. Track Usage

```tsx
import { useTokenUsage } from '@/features/ai-chat/hooks/useTokenUsage';

const { totalTokens, cost } = useTokenUsage(userId);
```

## Components

### ChatInterface
Full-featured chat UI with message history.

```tsx
<ChatInterface
  userId={user.id}
  conversationId="conv_123"
  systemPrompt="Custom instructions"
  provider="openai"
  model="gpt-4-turbo-preview"
  temperature={0.7}
  maxTokens={2000}
  onMessageSent={(message) => console.log(message)}
/>
```

### ChatMessage
Individual message component.

```tsx
<ChatMessage
  role="assistant"
  content="Hello! How can I help you?"
  timestamp={new Date()}
/>
```

### ChatInput
Message input with send button.

```tsx
<ChatInput
  onSend={(message) => handleSend(message)}
  disabled={loading}
  placeholder="Type your message..."
/>
```

### StreamingMessage
Display streaming AI responses.

```tsx
<StreamingMessage
  content={streamContent}
  isComplete={isComplete}
/>
```

## Hooks

### useChat
Main chat hook with message management.

```tsx
const {
  messages,
  loading,
  error,
  sendMessage,
  clearMessages,
  retryLastMessage,
} = useChat({
  userId: user.id,
  conversationId: 'conv_123',
  provider: 'openai',
});

await sendMessage('Hello!');
```

### useTokenUsage
Track token usage and costs.

```tsx
const {
  totalTokens,
  cost,
  messagesCount,
  loading,
} = useTokenUsage(userId);
```

### useConversations
Manage conversation history.

```tsx
const {
  conversations,
  loading,
  createConversation,
  deleteConversation,
} = useConversations(userId);
```

## API Functions

### sendOpenAIMessage
Send message to OpenAI.

```tsx
import { sendOpenAIMessage } from '@/features/ai-chat/api/openai';

const response = await sendOpenAIMessage({
  messages: [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hello!' },
  ],
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  stream: true,
});
```

### sendClaudeMessage
Send message to Claude.

```tsx
import { sendClaudeMessage } from '@/features/ai-chat/api/claude';

const response = await sendClaudeMessage({
  messages: [
    { role: 'user', content: 'Hello!' },
  ],
  system: 'You are helpful.',
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
  stream: true,
});
```

## Database Schema

Add to your Supabase schema:

```sql
-- Conversations table
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  system_prompt text,
  provider text not null,
  model text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  role text not null,
  content text not null,
  tokens integer,
  created_at timestamp with time zone default now()
);

-- Token usage tracking
create table ai_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  provider text not null,
  model text not null,
  prompt_tokens integer not null,
  completion_tokens integer not null,
  total_tokens integer not null,
  cost numeric(10, 6) not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table conversations enable row level security;
alter table messages enable row level security;
alter table ai_usage enable row level security;

-- Create policies
create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

create policy "Users can view messages from own conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own conversations"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can view own usage"
  on ai_usage for select
  using (auth.uid() = user_id);
```

## Streaming Responses

### Server-Side Streaming

```tsx
import { streamOpenAIResponse } from '@/features/ai-chat/utils/streaming';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = await streamOpenAIResponse({
    messages,
    model: 'gpt-4-turbo-preview',
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Client-Side Streaming

```tsx
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  setStreamContent(prev => prev + text);
}
```

## Function Calling

### Define Functions

```tsx
const functions = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name',
        },
      },
      required: ['location'],
    },
  },
];
```

### Handle Function Calls

```tsx
const response = await sendOpenAIMessage({
  messages,
  functions,
  functionCall: 'auto',
});

if (response.function_call) {
  const args = JSON.parse(response.function_call.arguments);
  const result = await getWeather(args.location);

  // Send function result back
  await sendOpenAIMessage({
    messages: [
      ...messages,
      response,
      {
        role: 'function',
        name: 'get_weather',
        content: JSON.stringify(result),
      },
    ],
  });
}
```

## Token Management

### Calculate Costs

```tsx
import { calculateCost } from '@/features/ai-chat/utils/pricing';

const cost = calculateCost({
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  promptTokens: 100,
  completionTokens: 200,
});
```

### Set Usage Limits

```tsx
import { checkUsageLimit } from '@/features/ai-chat/utils/limits';

const canSend = await checkUsageLimit({
  userId: user.id,
  maxTokensPerDay: 100000,
  maxCostPerMonth: 50,
});

if (!canSend) {
  throw new Error('Usage limit reached');
}
```

## Best Practices

1. **System Prompts**: Define clear, specific system prompts
2. **Context Management**: Keep conversation context under token limits
3. **Error Handling**: Gracefully handle API failures
4. **Rate Limiting**: Implement usage limits per user
5. **Cost Tracking**: Monitor and alert on high usage
6. **Streaming**: Use streaming for better UX
7. **Caching**: Cache common responses
8. **Moderation**: Filter inappropriate content

## Model Options

### OpenAI Models

```tsx
const models = {
  'gpt-4-turbo-preview': { maxTokens: 128000, costPer1k: 0.01 },
  'gpt-4': { maxTokens: 8192, costPer1k: 0.03 },
  'gpt-3.5-turbo': { maxTokens: 16385, costPer1k: 0.0015 },
};
```

### Claude Models

```tsx
const models = {
  'claude-3-opus-20240229': { maxTokens: 200000, costPer1k: 0.015 },
  'claude-3-sonnet-20240229': { maxTokens: 200000, costPer1k: 0.003 },
  'claude-3-haiku-20240307': { maxTokens: 200000, costPer1k: 0.00025 },
};
```

## Advanced Features

### Context Window Management

Automatically truncate old messages to fit context window:

```tsx
import { truncateMessages } from '@/features/ai-chat/utils/context';

const truncated = truncateMessages(messages, {
  maxTokens: 4000,
  keepSystemPrompt: true,
  keepRecentMessages: 5,
});
```

### Conversation Summarization

Summarize long conversations:

```tsx
import { summarizeConversation } from '@/features/ai-chat/utils/summarize';

const summary = await summarizeConversation(messages);
```

### Message Branching

Create alternative conversation branches:

```tsx
const { createBranch } = useConversationBranching();

await createBranch({
  conversationId,
  fromMessageId,
  newMessage,
});
```

## Troubleshooting

### API Rate Limits
- Implement exponential backoff
- Show user-friendly error messages
- Queue messages when rate limited

### Token Limits
- Monitor conversation length
- Implement context window management
- Summarize old messages

### Streaming Issues
- Handle network disconnections
- Implement retry logic
- Show loading states

## Production Checklist

- [ ] Add API key rotation
- [ ] Implement rate limiting
- [ ] Set up usage monitoring
- [ ] Configure content moderation
- [ ] Add error tracking
- [ ] Set cost alerts
- [ ] Test streaming edge cases
- [ ] Implement message persistence
- [ ] Add conversation export
- [ ] Configure backup providers

## License

MIT - Free to use in commercial projects
