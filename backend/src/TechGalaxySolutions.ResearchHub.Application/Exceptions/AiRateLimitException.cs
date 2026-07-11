using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

namespace TechGalaxySolutions.ResearchHub.Application.Exceptions;

public class AiRateLimitException : AiException
{
    public TimeSpan? RetryAfter { get; }

    public AiRateLimitException(AIProviderType providerType, TimeSpan? retryAfter = null)
        : base(providerType, $"Rate limit exceeded for {providerType}", 429)
    {
        RetryAfter = retryAfter;
    }
}
