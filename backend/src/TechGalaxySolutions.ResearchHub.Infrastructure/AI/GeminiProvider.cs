using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.Configuration;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.AI;

public class GeminiProvider : IAIProvider
{
    private readonly HttpClient _httpClient;
    private readonly AIProviderSettings _settings;
    private readonly ILogger<GeminiProvider> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    public GeminiProvider(
        IHttpClientFactory httpClientFactory,
        AISettings aiSettings,
        ILogger<GeminiProvider> logger)
    {
        _settings = aiSettings.Providers.GetValueOrDefault("Gemini") ?? throw new InvalidOperationException("Gemini provider settings not found");
        _logger = logger;

        var key = _settings.ApiKey;
        _logger.LogInformation("Gemini API key loaded = {Loaded}, length = {Length}, last 4 chars = {Last4}",
            !string.IsNullOrEmpty(key),
            key?.Length ?? 0,
            key is { Length: >= 4 } ? key[^4..] : "N/A");

        _httpClient = httpClientFactory.CreateClient(nameof(GeminiProvider));
        _httpClient.BaseAddress = new Uri(_settings.Endpoint.TrimEnd('/') + "/");
    }

    public AIProviderType ProviderType => AIProviderType.Gemini;

    public bool IsEnabled => !string.IsNullOrEmpty(_settings.ApiKey);

    public async Task<AIResponse> SendAsync(AIRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
            throw new AiException(ProviderType, "Gemini provider is not configured (missing API key)");

        var body = BuildRequestBody(request);
        var model = _settings.Model;
        var url = $"models/{model}:generateContent?key={_settings.ApiKey}";
        var timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(timeout);

        return await RetryPolicy.ExecuteWithRetryAsync(
            async () =>
            {
                _logger.LogInformation("Gemini SendAsync -> POST {BaseAddress}{Url}", _httpClient.BaseAddress, url.Replace(_settings.ApiKey, "***"));
                var bodyJson = JsonSerializer.Serialize(body, JsonOptions);
                _logger.LogInformation("Gemini SendAsync request body:\n{Body}", bodyJson);

                using var response = await _httpClient.PostAsJsonAsync(url, body, JsonOptions, timeoutCts.Token);

                _logger.LogInformation("Gemini SendAsync response status: {(int)response.StatusCode} {response.ReasonPhrase}", (int)response.StatusCode, response.ReasonPhrase);
                foreach (var h in response.Headers)
                {
                    _logger.LogInformation("Gemini SendAsync response header {Key}: {Value}", h.Key, string.Join(", ", h.Value));
                }

                var responseBody = await response.Content.ReadAsStringAsync(timeoutCts.Token);
                _logger.LogInformation("Gemini SendAsync response body:\n{Body}", responseBody);

                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    var retryAfter = response.Headers.RetryAfter?.Delta;
                    throw new AiRateLimitException(ProviderType, retryAfter);
                }

                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = $"Gemini API returned {(int)response.StatusCode}";
                    if (!string.IsNullOrEmpty(responseBody))
                    {
                        try
                        {
                            using var errorDoc = JsonDocument.Parse(responseBody);
                            errorMsg = errorDoc.RootElement.TryGetProperty("error", out var err)
                                && err.TryGetProperty("message", out var msg)
                                ? msg.GetString() ?? errorMsg
                                : errorMsg;
                        }
                        catch { errorMsg += $": {responseBody[..Math.Min(responseBody.Length, 200)]}"; }
                    }
                    throw new AiException(ProviderType, errorMsg, (int)response.StatusCode);
                }

                var json = JsonSerializer.Deserialize<GeminiResponse>(responseBody, JsonOptions);
                if (json?.Candidates is null or { Count: 0 })
                    throw new AiException(ProviderType, "Empty response from Gemini");

                var candidate = json.Candidates[0];
                var text = candidate.Content?.Parts?.FirstOrDefault()?.Text ?? string.Empty;

                return new AIResponse
                {
                    Content = text,
                    Model = model,
                    Usage = json.UsageMetadata is null ? null : new AIUsage
                    {
                        PromptTokens = json.UsageMetadata.PromptTokenCount,
                        CompletionTokens = json.UsageMetadata.CandidatesTokenCount,
                        TotalTokens = json.UsageMetadata.TotalTokenCount,
                    },
                    FinishReason = candidate.FinishReason,
                };
            },
            _settings.MaxRetries,
            _logger,
            "Gemini.SendAsync",
            timeoutCts.Token);
    }

    public async IAsyncEnumerable<AIStreamChunk> StreamAsync(
        AIRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
            throw new AiException(ProviderType, "Gemini provider is not configured (missing API key)");

        var body = BuildRequestBody(request);
        var model = _settings.Model;
        var url = $"models/{model}:streamGenerateContent?alt=sse&key={_settings.ApiKey}";
        var timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(timeout);

        _logger.LogInformation("Gemini StreamAsync -> POST {BaseAddress}{Url}", _httpClient.BaseAddress, url.Replace(_settings.ApiKey, "***"));
        var bodyJson = JsonSerializer.Serialize(body, JsonOptions);
        _logger.LogInformation("Gemini StreamAsync request body:\n{Body}", bodyJson);

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body, options: JsonOptions),
        };

        using var response = await RetryPolicy.ExecuteWithRetryAsync(
            () => _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, timeoutCts.Token),
            _settings.MaxRetries,
            _logger,
            "Gemini.StreamAsync",
            timeoutCts.Token);

        _logger.LogInformation("Gemini StreamAsync response status: {(int)response.StatusCode} {response.ReasonPhrase}", (int)response.StatusCode, response.ReasonPhrase);

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(timeoutCts.Token);
            _logger.LogError("Gemini StreamAsync error body:\n{Body}", responseBody);

            var errorMsg = $"Gemini API returned {(int)response.StatusCode}";
            if (!string.IsNullOrEmpty(responseBody))
            {
                try
                {
                    using var errorDoc = JsonDocument.Parse(responseBody);
                    errorMsg = errorDoc.RootElement.TryGetProperty("error", out var err)
                        && err.TryGetProperty("message", out var msg)
                        ? msg.GetString() ?? errorMsg
                        : errorMsg;
                }
                catch { errorMsg += $": {responseBody[..Math.Min(responseBody.Length, 200)]}"; }
            }
            throw new AiException(ProviderType, errorMsg, (int)response.StatusCode);
        }

        using var stream = await response.Content.ReadAsStreamAsync(timeoutCts.Token);
        using var reader = new StreamReader(stream);

        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var line = await reader.ReadLineAsync(cancellationToken);
            if (line is null)
                break;
            if (string.IsNullOrWhiteSpace(line))
                continue;

            if (line.StartsWith("data: "))
            {
                var data = line[6..];
                if (data == "[DONE]")
                    yield break;

                using var doc = JsonDocument.Parse(data);
                var root = doc.RootElement;

                if (root.TryGetProperty("error", out var errEl))
                {
                    var errMsg = errEl.TryGetProperty("message", out var msgEl)
                        ? msgEl.GetString() ?? "Unknown Gemini error"
                        : "Unknown Gemini error";
                    throw new AiException(ProviderType, errMsg);
                }

                if (root.TryGetProperty("candidates", out var candidates) &&
                    candidates.GetArrayLength() > 0)
                {
                    var candidate = candidates[0];
                    var content = candidate.TryGetProperty("content", out var c) ? c : default;
                    var parts = content.TryGetProperty("parts", out var p) ? p : default;
                    var text = parts.GetArrayLength() > 0 && parts[0].TryGetProperty("text", out var t)
                        ? t.GetString() ?? string.Empty
                        : string.Empty;
                    var finishReason = candidate.TryGetProperty("finishReason", out var fr)
                        ? fr.GetString()
                        : null;

                    yield return new AIStreamChunk
                    {
                        Content = text,
                        FinishReason = finishReason,
                    };
                }
            }
        }
    }

    private object BuildRequestBody(AIRequest request)
    {
        var contents = new List<object>();
        string? systemInstruction = string.IsNullOrEmpty(request.SystemPrompt) ? null : request.SystemPrompt;

        foreach (var msg in request.Messages)
        {
            if (msg.Role == "system")
            {
                systemInstruction ??= msg.Content;
                continue;
            }
            contents.Add(new
            {
                role = msg.Role == "assistant" ? "model" : msg.Role,
                parts = new[] { new { text = msg.Content } },
            });
        }

        return new
        {
            system_instruction = systemInstruction is null
                ? null
                : new { parts = new[] { new { text = systemInstruction } } },
            contents,
            generationConfig = new
            {
                temperature = request.Options?.Temperature ?? 0.7,
                maxOutputTokens = request.Options?.MaxTokens ?? 2048,
                topP = request.Options?.TopP,
            },
        };
    }

    private sealed class GeminiResponse
    {
        public List<GeminiCandidate>? Candidates { get; set; }
        public GeminiUsage? UsageMetadata { get; set; }
    }

    private sealed class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
        public string? FinishReason { get; set; }
    }

    private sealed class GeminiContent
    {
        public List<GeminiPart>? Parts { get; set; }
    }

    private sealed class GeminiPart
    {
        public string Text { get; set; } = string.Empty;
    }

    private sealed class GeminiUsage
    {
        public int PromptTokenCount { get; set; }
        public int CandidatesTokenCount { get; set; }
        public int TotalTokenCount { get; set; }
    }
}
