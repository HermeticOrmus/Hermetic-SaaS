/**
 * Anthropic Claude API Integration
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Message, ChatOptions } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function sendClaudeMessage(
  messages: Message[],
  systemPrompt?: string,
  options: ChatOptions = {}
) {
  const {
    model = 'claude-3-opus-20240229',
    temperature = 0.7,
    maxTokens = 2000,
    topP = 1,
    stream = false,
  } = options;

  // Filter out system messages (Claude uses separate system parameter)
  const filteredMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      system: systemPrompt,
      messages: filteredMessages,
      stream,
    });

    return response;
  } catch (error: any) {
    console.error('Claude API error:', error);
    throw new Error(error.message || 'Failed to send message to Claude');
  }
}

export async function streamClaudeMessage(
  messages: Message[],
  systemPrompt?: string,
  options: ChatOptions = {}
) {
  const {
    model = 'claude-3-opus-20240229',
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  const filteredMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  try {
    const stream = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: filteredMessages,
      stream: true,
    });

    return stream;
  } catch (error: any) {
    console.error('Claude streaming error:', error);
    throw new Error(error.message || 'Failed to stream from Claude');
  }
}

export async function* streamClaudeResponse(
  messages: Message[],
  systemPrompt?: string,
  options: ChatOptions = {}
) {
  const stream = await streamClaudeMessage(messages, systemPrompt, options);

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
