using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ChapterComment;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ChapterCommentService : IChapterCommentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ChapterCommentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ChapterCommentResponse>> GetChapterCommentsAsync(Guid chapterId)
    {
        var comments = await _context.Set<ChapterComment>()
            .Include(c => c.User)
            .Where(c => c.ChapterId == chapterId && !c.IsDeleted)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ChapterCommentResponse>>(comments);
    }

    public async Task<ChapterCommentResponse> AddCommentAsync(Guid chapterId, Guid userId, AddChapterCommentRequest request)
    {
        var chapter = await _context.Set<Chapter>().FindAsync(chapterId)
            ?? throw new KeyNotFoundException("Chapter not found");

        var comment = new ChapterComment
        {
            ChapterId = chapterId,
            UserId = userId,
            Content = request.Content,
            LineNumber = request.LineNumber,
        };

        _context.Set<ChapterComment>().Add(comment);
        await _context.SaveChangesAsync();

        comment.User = (await _context.Users.FindAsync(userId))!;

        return _mapper.Map<ChapterCommentResponse>(comment);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _context.Set<ChapterComment>()
            .FirstOrDefaultAsync(c => c.Id == commentId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Comment not found");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own comments");

        comment.IsDeleted = true;
        await _context.SaveChangesAsync();
    }
}
