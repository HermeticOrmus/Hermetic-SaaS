/**
 * AI Support Chatbot Integration
 *
 * OpenAI-powered support chatbot with function calling,
 * help docs context, and escalation to human support.
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

/**
 * AI Chatbot class with context and function calling
 */
export class SupportChatbot {
  private conversationHistory: ChatMessage[] = [];
  private userId: string;
  private userContext: any;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize chatbot with user context
   */
  async initialize() {
    this.userContext = await this.getUserContext();

    this.conversationHistory = [
      {
        role: 'system',
        content: this.getSystemPrompt(),
      },
    ];
  }

  /**
   * System prompt with context and personality
   */
  private getSystemPrompt(): string {
    return `You are a helpful support assistant for [Your SaaS Name].

Your goal is to help users quickly and efficiently by:
1. Understanding their issue
2. Providing clear, actionable solutions
3. Using help documentation when relevant
4. Escalating to human support when needed

User Context:
- Plan: ${this.userContext.plan}
- Account Age: ${this.userContext.accountAge} days
- Last Login: ${this.userContext.lastLogin}
- Active Subscription: ${this.userContext.hasActiveSubscription}

Guidelines:
- Be friendly, concise, and professional
- Ask clarifying questions when needed
- Provide step-by-step instructions
- Offer to escalate complex issues
- Never share sensitive information
- Reference documentation when helpful
- Suggest relevant features

Available Functions:
- searchHelpDocs: Search help documentation
- getUserAccount: Get user account details
- getSubscriptionInfo: Get subscription details
- createSupportTicket: Escalate to human support
- getRecentActivity: Check user's recent activity
- resetPassword: Send password reset email
- checkSystemStatus: Check if services are operational

If you don't know the answer, be honest and offer to escalate to a human.`;
  }

  /**
   * Get user context from database
   */
  private async getUserContext() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'active')
      .single();

    return {
      plan: subscription?.plan_name || 'Free',
      accountAge: Math.floor((Date.now() - new Date(user?.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      lastLogin: user?.last_login || 'Unknown',
      hasActiveSubscription: !!subscription,
    };
  }

  /**
   * Chat with the bot
   */
  async chat(userMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Get AI response with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: this.conversationHistory,
      functions: this.getFunctionDefinitions(),
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    });

    const message = response.choices[0].message;

    // Handle function calls
    if (message.function_call) {
      const functionResult = await this.handleFunctionCall(
        message.function_call.name,
        JSON.parse(message.function_call.arguments)
      );

      // Add function call and result to history
      this.conversationHistory.push({
        role: 'assistant',
        content: message.content || '',
        function_call: message.function_call,
      });

      this.conversationHistory.push({
        role: 'function',
        content: JSON.stringify(functionResult),
      });

      // Get final response with function result
      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
      });

      const finalMessage = finalResponse.choices[0].message.content || '';
      this.conversationHistory.push({
        role: 'assistant',
        content: finalMessage,
      });

      return finalMessage;
    }

    // Regular response without function call
    const assistantMessage = message.content || '';
    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
    });

    return assistantMessage;
  }

  /**
   * Function definitions for OpenAI
   */
  private getFunctionDefinitions() {
    return [
      {
        name: 'searchHelpDocs',
        description: 'Search help documentation for relevant articles',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'getUserAccount',
        description: 'Get user account details',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'getSubscriptionInfo',
        description: 'Get user subscription and billing info',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'createSupportTicket',
        description: 'Create a support ticket for human assistance',
        parameters: {
          type: 'object',
          properties: {
            subject: {
              type: 'string',
              description: 'Ticket subject',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the issue',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Ticket priority',
            },
          },
          required: ['subject', 'description', 'priority'],
        },
      },
      {
        name: 'getRecentActivity',
        description: 'Get user recent activity and usage',
        parameters: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to look back',
              default: 7,
            },
          },
        },
      },
      {
        name: 'resetPassword',
        description: 'Send password reset email to user',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'checkSystemStatus',
        description: 'Check if all systems are operational',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  /**
   * Handle function calls
   */
  private async handleFunctionCall(functionName: string, args: any): Promise<any> {
    switch (functionName) {
      case 'searchHelpDocs':
        return await this.searchHelpDocs(args.query);

      case 'getUserAccount':
        return await this.getUserAccount();

      case 'getSubscriptionInfo':
        return await this.getSubscriptionInfo();

      case 'createSupportTicket':
        return await this.createSupportTicket(args);

      case 'getRecentActivity':
        return await this.getRecentActivity(args.days || 7);

      case 'resetPassword':
        return await this.resetPassword();

      case 'checkSystemStatus':
        return await this.checkSystemStatus();

      default:
        return { error: 'Unknown function' };
    }
  }

  /**
   * Search help documentation
   */
  private async searchHelpDocs(query: string) {
    // In production, use vector search with embeddings
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Simple text search (upgrade to pgvector for production)
    const { data } = await supabase
      .from('help_docs')
      .select('*')
      .textSearch('content', query)
      .limit(3);

    return {
      results: data?.map(doc => ({
        title: doc.title,
        excerpt: doc.content.substring(0, 200),
        url: `/help/${doc.slug}`,
      })) || [],
    };
  }

  /**
   * Get user account details
   */
  private async getUserAccount() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();

    return {
      email: user?.email,
      createdAt: user?.created_at,
      lastLogin: user?.last_login,
      emailVerified: user?.email_verified,
    };
  }

  /**
   * Get subscription info
   */
  private async getSubscriptionInfo() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    return {
      plan: subscription?.plan_name || 'Free',
      status: subscription?.status || 'none',
      currentPeriodEnd: subscription?.current_period_end,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end,
    };
  }

  /**
   * Create support ticket
   */
  private async createSupportTicket(args: {
    subject: string;
    description: string;
    priority: string;
  }): Promise<SupportTicket> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: ticket } = await supabase
      .from('support_tickets')
      .insert({
        user_id: this.userId,
        subject: args.subject,
        description: args.description,
        priority: args.priority,
        status: 'open',
        source: 'ai_chatbot',
        conversation_history: JSON.stringify(this.conversationHistory),
      })
      .select()
      .single();

    // Send notification to support team
    await this.notifySupport(ticket);

    return ticket;
  }

  /**
   * Get recent activity
   */
  private async getRecentActivity(days: number) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      totalEvents: events?.length || 0,
      lastActivity: events?.[0]?.created_at || null,
      recentActions: events?.map(e => e.event_name) || [],
    };
  }

  /**
   * Send password reset
   */
  private async resetPassword() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', this.userId)
      .single();

    if (!user?.email) {
      return { error: 'User email not found' };
    }

    // Send reset email via Supabase Auth
    await supabase.auth.resetPasswordForEmail(user.email);

    return { success: true, message: 'Password reset email sent' };
  }

  /**
   * Check system status
   */
  private async checkSystemStatus() {
    // Import from uptime monitoring
    const { performHealthCheck } = await import('../monitoring-dashboards/uptime-monitoring');
    const health = await performHealthCheck();

    return {
      status: health.status,
      services: health.checks,
      message: health.status === 'healthy'
        ? 'All systems operational'
        : 'Some services are experiencing issues',
    };
  }

  /**
   * Notify support team of new ticket
   */
  private async notifySupport(ticket: any) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'support@yoursaas.com',
      to: process.env.SUPPORT_EMAIL!,
      subject: `[${ticket.priority.toUpperCase()}] New Support Ticket: ${ticket.subject}`,
      html: `
        <h2>New Support Ticket from AI Chatbot</h2>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Description:</strong></p>
        <p>${ticket.description}</p>
        <p><strong>User ID:</strong> ${this.userId}</p>
        <p><strong>Plan:</strong> ${this.userContext.plan}</p>
        <p><a href="https://yoursaas.com/admin/tickets/${ticket.id}">View Ticket</a></p>
      `,
    });
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation
   */
  async reset() {
    await this.initialize();
  }
}

/**
 * React component for chatbot UI
 */
export function ChatbotWidget() {
  return `
import { useState, useRef, useEffect } from 'react';
import { SupportChatbot } from './ai-chatbot-integration';

export function ChatbotWidget({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatbotRef = useRef<SupportChatbot | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatbotRef.current) {
      initChatbot();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function initChatbot() {
    chatbotRef.current = new SupportChatbot(userId);
    await chatbotRef.current.initialize();

    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI support assistant. How can I help you today?",
    }]);
  }

  async function sendMessage() {
    if (!input.trim() || !chatbotRef.current) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Get AI response
      const response = await chatbotRef.current.chat(userMessage);

      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or contact support.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h3 className="font-semibold">Support Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="hover:bg-purple-700 rounded p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={\`flex \${message.role === 'user' ? 'justify-end' : 'justify-start'}\`}
          >
            <div
              className={\`max-w-[80%] rounded-lg p-3 \${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }\`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
  `;
}
