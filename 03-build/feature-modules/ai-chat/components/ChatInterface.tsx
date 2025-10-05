/**
 * ChatInterface Component
 *
 * Full-featured chat UI with message history and streaming
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import type { AIProvider } from '../types';

interface ChatInterfaceProps {
  userId: string;
  conversationId?: string;
  systemPrompt?: string;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  className?: string;
}

export function ChatInterface({
  userId,
  conversationId,
  systemPrompt = 'You are a helpful assistant.',
  provider = 'openai',
  model = 'gpt-4-turbo-preview',
  temperature = 0.7,
  maxTokens = 2000,
  className = '',
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    error,
    streamingContent,
    sendMessage,
    clearMessages,
    retryLastMessage,
  } = useChat({
    userId,
    conversationId,
    systemPrompt,
    provider,
    model,
    temperature,
    maxTokens,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI Assistant ({provider === 'openai' ? 'OpenAI' : 'Claude'})
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Type a message below to get started
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            role={message.role}
            content={message.content}
            timestamp={message.createdAt}
          />
        ))}

        {streamingContent && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                {messages.length > 0 && (
                  <button
                    onClick={retryLastMessage}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <ChatInput
          onSend={handleSend}
          disabled={loading}
          placeholder="Type your message..."
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {loading ? 'AI is thinking...' : `Model: ${model}`}
        </p>
      </div>
    </div>
  );
}
