/**
 * ChatMessage Component
 *
 * Individual message display
 */

'use client';

import React from 'react';
import type { MessageRole } from '../types';

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  className?: string;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming = false,
  className = '',
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}
      >
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <span className="ml-2 text-xs font-medium opacity-75">
              Assistant
            </span>
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap break-words">
            {content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
        </div>

        {timestamp && !isStreaming && (
          <div
            className={`mt-2 text-xs ${
              isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
