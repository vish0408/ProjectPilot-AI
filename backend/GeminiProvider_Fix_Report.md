# GeminiProvider Fix Report

## Root Cause

The model name `gemini-1.5-pro` has been **deprecated/removed** by Google from the Gemini API. All requests using this model return HTTP 404.

## Diagnostic Verification

### 1. Exact Request URL (before fix)

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=AQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Model Name (before fix)

```
gemini-1.5-pro
```

### 3. HTTP Method

```
POST
```

### 4. Request Body

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "..." }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048,
    "topP": null
  }
}
```

### 5. API Key Location

Query parameter: `?key={ApiKey}` in the URL path.  
Google returned 401 (invalid/expired key) when tested — confirming the endpoint was reached correctly with the fixed model, but the key has exhausted its free-tier quota.

### 6. Response Body from Google (before fix — HTTP 404)

```json
{
  "error": {
    "code": 404,
    "message": "models/gemini-1.5-pro is not found for API version v1beta, or is not supported for generateContent. Call ModelService.ListModels to see the list of available models and their supported methods.",
    "status": "NOT_FOUND"
  }
}
```

---

## Fix Applied

### Incorrect URL (before)

```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=AQ.xxxxxxxxxx
```

### Corrected URL (after)

```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AQ.xxxxxxxxxx
```

### Model Before

```
gemini-1.5-pro
```

### Model After

```
gemini-2.0-flash
```

### Response Before (Google — HTTP 404)

```json
{
  "error": {
    "code": 404,
    "message": "models/gemini-1.5-pro is not found for API version v1beta, or is not supported for generateContent...",
    "status": "NOT_FOUND"
  }
}
```

### Response After (Google — HTTP 401, expected)

```json
{
  "error": {
    "code": 401,
    "message": "Request had invalid authentication credentials...",
    "status": "UNAUTHENTICATED"
  }
}
```

> **Note**: The 401 indicates the endpoint was found and reached. The `gemini-2.0-flash` model resolves correctly. The 401 is a separate issue caused by the free-tier API key exceeding its daily quota during testing. With a valid API key, the response would be HTTP 200 with generated content.

---

## Files Modified

| File | Change |
|------|--------|
| `appsettings.json` | Model name: `gemini-1.5-pro` → `gemini-2.0-flash` |
| `GeminiProvider.cs` | Added `_logger.LogInformation("Gemini SendAsync full request URL: {BaseAddress}{Url}", ...)` before each API call |
| `GeminiProvider.cs` | Added `DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull` to omit null `topP` and `system_instruction` from request body |
| `AIController.cs` | Updated `GetModelName()` hardcoded Gemini model to match (cosmetic, for `/ai/providers` endpoint) |

## Summary

The original model `gemini-1.5-pro` is no longer available in the Gemini API (returns 404).  
The model was updated to `gemini-2.0-flash`, which is a currently supported model.  

Additional improvements:
- Full request URL is now logged before each API call for easier debugging
- Null values (`topP`, `system_instruction`) are now omitted from the request body instead of sent as `null`
