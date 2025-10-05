/**
 * AI Chat Type Definitions
 */

export type AIProvider = 'openai' | 'anthropic';

export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

export interface Message {
  id?: string;
  role: MessageRole;
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
  tokens?: number;
  createdAt?: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  systemPrompt?: string;
  provider: AIProvider;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  functions?: ChatFunction[];
  functionCall?: 'auto' | 'none' | { name: string };
}

export interface ChatFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ChatRequest {
  messages: Message[];
  conversationId?: string;
  userId: string;
  options?: ChatOptions;
}

export interface ChatResponse {
  message: Message;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
}

export interface TokenUsage {
  provider: AIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  createdAt: Date;
}

export interface UsageStats {
  totalTokens: number;
  totalCost: number;
  messagesCount: number;
  conversationsCount: number;
}

export interface ModelConfig {
  name: string;
  provider: AIProvider;
  maxTokens: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  supportsStreaming: boolean;
  supportsFunctions: boolean;
}
