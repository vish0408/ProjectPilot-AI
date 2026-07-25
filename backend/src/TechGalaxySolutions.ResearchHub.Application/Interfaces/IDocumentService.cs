using Microsoft.AspNetCore.Http;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public class FileDownloadResult
{
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}

public interface IDocumentService
{
    Task<List<DocumentResponse>> GetProjectDocumentsAsync(Guid projectId, Guid userId);
    Task<DocumentResponse> CreateAsync(Guid projectId, Guid userId, CreateDocumentRequest request);
    Task<DocumentResponse> CreateWithFileAsync(Guid projectId, Guid userId, IFormFile file);
    Task<FileDownloadResult?> DownloadFileAsync(Guid documentId, Guid userId);
    Task DeleteAsync(Guid documentId, Guid userId);
}
