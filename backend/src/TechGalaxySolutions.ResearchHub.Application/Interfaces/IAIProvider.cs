using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAIProvider
{
    AIProviderType ProviderType { get; }

    bool IsEnabled { get; }

    Task<AIResponse> SendAsync(AIRequest request, CancellationToken cancellationToken = default);

    IAsyncEnumerable<AIStreamChunk> StreamAsync(AIRequest request, CancellationToken cancellationToken = default);
}
