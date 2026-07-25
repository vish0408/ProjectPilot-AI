using TechGalaxySolutions.ResearchHub.Application.DTOs.Chat;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IChatService
{
    Task<ChatSessionResponse> CreateSessionAsync(Guid userId, CreateSessionRequest request);

    Task<ChatMessageResponse> SendMessageAsync(Guid userId, SendMessageRequest request);

    IAsyncEnumerable<ChatStreamChunk> StreamMessageAsync(Guid userId, SendMessageRequest request, CancellationToken cancellationToken);

    Task<List<ChatSessionResponse>> GetHistoryAsync(Guid userId);

    Task<ChatSessionDetailResponse> GetSessionAsync(Guid sessionId, Guid userId);

    Task DeleteSessionAsync(Guid sessionId, Guid userId);
}
