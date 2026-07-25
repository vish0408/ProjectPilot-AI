import { apiClient } from "../api/client";
import type {
  CreateSessionRequest, SendMessageRequest,
  ChatSessionResponse, ChatSessionDetailResponse,
  ChatMessageResponse, ChatStreamChunk,
} from "../types/Chat";

const BASE = "/chat";
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ChatService {
  async createSession(request: CreateSessionRequest): Promise<ChatSessionResponse> {
    const res = await apiClient.post<ChatSessionResponse>(`${BASE}/session`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create session");
    return res.data;
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatMessageResponse> {
    const res = await apiClient.post<ChatMessageResponse>(`${BASE}/message`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to send message");
    return res.data;
  }

  async *streamMessage(
    request: SendMessageRequest,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatStreamChunk> {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${BASE_URL}${BASE}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Stream request failed with status ${response.status}`);
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
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            yield JSON.parse(data) as ChatStreamChunk;
          } catch {
            // skip malformed lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getHistory(): Promise<ChatSessionResponse[]> {
    const res = await apiClient.get<ChatSessionResponse[]>(`${BASE}/history`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get history");
    return res.data;
  }

  async getSession(id: string): Promise<ChatSessionDetailResponse> {
    const res = await apiClient.get<ChatSessionDetailResponse>(`${BASE}/session/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Session not found");
    return res.data;
  }

  async deleteSession(id: string): Promise<void> {
    const res = await apiClient.delete<void>(`${BASE}/session/${id}`);
    if (!res.success) throw new Error(res.message || "Delete failed");
  }
}

export const chatService = new ChatService();
