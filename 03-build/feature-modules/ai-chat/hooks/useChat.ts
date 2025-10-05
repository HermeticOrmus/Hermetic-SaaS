/**
 * useChat Hook
 *
 * Main chat hook with message management and streaming
 */

'use client';

import { useState, useCallback } from 'react';
import type { Message, AIProvider } from '../types';

interface UseChatOptions {
  userId: string;
  conversationId?: string;
  systemPrompt?: string;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export function useChat(options: UseChatOptions) {
  const {
    userId,
    conversationId,
    systemPrompt,
    provider = 'openai',
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      setLoading(true);
      setStreamingContent('');

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...(systemPrompt
                ? [{ role: 'system', content: systemPrompt }]
                : []),
              ...messages,
              userMessage,
            ],
            conversationId,
            userId,
            options: {
              provider,
              model,
              temperature,
              maxTokens,
              stream: true,
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to send message');
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    fullContent += parsed.content;
                    setStreamingContent(fullContent);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        // Add assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullContent,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
      } catch (err: any) {
        console.error('Chat error:', err);
        setError(err.message || 'Failed to send message');
      } finally {
        setLoading(false);
      }
    },
    [messages, conversationId, userId, systemPrompt, provider, model, temperature, maxTokens]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    if (messages.length === 0) return;

    // Find last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');

    if (lastUserMessage) {
      // Remove messages after last user message
      const index = messages.indexOf(lastUserMessage);
      setMessages(messages.slice(0, index));
      // Resend
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    loading,
    error,
    streamingContent,
    sendMessage,
    clearMessages,
    retryLastMessage,
  };
}
