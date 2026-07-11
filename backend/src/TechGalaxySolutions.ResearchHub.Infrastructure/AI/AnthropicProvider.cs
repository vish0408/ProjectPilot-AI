using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.Configuration;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.AI;

public class AnthropicProvider : IAIProvider
{
    private readonly HttpClient _httpClient;
    private readonly AIProviderSettings _settings;
    private readonly ILogger<AnthropicProvider> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
    };

    public AnthropicProvider(
        IHttpClientFactory httpClientFactory,
        AISettings aiSettings,
        ILogger<AnthropicProvider> logger)
    {
        _settings = aiSettings.Providers.GetValueOrDefault("Anthropic") ?? throw new InvalidOperationException("Anthropic provider settings not found");
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient(nameof(AnthropicProvider));
        _httpClient.BaseAddress = new Uri(_settings.Endpoint.TrimEnd('/') + "/");
        if (!string.IsNullOrEmpty(_settings.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("x-api-key", _settings.ApiKey);
            _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
        }
    }

    public AIProviderType ProviderType => AIProviderType.Anthropic;

    public bool IsEnabled => !string.IsNullOrEmpty(_settings.ApiKey);

    public async Task<AIResponse> SendAsync(AIRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
            throw new AiException(ProviderType, "Anthropic provider is not configured (missing API key)");

        var body = BuildRequestBody(request, stream: false);
        var timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(timeout);

        return await RetryPolicy.ExecuteWithRetryAsync(
            async () =>
            {
                using var response = await _httpClient.PostAsJsonAsync("messages", body, JsonOptions, timeoutCts.Token);

                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    var retryAfter = response.Headers.RetryAfter?.Delta;
                    throw new AiRateLimitException(ProviderType, retryAfter);
                }

                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadFromJsonAsync<AnthropicResponse>(JsonOptions, timeoutCts.Token);
                if (json?.Content is null || json.Content.Count == 0)
                    throw new AiException(ProviderType, "Empty response from Anthropic");

                var text = string.Concat(json.Content.Where(c => c.Type == "text").Select(c => c.Text));

                return new AIResponse
                {
                    Content = text,
                    Model = json.Model,
                    Usage = json.Usage is null ? null : new AIUsage
                    {
                        PromptTokens = json.Usage.InputTokens,
                        CompletionTokens = json.Usage.OutputTokens,
                        TotalTokens = json.Usage.InputTokens + json.Usage.OutputTokens,
                    },
                    FinishReason = json.StopReason,
                };
            },
            _settings.MaxRetries,
            _logger,
            "Anthropic.SendAsync",
            timeoutCts.Token);
    }

    public async IAsyncEnumerable<AIStreamChunk> StreamAsync(
        AIRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
            throw new AiException(ProviderType, "Anthropic provider is not configured (missing API key)");

        var body = BuildRequestBody(request, stream: true);
        var timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(timeout);

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "messages")
        {
            Content = JsonContent.Create(body, options: JsonOptions),
        };

        using var response = await RetryPolicy.ExecuteWithRetryAsync(
            () => _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, timeoutCts.Token),
            _settings.MaxRetries,
            _logger,
            "Anthropic.StreamAsync",
            timeoutCts.Token);

        response.EnsureSuccessStatusCode();

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
                using var doc = JsonDocument.Parse(data);
                var root = doc.RootElement;

                if (root.TryGetProperty("type", out var type) && type.GetString() == "content_block_delta")
                {
                    if (root.TryGetProperty("delta", out var delta) &&
                        delta.TryGetProperty("text", out var text))
                    {
                        yield return new AIStreamChunk
                        {
                            Content = text.GetString() ?? string.Empty,
                        };
                    }
                }
                else if (root.TryGetProperty("type", out var stopType) && stopType.GetString() == "message_stop")
                {
                    yield return new AIStreamChunk
                    {
                        Content = string.Empty,
                        FinishReason = "stop",
                    };
                    yield break;
                }
            }
        }
    }

    private object BuildRequestBody(AIRequest request, bool stream)
    {
        var messages = new List<object>();

        foreach (var msg in request.Messages)
        {
            messages.Add(new { role = msg.Role, content = msg.Content });
        }

        return new
        {
            model = _settings.Model,
            max_tokens = request.Options?.MaxTokens ?? 2048,
            system = request.SystemPrompt,
            messages,
            stream,
            temperature = request.Options?.Temperature ?? 0.7,
            top_p = request.Options?.TopP,
        };
    }

    private sealed class AnthropicResponse
    {
        public List<AnthropicContentBlock>? Content { get; set; }
        public string? Model { get; set; }
        public string? StopReason { get; set; }
        public AnthropicUsage? Usage { get; set; }
    }

    private sealed class AnthropicContentBlock
    {
        public string Type { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }

    private sealed class AnthropicUsage
    {
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
    }
}
