/**
 * AI Pricing and Cost Calculation
 */

import type { AIProvider, ModelConfig } from '../types';

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4-turbo-preview': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03,
    supportsStreaming: true,
    supportsFunctions: true,
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    inputCostPer1k: 0.03,
    outputCostPer1k: 0.06,
    supportsStreaming: true,
    supportsFunctions: true,
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 16385,
    inputCostPer1k: 0.0015,
    outputCostPer1k: 0.002,
    supportsStreaming: true,
    supportsFunctions: true,
  },
  'claude-3-opus-20240229': {
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
    supportsStreaming: true,
    supportsFunctions: false,
  },
  'claude-3-sonnet-20240229': {
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    supportsStreaming: true,
    supportsFunctions: false,
  },
  'claude-3-haiku-20240307': {
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    maxTokens: 200000,
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
    supportsStreaming: true,
    supportsFunctions: false,
  },
};

interface CalculateCostOptions {
  provider: AIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
}

/**
 * Calculate cost for AI request
 */
export function calculateCost(options: CalculateCostOptions): number {
  const { model, promptTokens, completionTokens } = options;

  const config = MODEL_CONFIGS[model];
  if (!config) {
    console.warn(`Unknown model: ${model}, using default pricing`);
    return 0;
  }

  const inputCost = (promptTokens / 1000) * config.inputCostPer1k;
  const outputCost = (completionTokens / 1000) * config.outputCostPer1k;

  return inputCost + outputCost;
}

/**
 * Estimate cost before sending
 */
export function estimateCost(
  provider: AIProvider,
  model: string,
  estimatedTokens: number
): number {
  const config = MODEL_CONFIGS[model];
  if (!config) return 0;

  // Assume 70% input, 30% output ratio
  const inputTokens = Math.floor(estimatedTokens * 0.7);
  const outputTokens = Math.floor(estimatedTokens * 0.3);

  return calculateCost({
    provider,
    model,
    promptTokens: inputTokens,
    completionTokens: outputTokens,
  });
}

/**
 * Get model by provider and name
 */
export function getModelConfig(model: string): ModelConfig | undefined {
  return MODEL_CONFIGS[model];
}

/**
 * List available models by provider
 */
export function getModelsByProvider(provider: AIProvider): ModelConfig[] {
  return Object.values(MODEL_CONFIGS).filter((m) => m.provider === provider);
}
