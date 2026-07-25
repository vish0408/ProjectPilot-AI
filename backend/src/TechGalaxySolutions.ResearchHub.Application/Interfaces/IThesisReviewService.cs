using TechGalaxySolutions.ResearchHub.Application.DTOs.ThesisReview;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IThesisReviewService
{
    Task<List<ThesisDocumentItem>> GetPendingReviewsAsync(Guid userId, string? role = null);
    Task<List<ThesisDocumentItem>> GetStudentDocumentsAsync(Guid userId, Guid studentId, string? role = null);
    Task<ThesisReviewResponse> ReviewDocumentAsync(Guid userId, Guid documentId, ThesisReviewRequest request, string? role = null);
    Task<List<ThesisDocumentItem>> GetDocumentVersionsAsync(Guid projectId, Guid documentId);
}
