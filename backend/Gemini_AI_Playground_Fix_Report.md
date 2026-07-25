# Gemini AI Playground Fix Report

## Files Modified

| File | What Changed |
|------|-------------|
| `frontend/.../pages/admin/AIPlayground.tsx` | Removed hardcoded model dict; model now sourced from backend `/ai/providers`; added full console logging on Send |
| `frontend/.../api/endpoints.ts` | Imported by AIPlayground for endpoint logging |
| `backend/.../Infrastructure/AI/GeminiProvider.cs` | Major rework: logging, error handling, system instruction fix, API key logging |
| `backend/.../Infrastructure/AI/RetryPolicy.cs` | Added retry for 429 and 5xx; skip 401/403/404 |

---

## Exact Changes

### 1. Frontend: `AIPlayground.tsx`

**Removed hardcoded models dict (lines 59-64):**
```ts
// BEFORE:
const models: Record<string, string[]> = {
    OpenAI: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
    Anthropic: ["claude-3-opus-...", "claude-3-sonnet-...", "claude-3-haiku-..."],
    Gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
};

// AFTER:
// models dict removed entirely. Model sourced from backend via currentProvider.model
```

**Model now sourced from backend:**
```ts
useEffect(() => {
    if (currentProvider?.model) setModel(currentProvider.model);
}, [selectedProvider, providers]);
```

**Model `<select>` populated from backend:**
```tsx
{currentProvider?.model ? (
    <option key={currentProvider.model} value={currentProvider.model}>
        {currentProvider.model}
    </option>
) : (
    <option value="" disabled>No model available</option>
)}
```

**Added logging on Send:**
```ts
const requestBody = { messages: [...], systemPrompt: ..., options: {...} };
const endpoint = streaming ? ENDPOINTS.ai.stream : ENDPOINTS.ai.chat;
console.log("=== AI Playground Send ===");
console.log("Provider:", selectedProvider);
console.log("Model:", model);
console.log("Endpoint:", endpoint);
console.log("Streaming:", streaming);
console.log("Request body:", JSON.stringify(requestBody, null, 2));
```

---

### 2. Backend: `GeminiProvider.cs`

**STEP 4 - Removed `EnsureSuccessStatusCode()` from StreamAsync:** Replaced with proper error body reading and `AiException` throw.

**STEP 5/6 - Full request/response logging:**
- Outgoing: URL (with API key masked as `***`), full JSON body
- Response: Status code, all response headers, full response body

**STEP 7 - BuildRequestBody system instruction fix:**
```csharp
foreach (var msg in request.Messages)
{
    if (msg.Role == "system")  // ← NEW: skip system messages
    {
        systemInstruction ??= msg.Content;
        continue;
    }
    contents.Add(new { role = ..., parts = ... });
}
```

**STEP 11 - API key logging:**
```csharp
_logger.LogInformation("Gemini API key loaded = {Loaded}, length = {Length}, last 4 chars = {Last4}",
    !string.IsNullOrEmpty(key), key?.Length ?? 0,
    key is { Length: >= 4 } ? key[^4..] : "N/A");
```

---

### 3. Backend: `RetryPolicy.cs`

**Added catch for `AiRateLimitException` (429):**
```csharp
catch (AiRateLimitException) when (attempt < maxRetries)
{
    // retry with exponential backoff (base 500ms)
}
```

**Added catch for `AiException` with 5xx status:**
```csharp
catch (AiException ex) when (attempt < maxRetries && IsServerError(ex.HttpStatusCode))
{
    // retry 500, 502, 503, 504 with exponential backoff
}
```

**`HttpRequestException` catch unchanged** (network errors).

**401, 403, 404 NOT retried** (falls through to caller).

---

## Root Cause

The AI Playground had **6 bugs** that combined to make it fail:

| # | Bug | Impact |
|---|-----|--------|
| 1 | Frontend hardcoded model `gemini-1.5-pro` (deprecated) | Google returned 404 → no response |
| 2 | `StreamAsync()` used `EnsureSuccessStatusCode()` | Non-200 response threw generic exception → frontend showed "retry" |
| 3 | System messages were included inside `contents` array | Gemini rejects `role: system` inside contents |
| 4 | RetryPolicy didn't handle HTTP status codes | 429/5xx not retried; network errors retried unconditionally |
| 5 | Error display showed "retry" instead of Google's message | User couldn't diagnose the issue |
| 6 | API key expired/invalid | Google returns 401 "invalid authentication credentials" |

---

## Sample Request (from logs)

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=***
```

**Request body:**
```json
{
  "system_instruction": {
    "parts": [{"text": "You are a helpful assistant."}]
  },
  "contents": [
    {
      "role": "user",
      "parts": [{"text": "Say hello"}]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

---

## Sample Response (from logs)

**Status:** 401 Unauthorized

**Headers:**
```
WWW-Authenticate: Bearer realm="invalid_token"
Server-Timing: gfet4t7; dur=51
```

**Body:**
```json
{
  "error": {
    "code": 401,
    "message": "Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.",
    "status": "UNAUTHENTICATED",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "ACCESS_TOKEN_TYPE_UNSUPPORTED",
        "metadata": {
          "method": "google.ai.generativelanguage.v1beta.GenerativeService.GenerateContent",
          "service": "generativelanguage.googleapis.com"
        }
      }
    ]
  }
}
```

---

## Verification Results

| Test | Result |
|------|--------|
| Backend builds (`dotnet build`) | ✅ **0 errors** |
| Frontend builds (`npm run build`) | ✅ **0 errors** |
| `GET /ai/providers` returns Gemini with correct model | ✅ `model: "gemini-2.0-flash"` |
| `POST /ai/chat` returns Google's error message | ✅ 401 "Request had invalid authentication credentials..." |
| `POST /ai/stream` streams Google's error via SSE | ✅ `data: {"error":"..."}` |
| Streaming with system prompt -> `system_instruction` in body | ✅ Verified in logs |
| System role messages excluded from `contents` | ✅ Verified |
| API key NOT exposed in log | ✅ Masked as `***` |
| API key length & last 4 chars logged | ✅ `length=53, last 4=M9qQ` |
| Full request body logged | ✅ |
| Full response body logged | ✅ |
| Response headers logged | ✅ |
| No `EnsureSuccessStatusCode()` anywhere | ✅ |
| RetryPolicy skips 401/403/404 | ✅ (AiException with non-5xx status falls through) |
| RetryPolicy retries 429 | ✅ (AiRateLimitException caught) |
| RetryPolicy retries 500/502/503/504 | ✅ (IsServerError check) |
| Frontend model dropdown shows backend model | ✅ `gemini-2.0-flash` from backend |
| No hardcoded `gemini-1.5-pro` or `gpt-4o` in frontend | ✅ Zero occurrences |

---

## Remaining Issues

1. **Gemini API key is expired/invalid.** The current key `AQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` returns 401 from Google. Replace it with a valid key in `appsettings.json`.

2. **AutoMapper vulnerability** (NU1903) — pre-existing, not related to AI.

---

## How to Test with a Valid Key

1. Get a free Gemini API key from https://aistudio.google.com/apikey
2. Replace the `ApiKey` value in `backend/.../Api/appsettings.json` under `AI:Providers:Gemini`
3. Start backend: `dotnet run --project backend/src/.../Api --urls http://localhost:5168`
4. Start frontend: `npm run dev` in frontend directory
5. Login as superadmin, navigate to AI Playground
6. Select Gemini from provider dropdown (model shows `gemini-2.0-flash`)
7. Type "hello" and click Send
8. Check browser console for full request logging
9. Check backend logs for full request/response tracing
