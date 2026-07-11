# Sprint 6 — AI Foundation Report

## Executive Summary
Built the AI Provider Architecture enabling ResearchHubAI to work with multiple AI providers (OpenAI, Anthropic, Gemini) through a unified abstraction layer. Uses Provider Pattern + Factory Pattern with full DI, retry policy, timeout handling, logging, CancellationToken support, and streaming preparation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Application Layer                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      DTOs (AI/)                            │   │
│  │  AIRequest │ AIResponse │ AIMessage │ AIOptions             │   │
│  │  AIStreamChunk │ AIUsage │ AIProviderType (enum)            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Interfaces (Interfaces/)                   │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  IAIProvider                                          │   │   │
│  │  │  ├─ ProviderType : AIProviderType                     │   │   │
│  │  │  ├─ IsEnabled : bool                                 │   │   │
│  │  │  ├─ SendAsync(AIRequest, CT) → AIResponse             │   │   │
│  │  │  └─ StreamAsync(AIRequest, CT) → IAsyncEnumerable<>  │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                Configuration (Configuration/)               │   │
│  │  AISettings { Providers(Dict), DefaultProvider, MaxRetries, │   │
│  │                TimeoutSeconds }                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                Exceptions (Exceptions/)                    │   │
│  │  AiException ← AiTimeoutException                          │   │
│  │              ← AiRateLimitException                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ DI Registration
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ OpenAIProvider│  │AnthropicProv.│  │GeminiProvider│      │   │
│  │  │              │  │              │  │              │      │   │
│  │  │ - HttpClient │  │ - HttpClient │  │ - HttpClient │      │   │
│  │  │ - RetryPolicy│  │ - RetryPolicy│  │ - RetryPolicy│      │   │
│  │  │ - TimeoutCT  │  │ - TimeoutCT  │  │ - TimeoutCT  │      │   │
│  │  │ - SSE Parse  │  │ - SSE Parse  │  │ - SSE Parse  │      │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │   │
│  │         │                 │                 │               │   │
│  │         └─────────────────┼─────────────────┘               │   │
│  │                           │                                 │   │
│  │                    ┌──────▼───────┐                         │   │
│  │                    │ AIProviderFactory                    │   │   │
│  │                    │  GetDefaultProvider()                 │   │   │
│  │                    │  GetProvider(type/name)               │   │   │
│  │                    │  GetEnabledProviders()                │   │   │
│  │                    └──────────────┘                         │   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  RetryPolicy (static)                               │   │   │
│  │  │  ExecuteWithRetryAsync<T>(op, maxRetries, logger,   │   │   │
│  │  │    operationName, ct) → T                          │   │   │
│  │  │  - Exponential backoff: 200ms × 2^attempt          │   │   │
│  │  │  - Retries on HttpRequestException only             │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Sequence Diagram

```
Client                AIProviderFactory           IAIProvider          HTTP API
  │                          │                       │                   │
  │  GetProvider("OpenAI")   │                       │                   │
  │─────────────────────────►│                       │                   │
  │                          │  Resolve from DI      │                   │
  │                          │──────────────────────►│                   │
  │                          │  return OpenAIProvider │                   │
  │                          │◄──────────────────────│                   │
  │         return provider  │                       │                   │
  │◄─────────────────────────│                       │                   │
  │                          │                       │                   │
  │  SendAsync(request, ct)  │                       │                   │
  │─────────────────────────────────────────────────►│                   │
  │                          │                       │  Create timeoutCT │
  │                          │                       │  (source CT + 30s)│
  │                          │                       │                   │
  │                          │              ┌──── Retry Loop ────┐      │
  │                          │              │   attempt=0..N     │      │
  │                          │              │                    │      │
  │                          │              │  POST /v1/chat/    │      │
  │                          │              │  completions       │      │
  │                          │              │───────────────────►│      │
  │                          │              │    200/429/5xx     │      │
  │                          │              │◄───────────────────│      │
  │                          │              │                    │      │
  │                          │              │  if 429 → throw    │      │
  │                          │              │  AiRateLimitExc.   │      │
  │                          │              │                    │      │
  │                          │              │  if 5xx & retries  │      │
  │                          │              │  remain → wait     │      │
  │                          │              │  (exp. backoff)    │      │
  │                          │              └────────────────────┘      │
  │                          │                       │                   │
  │                          │              Parse JSON response         │
  │                          │              Build AIResponse DTO        │
  │        return AIResponse │                       │                   │
  │◄─────────────────────────────────────────────────│                   │
```

## File Inventory

### Application Layer (11 new files)

| File | Description |
|------|-------------|
| `DTOs/AI/AIProviderType.cs` | Enum: OpenAI, Anthropic, Gemini |
| `DTOs/AI/AIMessage.cs` | Chat message with Role + Content |
| `DTOs/AI/AIUsage.cs` | Token usage (prompt/completion/total) |
| `DTOs/AI/AIOptions.cs` | Model config: temperature, maxTokens, topP, penalties |
| `DTOs/AI/AIRequest.cs` | Request: messages list, optional system prompt + options |
| `DTOs/AI/AIResponse.cs` | Response: content, model, usage, finish reason |
| `DTOs/AI/AIStreamChunk.cs` | Streaming chunk with IsComplete flag |
| `Interfaces/IAIProvider.cs` | Provider contract: SendAsync, StreamAsync, IsEnabled |
| `Exceptions/AiException.cs` | Base AI exception with ProviderType + HttpStatusCode |
| `Exceptions/AiTimeoutException.cs` | Timeout-specific exception |
| `Exceptions/AiRateLimitException.cs` | 429 rate limit exception with RetryAfter |
| `Configuration/AISettings.cs` | Config model: provider dict, defaults, retry/timeout |

### Infrastructure Layer (5 new files)

| File | Description |
|------|-------------|
| `AI/RetryPolicy.cs` | Static retry helper with exponential backoff |
| `AI/OpenAIProvider.cs` | OpenAI via `/v1/chat/completions` + SSE streaming |
| `AI/AnthropicProvider.cs` | Anthropic via `/v1/messages` + SSE streaming |
| `AI/GeminiProvider.cs` | Gemini via `models/{id}:generateContent` + SSE streaming |
| `AI/AIProviderFactory.cs` | Factory: resolve by name/type, fallback to default/enabled |

### Modified Files (2 files)

| File | Change |
|------|--------|
| `Infrastructure/DependencyInjection.cs` | Registers AISettings singleton, HttpClient, 3 providers, factory |
| `Api/appsettings.json` | Added `AI` section with 3 provider configs (empty API keys) |

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No external NuGet deps** | Manual retry (exponential backoff) avoids Polly dependency; System.Text.Json built-in |
| **Singleton providers** | Providers are stateless (HttpClient + config) — safe and efficient |
| **AISettings as singleton** | Bound at startup from config, bypasses IOptions for simpler injection in factory |
| **IHttpClientFactory** | Standard .NET pattern for managed HttpClient lifecycle (no socket exhaustion) |
| **SnakeCaseLower JSON** | OpenAI/Anthropic use snake_case; Gemini uses camelCase (separate JsonOptions) |
| **Separate timeout CancellationToken** | Each request creates a linked CTS with the provider's configured timeout seconds |
| **Streaming via IAsyncEnumerable** | Standard .NET async streaming pattern, ready for future SSE consumption |
| **Factory resolves by name** | Supports both `GetProvider("OpenAI")` and `GetProvider(AIProviderType.OpenAI)` |

## Build Verification

```
Build succeeded.
    6 Warning(s)    ← pre-existing AutoMapper NU1903 only
    0 Error(s)
```

## Next Steps (Phase 2)
1. Add unit tests for each provider (mock HttpClient)
2. Add AI service layer for business logic (e.g., summarization, classification)
3. Create AI controllers exposing endpoints (POST /ai/chat, POST /ai/stream)
4. Add frontend AI chat UI component
5. Add API key encryption for production deployment
