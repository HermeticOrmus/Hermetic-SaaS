/**
 * Unified Chat Request Handler
 *
 * Handles chat requests for both OpenAI and Claude
 */

import { streamOpenAIResponse } from './openai';
import { streamClaudeResponse } from './claude';
import type { ChatRequest } from '../types';

export async function handleChatRequest(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, userId, options = {} } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400 }
      );
    }

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages are required' }),
        { status: 400 }
      );
    }

    const provider = options.provider || 'openai';

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let responseStream;

          if (provider === 'openai') {
            responseStream = streamOpenAIResponse(messages, options);
          } else if (provider === 'anthropic') {
            const systemPrompt = messages.find((m) => m.role === 'system')?.content;
            responseStream = streamClaudeResponse(messages, systemPrompt, options);
          } else {
            throw new Error(`Unknown provider: ${provider}`);
          }

          for await (const chunk of responseStream) {
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('Streaming error:', error);
          const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500 }
    );
  }
}
