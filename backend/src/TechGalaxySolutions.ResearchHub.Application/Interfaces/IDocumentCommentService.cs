using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IDocumentCommentService
{
    Task<List<DocumentCommentResponse>> GetCommentsAsync(Guid documentId, Guid userId);
    Task<DocumentCommentResponse> CreateCommentAsync(Guid documentId, Guid userId, CreateDocumentCommentRequest request);
    Task<DocumentCommentResponse> UpdateCommentAsync(Guid commentId, Guid userId, string content);
    Task DeleteCommentAsync(Guid commentId, Guid userId);
}
