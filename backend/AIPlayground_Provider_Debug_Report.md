# AI Playground Provider Dropdown — Debug Report

## Problem

The AI Playground provider dropdown rendered **empty** (zero `<option>` elements) even though `GET /ai/providers` returned a valid array of 3 providers.

---

## Root Cause Chain

### Issue 1: Vite proxy target port was wrong

**File:** `vite.config.ts` (line 37)

```js
// BEFORE  (wrong)
target: 'http://localhost:5168',

// AFTER   (correct)
target: 'http://localhost:5000',
```

The frontend dev server at `localhost:5173` proxied `/api/*` to port **5168** where no server was running. The backend runs on port **5000**. All API calls silently failed with a network error.

---

### Issue 2: Silent error swallowing

**File:** `AIPlayground.tsx` (line 39)

```tsx
// BEFORE  (silently discards every error)
useEffect(() => {
    aiService.getProviders().then(setProviders).catch(() => {});
}, []);

// AFTER   (captures and displays errors)
useEffect(() => {
    setLoadingProviders(true);
    setProvidersError("");
    aiService.getProviders()
      .then(data => {
        setProviders(data);
        const firstEnabled = data.find(p => p.isEnabled);
        if (firstEnabled) setSelectedProvider(firstEnabled.name);
      })
      .catch(err => {
        setProvidersError(err instanceof Error ? err.message : "Failed to load providers");
      })
      .finally(() => setLoadingProviders(false));
}, []);
```

The `.catch(() => {})` discarded every failure (network error, 403, 500, etc.). The user saw no error and an empty dropdown.

---

### Issue 3: No loading / error / empty states

**File:** `AIPlayground.tsx` (lines 180-191)

The `<select>` always rendered a `<option>` list from `providers.map(...)`. When `providers` was `[]` (empty array), the `<select>` was rendered with zero `<option>` elements — an invisible empty dropdown.

**Fix:** Replaced the `<select>` block with a state-aware container:

| State | Display |
|---|---|
| `loadingProviders` | `"Loading providers..."` spinner |
| `providersError` | Error message in red |
| `providers.length === 0` | `"No AI providers available. Add API keys in appsettings.json."` |
| Normal | The provider `<select>` dropdown |

---

### Issue 4: No auto-selection of first enabled provider

**File:** `AIPlayground.tsx` (line 17)

`selectedProvider` was always initialized to `"OpenAI"`. If OpenAI was disabled (no API key), the user would see `"(not configured)"` as the default selection.

**Fix:** After providers load, auto-select the first provider where `isEnabled === true`:

```tsx
const firstEnabled = data.find(p => p.isEnabled);
if (firstEnabled) setSelectedProvider(firstEnabled.name);
```

---

### Issue 5 (Bonus): Corrupted Gemini Endpoint

**File:** `appsettings.json` (line 41)

The Gemini `Endpoint` value was accidentally overwritten with an API key string:

```json
// BEFORE (broken)
"Endpoint": "AQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",

// AFTER (fixed)
"Endpoint": "https://generativelanguage.googleapis.com/v1beta",
```

This would cause a runtime failure when the Gemini provider tried to construct API URLs.

---

## Full Trace Summary

```
Frontend                      Vite Proxy          Backend (localhost:5000)
─────────                     ──────────          ───────────────────────
GET /api/ai/providers ───→    rewrite /api →      GET /ai/providers
  │                          target: 5168 ❌      [Authorize(Roles="Admin")]
  │                          target: 5000 ✅      AIProviderFactory.GetAllProviders()
  │                                                → OpenAI   (ApiKey=""  → IsEnabled=false)
  │                                                → Anthropic(ApiKey=""  → IsEnabled=false)
  │                                                → Gemini   (ApiKey=✓   → IsEnabled=true)
  │
  └─ .catch(() => {}) ❌       ←─ network err ❌
  └─ .catch(setProvidersError) ←─ 200 OK ✅        ← [{ "isEnabled": true }, ...]
       │
       └─ providers = [...]
       └─ if firstEnabled → setSelectedProvider("Gemini") ✅
```

## Before / After

### Before

```
┌──────────────────────┐
│  Provider  ▼         │
│  ┌────────────────┐  │   ← empty select — no <option> elements
│  │                │  │
│  └────────────────┘  │
└──────────────────────┘
```

### After

```
┌──────────────────────────┐
│  Provider  ▼             │
│  ┌────────────────────┐  │
│  │ Gemini              │  │   ← auto-selected (first enabled)
│  │ OpenAI (not config) │  │
│  │ Anthropic (not ...) │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

If all providers are disabled:
```
┌──────────────────────────────────────────┐
│  Provider                                │
│  No AI providers available. Add API      │
│  keys in appsettings.json.               │
└──────────────────────────────────────────┘
```

## Files Modified

| File | Change |
|------|--------|
| `vite.config.ts:37` | Proxy target: `5168` → `5000` |
| `appsettings.json:41` | Gemini Endpoint: corrupted API key → `https://generativelanguage.googleapis.com/v1beta` |
| `AIPlayground.tsx:35-53` | Added `loadingProviders`, `providersError` state; replaced `.catch(() => {})` with error display |
| `AIPlayground.tsx:186-211` | Show loading/error/empty messages instead of empty `<select>` |
| `AIPlayground.tsx:46-48` | Auto-select first enabled provider after loading |

## Verified

| Check | Result |
|-------|--------|
| `GET /ai/providers` returns 3 providers | ✅ |
| Gemini `isEnabled: true`, model `gemini-2.0-flash` | ✅ |
| OpenAI/Anthropic `isEnabled: false` (empty API keys) | ✅ |
| `dotnet build` — 0 errors | ✅ |
| `npm run build` — 0 errors | ✅ |
