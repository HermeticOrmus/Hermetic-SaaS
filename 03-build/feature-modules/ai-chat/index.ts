/**
 * AI Chat Module - Export Index
 *
 * Import everything you need from a single entry point
 */

// Components
export { ChatInterface } from './components/ChatInterface';
export { ChatMessage } from './components/ChatMessage';
export { ChatInput } from './components/ChatInput';

// Hooks
export { useChat } from './hooks/useChat';

// API
export {
  sendOpenAIMessage,
  streamOpenAIMessage,
  streamOpenAIResponse,
} from './api/openai';

export {
  sendClaudeMessage,
  streamClaudeMessage,
  streamClaudeResponse,
} from './api/claude';

export { handleChatRequest } from './api/chat-handler';

// Utils
export {
  calculateCost,
  estimateCost,
  getModelConfig,
  getModelsByProvider,
  MODEL_CONFIGS,
} from './utils/pricing';

// Types
export type {
  AIProvider,
  MessageRole,
  Message,
  Conversation,
  ChatOptions,
  ChatFunction,
  ChatRequest,
  ChatResponse,
  TokenUsage,
  UsageStats,
  ModelConfig,
} from './types';
