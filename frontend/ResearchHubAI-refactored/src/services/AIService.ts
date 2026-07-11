import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { AIRequest, AIChatResponse, AIProviderInfo, AIStreamChunk } from "../types/AI";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class AIService {
  async getProviders(): Promise<AIProviderInfo[]> {
    const res = await apiClient.get<AIProviderInfo[]>(ENDPOINTS.ai.providers);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get providers");
    return res.data;
  }

  async sendChat(request: AIRequest, provider?: string): Promise<AIChatResponse> {
    const path = provider
      ? `${ENDPOINTS.ai.chat}?provider=${encodeURIComponent(provider)}`
      : ENDPOINTS.ai.chat;
    const res = await apiClient.post<AIChatResponse>(path, request);
    if (!res.success || !res.data) throw new Error(res.message || "AI chat failed");
    return res.data;
  }

  async *streamChat(
    request: AIRequest,
    provider?: string,
    signal?: AbortSignal,
  ): AsyncGenerator<AIStreamChunk> {
    const path = provider
      ? `${ENDPOINTS.ai.stream}?provider=${encodeURIComponent(provider)}`
      : ENDPOINTS.ai.stream;

    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Stream request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            yield {
              content: parsed.content ?? "",
              finishReason: parsed.finishReason ?? null,
              isComplete: parsed.isComplete ?? !!parsed.finishReason,
            } as AIStreamChunk;
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const aiService = new AIService();
