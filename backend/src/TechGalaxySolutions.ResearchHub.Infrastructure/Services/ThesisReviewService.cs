using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ThesisReview;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ThesisReviewService : IThesisReviewService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public ThesisReviewService(ApplicationDbContext context, IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<List<ThesisDocumentItem>> GetPendingReviewsAsync(Guid userId, string? role = null)
    {
        var query = _context.ProjectDocuments.AsNoTracking()
            .Include(d => d.Project).ThenInclude(p => p.Student)
            .Include(d => d.Uploader)
            .Where(d => !d.IsDeleted && d.Project.StudentId == d.UploaderId);

        if (role != "HOD" && role != "CollegeAdmin" && role != "SuperAdmin")
        {
            query = query.Where(d =>
                _context.Set<StudentProfile>().Any(s =>
                    s.UserId == d.UploaderId && s.GuideId == userId && !s.IsDeleted));
        }

        var documents = await query.OrderByDescending(d => d.UploadedAt).ToListAsync();

        var docIds = documents.Select(d => d.Id).ToList();

        var existingReviews = await _context.Set<DocumentReview>().AsNoTracking()
            .Where(r => docIds.Contains(r.DocumentId) && !r.IsDeleted)
            .ToListAsync();

        var reviewLookup = existingReviews.ToLookup(r => r.DocumentId);

        var studentProfiles = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => !s.IsDeleted)
            .ToListAsync();

        var profileLookup = studentProfiles.ToDictionary(s => s.UserId);

        var result = new List<ThesisDocumentItem>();
        foreach (var doc in documents)
        {
            var reviews = reviewLookup[doc.Id].ToList();
            var latestReview = reviews.OrderByDescending(r => r.CreatedAt).FirstOrDefault();
            var profile = profileLookup.GetValueOrDefault(doc.UploaderId);

            var studentName = doc.Project.Student?.FullName ?? doc.Uploader.FullName;

            var existingDocIds = await _context.ProjectDocuments.AsNoTracking()
                .Where(d => d.ProjectId == doc.ProjectId && !d.IsDeleted && d.Id != doc.Id)
                .CountAsync();

            result.Add(new ThesisDocumentItem
            {
                DocumentId = doc.Id,
                ProjectId = doc.ProjectId,
                ProjectTitle = doc.Project.Title,
                FileName = doc.FileName,
                FileType = doc.FileType,
                FileSize = doc.FileSize,
                UploadedAt = doc.UploadedAt,
                StudentId = doc.UploaderId,
                StudentName = studentName,
                Enrollment = profile?.Enrollment ?? "",
                Department = profile?.Department ?? doc.Project.Student?.Department ?? "",
                ResearchTopic = profile?.ResearchTopic ?? "",
                ReviewStatus = latestReview?.Status,
                ReviewId = latestReview?.Id,
                ReviewComment = latestReview?.Comment,
                ReviewScore = latestReview?.Score,
                ReviewedAt = latestReview?.ReviewedAt,
                Version = existingDocIds + 1,
            });
        }

        return result;
    }

    public async Task<List<ThesisDocumentItem>> GetStudentDocumentsAsync(Guid userId, Guid studentId, string? role = null)
    {
        var query = _context.ProjectDocuments.AsNoTracking()
            .Include(d => d.Project).ThenInclude(p => p.Student)
            .Include(d => d.Uploader)
            .Where(d => !d.IsDeleted && d.UploaderId == studentId)
            .Where(d => d.Project.StudentId == studentId || d.Project.Members.Any(m => m.UserId == studentId));

        if (role != "HOD" && role != "CollegeAdmin" && role != "SuperAdmin")
        {
            query = query.Where(d =>
                _context.Set<StudentProfile>().Any(s =>
                    s.UserId == studentId && s.GuideId == userId && !s.IsDeleted));
        }

        var documents = await query.OrderByDescending(d => d.UploadedAt).ToListAsync();

        var docIds = documents.Select(d => d.Id).ToList();

        var reviews = await _context.Set<DocumentReview>().AsNoTracking()
            .Where(r => docIds.Contains(r.DocumentId) && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var reviewLookup = reviews.ToLookup(r => r.DocumentId);

        var profile = await _context.Set<StudentProfile>().AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == studentId && !s.IsDeleted);

        var result = new List<ThesisDocumentItem>();
        foreach (var doc in documents)
        {
            var versionCount = await _context.ProjectDocuments.AsNoTracking()
                .CountAsync(d => d.ProjectId == doc.ProjectId && !d.IsDeleted);

            var docReviews = reviewLookup[doc.Id].ToList();
            var latest = docReviews.FirstOrDefault();

            result.Add(new ThesisDocumentItem
            {
                DocumentId = doc.Id,
                ProjectId = doc.ProjectId,
                ProjectTitle = doc.Project.Title,
                FileName = doc.FileName,
                FileType = doc.FileType,
                FileSize = doc.FileSize,
                UploadedAt = doc.UploadedAt,
                StudentId = studentId,
                StudentName = doc.Uploader.FullName,
                Enrollment = profile?.Enrollment ?? "",
                Department = profile?.Department ?? "",
                ResearchTopic = profile?.ResearchTopic ?? "",
                ReviewStatus = latest?.Status,
                ReviewId = latest?.Id,
                ReviewComment = latest?.Comment,
                ReviewScore = latest?.Score,
                ReviewedAt = latest?.ReviewedAt,
                Version = versionCount,
            });
        }

        return result;
    }

    public async Task<ThesisReviewResponse> ReviewDocumentAsync(Guid userId, Guid documentId, ThesisReviewRequest request, string? role = null)
    {
        var doc = await _context.ProjectDocuments
            .Include(d => d.Project).ThenInclude(p => p.Student)
            .FirstOrDefaultAsync(d => d.Id == documentId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Document not found");

        if (role != "HOD" && role != "CollegeAdmin" && role != "SuperAdmin")
        {
            var studentProfile = await _context.Set<StudentProfile>()
                .FirstOrDefaultAsync(s => s.UserId == doc.UploaderId && !s.IsDeleted);

            if (studentProfile?.GuideId != userId)
                throw new UnauthorizedAccessException("You are not authorized to review this document");
        }

        var review = new DocumentReview
        {
            DocumentId = documentId,
            ProjectId = doc.ProjectId,
            GuideId = userId,
            Status = request.Status,
            Comment = request.Comment ?? string.Empty,
            Score = request.Score,
            ReviewedAt = DateTime.UtcNow,
        };

        _context.Set<DocumentReview>().Add(review);

        var notifTitle = request.Status switch
        {
            "Approved" => "Thesis Approved",
            "Rejected" => "Thesis Rejected",
            "RevisionRequested" => "Revision Requested",
            _ => $"Thesis {request.Status}",
        };

        var notifType = request.Status switch
        {
            "Approved" => "success",
            "Rejected" => "error",
            "RevisionRequested" => "warning",
            _ => "info",
        };

        var notifMessage = request.Status switch
        {
            "Approved" => $"Your thesis document '{doc.FileName}' has been approved by your guide.",
            "Rejected" => $"Your thesis document '{doc.FileName}' has been rejected. Reason: {request.Comment}",
            "RevisionRequested" => $"Your guide has requested revisions for '{doc.FileName}'. Instructions: {request.Comment}",
            _ => $"Your thesis document '{doc.FileName}' status updated to {request.Status}.",
        };

        var notification = new Notification
        {
            UserId = doc.UploaderId,
            Title = notifTitle,
            Message = notifMessage,
            Type = notifType,
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            userId,
            $"ThesisReview_{request.Status}",
            "DocumentReview",
            review.Id.ToString(),
            null,
            $"DocumentId={documentId}, Status={request.Status}, Score={request.Score}");

        var studentName = doc.Project.Student?.FullName ?? "Student";

        return new ThesisReviewResponse
        {
            ReviewId = review.Id,
            DocumentId = documentId,
            ProjectId = doc.ProjectId,
            GuideId = userId,
            Status = request.Status,
            Comment = request.Comment,
            Score = request.Score,
            ReviewedAt = review.ReviewedAt,
            StudentName = studentName,
            DocumentName = doc.FileName,
        };
    }

    public async Task<List<ThesisDocumentItem>> GetDocumentVersionsAsync(Guid projectId, Guid documentId)
    {
        var documents = await _context.ProjectDocuments.AsNoTracking()
            .Include(d => d.Project).ThenInclude(p => p.Student)
            .Include(d => d.Uploader)
            .Where(d => d.ProjectId == projectId && !d.IsDeleted)
            .OrderBy(d => d.UploadedAt)
            .ToListAsync();

        var docIds = documents.Select(d => d.Id).ToList();

        var allReviews = await _context.Set<DocumentReview>().AsNoTracking()
            .Where(r => docIds.Contains(r.DocumentId) && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var reviewLookup = allReviews.ToLookup(r => r.DocumentId);

        var profile = documents.FirstOrDefault()?.UploaderId != null
            ? await _context.Set<StudentProfile>().AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == documents.First().UploaderId && !s.IsDeleted)
            : null;

        var result = new List<ThesisDocumentItem>();
        for (int i = 0; i < documents.Count; i++)
        {
            var doc = documents[i];
            var docReviews = reviewLookup[doc.Id].ToList();
            var latest = docReviews.FirstOrDefault();

            result.Add(new ThesisDocumentItem
            {
                DocumentId = doc.Id,
                ProjectId = doc.ProjectId,
                ProjectTitle = doc.Project.Title,
                FileName = doc.FileName,
                FileType = doc.FileType,
                FileSize = doc.FileSize,
                UploadedAt = doc.UploadedAt,
                StudentId = doc.UploaderId,
                StudentName = doc.Project.Student?.FullName ?? doc.Uploader.FullName,
                Enrollment = profile?.Enrollment ?? "",
                Department = profile?.Department ?? "",
                ResearchTopic = profile?.ResearchTopic ?? "",
                ReviewStatus = latest?.Status,
                ReviewId = latest?.Id,
                ReviewComment = latest?.Comment,
                ReviewScore = latest?.Score,
                ReviewedAt = latest?.ReviewedAt,
                Version = i + 1,
            });
        }

        return result;
    }
}
