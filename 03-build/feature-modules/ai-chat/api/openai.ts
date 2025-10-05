/**
 * OpenAI API Integration
 */

import OpenAI from 'openai';
import type { Message, ChatOptions } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendOpenAIMessage(
  messages: Message[],
  options: ChatOptions = {}
) {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 2000,
    topP = 1,
    frequencyPenalty = 0,
    presencePenalty = 0,
    stream = false,
    functions,
    functionCall,
  } = options;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role as any,
        content: m.content,
        name: m.name,
        function_call: m.functionCall,
      })),
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream,
      ...(functions && { functions }),
      ...(functionCall && { function_call: functionCall }),
    });

    return completion;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(error.message || 'Failed to send message to OpenAI');
  }
}

export async function streamOpenAIMessage(
  messages: Message[],
  options: ChatOptions = {}
) {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role as any,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    return stream;
  } catch (error: any) {
    console.error('OpenAI streaming error:', error);
    throw new Error(error.message || 'Failed to stream from OpenAI');
  }
}

export async function* streamOpenAIResponse(
  messages: Message[],
  options: ChatOptions = {}
) {
  const stream = await streamOpenAIMessage(messages, options);

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}
