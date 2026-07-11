using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IDocumentService
{
    Task<List<DocumentResponse>> GetProjectDocumentsAsync(Guid projectId, Guid userId);
    Task<DocumentResponse> CreateAsync(Guid projectId, Guid userId, CreateDocumentRequest request);
    Task DeleteAsync(Guid documentId, Guid userId);
}
