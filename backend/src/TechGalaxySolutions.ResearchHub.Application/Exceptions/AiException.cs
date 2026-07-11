using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

namespace TechGalaxySolutions.ResearchHub.Application.Exceptions;

public class AiException : Exception
{
    public AIProviderType ProviderType { get; }

    public int? HttpStatusCode { get; }

    public AiException(AIProviderType providerType, string message, int? httpStatusCode = null)
        : base(message)
    {
        ProviderType = providerType;
        HttpStatusCode = httpStatusCode;
    }

    public AiException(AIProviderType providerType, string message, Exception innerException, int? httpStatusCode = null)
        : base(message, innerException)
    {
        ProviderType = providerType;
        HttpStatusCode = httpStatusCode;
    }
}
