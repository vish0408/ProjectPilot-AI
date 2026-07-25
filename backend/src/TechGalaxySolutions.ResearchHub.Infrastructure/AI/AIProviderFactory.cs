using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.Configuration;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.AI;

public class AIProviderFactory
{
    private readonly IEnumerable<IAIProvider> _providers;
    private readonly AISettings _settings;
    private readonly ILogger<AIProviderFactory> _logger;

    public AIProviderFactory(
        IEnumerable<IAIProvider> providers,
        AISettings settings,
        ILogger<AIProviderFactory> logger)
    {
        _providers = providers;
        _settings = settings;
        _logger = logger;
    }

    public IAIProvider GetDefaultProvider()
    {
        return GetProvider(_settings.DefaultProvider);
    }

    public IAIProvider GetProvider(AIProviderType type)
    {
        return GetProvider(type.ToString());
    }

    public IAIProvider GetProvider(string name)
    {
        var provider = _providers.FirstOrDefault(p =>
            p.ProviderType.ToString().Equals(name, StringComparison.OrdinalIgnoreCase));

        if (provider is null)
        {
            _logger.LogError("AI provider '{ProviderName}' not found", name);
            throw new AiException(AIProviderType.OpenAI, $"AI provider '{name}' not found. Configure at least one AI provider in appsettings.json.");
        }

        if (!provider.IsEnabled)
        {
            _logger.LogWarning("AI provider '{ProviderName}' is not enabled (missing API key). Trying fallback.", name);

            if (!string.IsNullOrEmpty(_settings.DefaultProvider) &&
                !_settings.DefaultProvider.Equals(name, StringComparison.OrdinalIgnoreCase))
            {
                var fallback = GetProvider(_settings.DefaultProvider);
                if (fallback.IsEnabled) return fallback;
            }

            var enabledProvider = _providers.FirstOrDefault(p => p.IsEnabled);
            if (enabledProvider is not null)
                return enabledProvider;

            var providerNames = string.Join(", ", _providers.Select(p => p.ProviderType));
            throw new AiException(AIProviderType.OpenAI,
                $"No AI provider is configured. Add a valid API key to one of: {providerNames} in appsettings.json section 'AI:Providers'.");
        }

        return provider;
    }

    public IEnumerable<IAIProvider> GetAllProviders()
    {
        return _providers;
    }

    public IEnumerable<IAIProvider> GetEnabledProviders()
    {
        return _providers.Where(p => p.IsEnabled);
    }
}
