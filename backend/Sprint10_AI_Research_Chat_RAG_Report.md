# Sprint 10 — AI Research Chat (RAG) Report

## Executive Summary
Built a complete RAG-powered AI Research Chat system that answers questions using uploaded research papers, proposals, and document chunks. Uses AIProviderFactory for all AI calls. Designed with future-ready vector search interfaces.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Backend (ASP.NET Core 10)                            │
│                                                                              │
│  ResearchChatController (6 endpoints, student-only)                          │
│  ├─ POST /chat/session       → Create chat session                          │
│  ├─ POST /chat/message       → Send message (non-streaming)                 │
│  ├─ POST /chat/stream        → Stream response (SSE)                        │
│  ├─ GET  /chat/history       → List all sessions                            │
│  ├─ GET  /chat/session/{id}  → Session detail with messages + citations     │
│  └─ DELETE /chat/session/{id} → Soft delete                                 │
│                                                                              │
│  ChatService (5-phase RAG Pipeline)                                          │
│  ├─ Phase 1: Retrieve uploaded literature, proposals, document chunks       │
│  ├─ Phase 2: Keyword extraction + TF-IDF ranking, Top-K (10), context trim  │
│  ├─ Phase 3: Construct prompt (system + context + history + question)       │
│  ├─ Phase 4: Call AIProviderFactory → IAIProvider.SendAsync/StreamAsync     │
│  └─ Phase 5: Return answer with confidence, citations, token usage          │
│                                                                              │
│  Future-Ready Interfaces (Application layer)                                 │
│  ├─ IVectorStore        → StoreEmbeddingAsync, SearchAsync                  │
│  ├─ IEmbeddingProvider  → GenerateEmbeddingAsync, GenerateEmbeddingsAsync   │
│  └─ IDocumentRetriever  → RetrieveRelevantChunksAsync, RetrieveByKeywords   │
│                                                                              │
│  Domain Entities (5 new):                                                    │
│  ├─ ChatSession         → Title, StudentId, ResearchArea, MessageCount      │
│  ├─ ChatMessage         → Role, Content, Confidence, Tokens, ProviderUsed   │
│  ├─ Citation            → SourceTitle, Authors, Year, Section, Excerpt      │
│  ├─ DocumentReference   → SourceType, LiteratureReviewId, ProposalId        │
│  └─ ConversationMemory  → MemoryKey, MemoryValue, Priority                  │
│                                                                              │
│  Migration: AddResearchChatEntities (5 new tables)                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       Frontend (React 18 + TypeScript)                       │
│                                                                              │
│  ResearchChatPage.tsx                                                        │
│  ├─ Conversation Sidebar: Create, search, rename, delete sessions            │
│  ├─ Multiple chat sessions with auto-refresh on new messages                 │
│  ├─ Streaming responses with SSE + typing animation                          │
│  ├─ Markdown rendering: H1-H3, bold, italic, inline code, code blocks        │
│  │   Tables, blockquotes, ordered/unordered lists, horizontal rules          │
│  ├─ Citation cards: Expandable sources with relevance score bars             │
│  ├─ Suggestion buttons: 6 quick-start prompts                                │
│  ├─ Copy to clipboard, export as .txt, clear conversation                    │
│  └─ Stop streaming button                                                    │
│                                                                              │
│  ChatService.ts                                                              │
│  ├─ createSession, sendMessage, streamMessage (SSE), getHistory              │
│  ├─ getSession, deleteSession                                                │
│  └─ AsyncGenerator-based streaming with AbortController                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

## RAG Pipeline (5 Phases)

| Phase | Component | Description |
|-------|-----------|-------------|
| 1. Retrieve | UploadedDocuments, AIProposals, DocumentChunks | Pulls literature, proposals, and chunks for the student |
| 2. Rank | Keyword extraction, TF-IDF scoring, Top-10 | Extracts query keywords, scores documents by relevance, context window management (~48K chars) |
| 3. Construct | PromptBuilder | System prompt + retrieved context + conversation history (last 10) + user question |
| 4. Call | AIProviderFactory → IAIProvider | Uses default provider. Supports both SendAsync and StreamAsync |
| 5. Return | Confidence, Citations, Token counts | Saves citations to DB, returns structured response |

## Database Schema — 5 New Tables

| Table | Key Fields |
|-------|------------|
| ChatSessions | StudentId, Title, ResearchArea, ContextSummary, MessageCount, LastActivityAt |
| ChatMessages | ChatSessionId, Role, Content, Confidence, PromptTokens, CompletionTokens, ProviderUsed, OrderIndex |
| Citations | ChatMessageId, SourceTitle, Authors, Year, SourceType, SectionName, Excerpt, RelevanceScore |
| DocumentReferences | ChatSessionId, SourceType, LiteratureReviewId, UploadedDocumentId, ProposalId |
| ConversationMemories | ChatSessionId, MemoryKey, MemoryValue, Priority, LastAccessedAt |

## Future-Ready Interfaces (Vector Database Ready)

| Interface | Methods | Purpose |
|-----------|---------|---------|
| `IVectorStore` | StoreEmbeddingAsync, SearchAsync, DeleteDocumentEmbeddingsAsync | Store/query dense vectors |
| `IEmbeddingProvider` | GenerateEmbeddingAsync, GenerateEmbeddingsAsync | Convert text to vectors |
| `IDocumentRetriever` | RetrieveRelevantChunksAsync, RetrieveByKeywordsAsync | Abstract retrieval layer |

## AI Capabilities (via RAG)

| Capability | Example Prompt |
|------------|---------------|
| Paper summarization | "Summarize this paper" |
| Paper comparison | "Compare these papers" |
| Algorithm explanation | "Explain this algorithm" |
| Research gap analysis | "Find research gaps" |
| Future work suggestions | "Suggest future work" |
| Citation generation | "Generate IEEE citation" |
| Chapter explanation | "Explain Chapter 2" |
| Topic discovery | "Which paper discusses CNN optimization?" |
| Limitations analysis | "What are the limitations?" |
| Methodology generation | "Generate experimental methodology" |

## File Inventory

### Backend (12 new files, 3 modified)

| File | Description |
|------|-------------|
| `Application/Interfaces/IVectorStore.cs` | Future vector store interface |
| `Application/Interfaces/IEmbeddingProvider.cs` | Future embedding interface |
| `Application/Interfaces/IDocumentRetriever.cs` | Future document retriever interface |
| `Application/Interfaces/IChatService.cs` | Chat service interface (6 methods) |
| `Application/DTOs/Chat/ChatDTOs.cs` | 9 request/response DTOs |
| `Domain/Entities/ChatSession.cs` | Chat session entity |
| `Domain/Entities/ChatMessage.cs` | Chat message entity |
| `Domain/Entities/Citation.cs` | Citation entity |
| `Domain/Entities/DocumentReference.cs` | Document reference entity |
| `Domain/Entities/ConversationMemory.cs` | Conversation memory entity |
| `Infrastructure/Services/ChatService.cs` | Full RAG pipeline implementation |
| `Api/Controllers/ResearchChatController.cs` | 6 endpoints, SSE streaming |
| `Persistence/ApplicationDbContext.cs` | +5 DbSets + configurations |
| `Infrastructure/DependencyInjection.cs` | +IChatService registration |
| `Persistence/Migrations/*AddResearchChatEntities*` | Database migration |

### Frontend (3 new files, 2 modified)

| File | Description |
|------|-------------|
| `types/Chat.ts` | 9 TypeScript interfaces |
| `services/ChatService.ts` | API service (6 methods + streaming) |
| `pages/student/ResearchChatPage.tsx` | Full chat UI (sidebar, messages, streaming, markdown, citations) |
| `utils/navigation.ts` | Added `research-chat` nav entry with AI badge |
| `routes/StudentRouter.tsx` | Added route case |
| `api/endpoints.ts` | Added `chat` endpoint group |

## Build Verification

| Component | Status |
|-----------|--------|
| `dotnet build` | ✅ 0 errors, 6 warnings (pre-existing AutoMapper) |
| `npm run build` | ✅ 0 errors, 1 warning (chunk size, pre-existing) |
| Migration | ✅ AddResearchChatEntities created |

## Next Steps
1. Implement vector search by integrating IVectorStore + IEmbeddingProvider
2. Add PDF/DOCX binary parsing for better document processing
3. Add session sharing/collaboration
4. Add conversation summarization
5. Add source document highlighting in responses
6. Add multi-modal support (image understanding)
