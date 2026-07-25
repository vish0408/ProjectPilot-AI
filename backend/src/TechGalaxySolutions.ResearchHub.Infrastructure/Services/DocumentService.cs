using AutoMapper;
using Microsoft.AspNetCore.Http;
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
    private readonly IFileStorageService _fileStorage;
    private readonly IProjectService _projectService;

    public DocumentService(ApplicationDbContext context, IMapper mapper, IFileStorageService fileStorage, IProjectService projectService)
    {
        _context = context;
        _mapper = mapper;
        _fileStorage = fileStorage;
        _projectService = projectService;
    }

    public async Task<List<DocumentResponse>> GetProjectDocumentsAsync(Guid projectId, Guid userId)
    {
        await VerifyProjectAccess(projectId, userId);
        var documents = await _context.ProjectDocuments.AsNoTracking()
            .Include(d => d.Uploader)
            .Where(d => d.ProjectId == projectId && !d.IsDeleted)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        var docIds = documents.Select(d => d.Id).ToList();
        var latestReviews = await _context.Set<DocumentReview>().AsNoTracking()
            .Where(r => docIds.Contains(r.DocumentId) && !r.IsDeleted)
            .GroupBy(r => r.DocumentId)
            .Select(g => g.OrderByDescending(r => r.CreatedAt).FirstOrDefault())
            .ToListAsync();

        var reviewLookup = latestReviews
            .Where(r => r != null)
            .ToDictionary(r => r!.DocumentId);

        var result = _mapper.Map<List<DocumentResponse>>(documents);
        foreach (var doc in result)
        {
            if (reviewLookup.TryGetValue(doc.Id, out var review) && review is not null)
            {
                doc.Status = review.Status;
                doc.ReviewComment = review.Comment;
                doc.ReviewScore = review.Score;
                doc.ReviewedAt = review.ReviewedAt;
            }
        }
        return result;
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

        if (!string.IsNullOrEmpty(request.ContentData))
        {
            var bytes = Convert.FromBase64String(request.ContentData);
            document.ContentData = bytes;
            document.StoredFilePath = await _fileStorage.SaveFileAsync(bytes, request.FileName, "thesis");
            document.FileSize = bytes.Length;
            document.DocumentStatus = "Migrated";
        }

        _context.ProjectDocuments.Add(document);
        await _context.SaveChangesAsync();

        await NotifyGuideOfUpload(userId, request.FileName);
        await _projectService.RecalculateCompletionPercentageAsync(projectId);

        return _mapper.Map<DocumentResponse>(document);
    }

    public async Task<DocumentResponse> CreateWithFileAsync(Guid projectId, Guid userId, IFormFile file)
    {
        await VerifyProjectAccess(projectId, userId);
        var fileType = Path.GetExtension(file.FileName).TrimStart('.').ToLowerInvariant();
        var storedPath = await _fileStorage.SaveFileAsync(file, "thesis");

        var document = new ProjectDocument
        {
            ProjectId = projectId,
            FileName = file.FileName,
            FileType = fileType,
            FileSize = file.Length,
            UploaderId = userId,
            UploadedAt = DateTime.UtcNow,
            StoredFilePath = storedPath,
            DocumentStatus = "Migrated",
        };

        _context.ProjectDocuments.Add(document);
        await _context.SaveChangesAsync();

        await NotifyGuideOfUpload(userId, file.FileName);
        await _projectService.RecalculateCompletionPercentageAsync(projectId);

        return _mapper.Map<DocumentResponse>(document);
    }

    public async Task<FileDownloadResult?> DownloadFileAsync(Guid documentId, Guid userId)
    {
        var document = await _context.ProjectDocuments.AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == documentId && !d.IsDeleted);

        if (document == null)
            return null;

        if (document.DocumentStatus == "MissingFile")
        {
            throw new InvalidOperationException("The original file is no longer available.");
        }

        byte[]? data = null;

        if (!string.IsNullOrEmpty(document.StoredFilePath))
        {
            data = await _fileStorage.ReadFileAsync(document.StoredFilePath);
        }

        if (data == null && document.ContentData != null && document.ContentData.Length > 0)
        {
            data = document.ContentData;
        }

        if (data == null || data.Length == 0)
            return null;

        return new FileDownloadResult
        {
            Data = data,
            ContentType = _fileStorage.GetContentType(document.FileName),
            FileName = document.FileName,
        };
    }

    public async Task DeleteAsync(Guid documentId, Guid userId)
    {
        var document = await _context.ProjectDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Document not found");

        document.IsDeleted = true;
        document.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(document.StoredFilePath))
        {
            await _fileStorage.DeleteFileAsync(document.StoredFilePath);
        }

        await _context.SaveChangesAsync();

        await _projectService.RecalculateCompletionPercentageAsync(document.ProjectId);
    }

    public async Task NotifyGuideOfUpload(Guid userId, string fileName)
    {
        var studentProfile = await _context.Set<StudentProfile>()
            .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

        if (studentProfile?.GuideId != null)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = studentProfile.GuideId.Value,
                Title = "New Document Uploaded",
                Message = $"Student uploaded a new document: '{fileName}'.",
                Type = "info",
            });

            var hodProfile = await _context.Set<DepartmentProfile>()
                .FirstOrDefaultAsync(d => !d.IsDeleted);
            if (hodProfile?.HodUserId != null)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = hodProfile.HodUserId.Value,
                    Title = "Document Uploaded",
                    Message = $"A new document '{fileName}' was uploaded by a student.",
                    Type = "info",
                });
            }

            await _context.SaveChangesAsync();
        }
    }

    private async Task VerifyProjectAccess(Guid projectId, Guid userId)
    {
        var project = await _context.Projects.AsNoTracking()
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.StudentId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("Access denied");
    }
}
