using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DocumentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DocumentResponse>> GetProjectDocumentsAsync(Guid projectId, Guid userId)
    {
        await VerifyProjectAccess(projectId, userId);

        var documents = await _context.ProjectDocuments
            .Include(d => d.Uploader)
            .Where(d => d.ProjectId == projectId && !d.IsDeleted)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        return _mapper.Map<List<DocumentResponse>>(documents);
    }

    public async Task<DocumentResponse> CreateAsync(Guid projectId, Guid userId, CreateDocumentRequest request)
    {
        await VerifyProjectAccess(projectId, userId);

        var document = new ProjectDocument
        {
            ProjectId = projectId,
            FileName = request.FileName,
            FileType = request.FileType,
            FileSize = request.FileSize,
            UploaderId = userId,
            UploadedAt = DateTime.UtcNow,
        };

        _context.ProjectDocuments.Add(document);
        await _context.SaveChangesAsync();

        return _mapper.Map<DocumentResponse>(document);
    }

    public async Task DeleteAsync(Guid documentId, Guid userId)
    {
        var document = await _context.ProjectDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Document not found");

        document.IsDeleted = true;
        await _context.SaveChangesAsync();
    }

    private async Task VerifyProjectAccess(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.StudentId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("Access denied");
    }
}
