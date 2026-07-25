export interface CreateSessionRequest {
  title: string;
  projectId?: string;
  researchArea?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface ChatSessionResponse {
  id: string;
  title: string;
  researchArea: string | null;
  messageCount: number;
  createdAt: string;
  lastActivityAt: string;
}

export interface ChatSessionDetailResponse {
  id: string;
  title: string;
  researchArea: string | null;
  contextSummary: string | null;
  messageCount: number;
  createdAt: string;
  lastActivityAt: string;
  messages: ChatMessageResponse[];
  documentReferences: DocumentReferenceResponse[];
}

export interface ChatMessageResponse {
  id: string;
  role: string;
  content: string;
  confidence: string | null;
  orderIndex: number;
  createdAt: string;
  citations: CitationResponse[];
}

export interface CitationResponse {
  id: string;
  sourceTitle: string;
  authors: string | null;
  year: number | null;
  sourceType: string | null;
  sectionName: string | null;
  excerpt: string | null;
  relevanceScore: number | null;
}

export interface DocumentReferenceResponse {
  id: string;
  sourceType: string;
  title: string | null;
  authors: string | null;
  year: number | null;
  summary: string | null;
}

export interface ChatStreamChunk {
  content: string;
  isComplete: boolean;
  error?: string;
  messageId?: string;
  confidence?: string;
}
