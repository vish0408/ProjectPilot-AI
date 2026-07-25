using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class DocumentCommentService : IDocumentCommentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DocumentCommentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DocumentCommentResponse>> GetCommentsAsync(Guid documentId, Guid userId)
    {
        var comments = await _context.Set<DocumentComment>().AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Replies).ThenInclude(r => r.User)
            .Where(c => c.DocumentId == documentId && c.ParentCommentId == null && !c.IsDeleted)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        return comments.Select(MapComment).ToList();
    }

    public async Task<DocumentCommentResponse> CreateCommentAsync(Guid documentId, Guid userId, CreateDocumentCommentRequest request)
    {
        var doc = await _context.ProjectDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Document not found");

        var comment = new DocumentComment
        {
            DocumentId = documentId,
            UserId = userId,
            Content = request.Content,
            ParentCommentId = request.ParentCommentId,
        };

        _context.Set<DocumentComment>().Add(comment);
        await _context.SaveChangesAsync();

        await _context.Entry(comment).Reference(c => c.User).LoadAsync();

        return MapComment(comment);
    }

    public async Task<DocumentCommentResponse> UpdateCommentAsync(Guid commentId, Guid userId, string content)
    {
        var comment = await _context.Set<DocumentComment>()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == commentId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Comment not found");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You can only edit your own comments");

        comment.Content = content;
        comment.IsEdited = true;
        comment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapComment(comment);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _context.Set<DocumentComment>()
            .FirstOrDefaultAsync(c => c.Id == commentId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Comment not found");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own comments");

        comment.IsDeleted = true;
        comment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static DocumentCommentResponse MapComment(DocumentComment comment)
    {
        return new DocumentCommentResponse
        {
            Id = comment.Id,
            DocumentId = comment.DocumentId,
            UserId = comment.UserId,
            UserName = comment.User?.FullName ?? "Unknown",
            Content = comment.Content,
            ParentCommentId = comment.ParentCommentId,
            IsEdited = comment.IsEdited,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            Replies = comment.Replies?
                .Where(r => !r.IsDeleted)
                .OrderBy(r => r.CreatedAt)
                .Select(reply => new DocumentCommentResponse
                {
                    Id = reply.Id,
                    DocumentId = reply.DocumentId,
                    UserId = reply.UserId,
                    UserName = reply.User?.FullName ?? "Unknown",
                    Content = reply.Content,
                    ParentCommentId = reply.ParentCommentId,
                    IsEdited = reply.IsEdited,
                    CreatedAt = reply.CreatedAt,
                    UpdatedAt = reply.UpdatedAt,
                    Replies = new(),
                }).ToList() ?? new(),
        };
    }
}
