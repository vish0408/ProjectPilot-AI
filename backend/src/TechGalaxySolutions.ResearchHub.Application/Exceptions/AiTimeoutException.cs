using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

namespace TechGalaxySolutions.ResearchHub.Application.Exceptions;

public class AiTimeoutException : AiException
{
    public TimeSpan Timeout { get; }

    public AiTimeoutException(AIProviderType providerType, TimeSpan timeout)
        : base(providerType, $"Request to {providerType} timed out after {timeout.TotalSeconds} seconds")
    {
        Timeout = timeout;
    }
}
