export interface AIMessage {
  role: string;
  content: string;
}

export interface AIOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  additionalParameters?: Record<string, string>;
}

export interface AIRequest {
  messages: AIMessage[];
  options?: AIOptions;
  systemPrompt?: string;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIChatResponse {
  content: string;
  model: string | null;
  usage: AIUsage | null;
  finishReason: string | null;
  responseTimeMs: number;
  provider: string;
}

export interface AIStreamChunk {
  content: string;
  finishReason: string | null;
  isComplete: boolean;
}

export interface AIProviderInfo {
  name: string;
  model: string;
  isEnabled: boolean;
}

export interface AIChatHistoryEntry {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  responseTimeMs: number;
  usage: AIUsage | null;
  timestamp: number;
}

export const AI_PROVIDER_PRICING: Record<string, { prompt: number; completion: number }> = {
  OpenAI: { prompt: 0.0025, completion: 0.01 },
  Anthropic: { prompt: 0.015, completion: 0.075 },
  Gemini: { prompt: 0.00125, completion: 0.005 },
};

export function estimateCost(provider: string, usage: AIUsage | null): number {
  if (!usage) return 0;
  const pricing = AI_PROVIDER_PRICING[provider];
  if (!pricing) return 0;
  const promptCost = (usage.promptTokens / 1000) * pricing.prompt;
  const completionCost = (usage.completionTokens / 1000) * pricing.completion;
  return promptCost + completionCost;
}
