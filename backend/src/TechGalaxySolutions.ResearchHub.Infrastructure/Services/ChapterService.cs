using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Chapter;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ChapterService : IChapterService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ChapterService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ChapterResponse>> GetProjectChaptersAsync(Guid projectId)
    {
        var chapters = await _context.Set<Chapter>().AsNoTracking()
            .Include(c => c.Comments).ThenInclude(c => c.User)
            .Where(c => c.ProjectId == projectId && !c.IsDeleted)
            .OrderBy(c => c.Order)
            .ToListAsync();

        return _mapper.Map<List<ChapterResponse>>(chapters);
    }

    public async Task<ChapterResponse> GetByIdAsync(Guid chapterId)
    {
        var chapter = await _context.Set<Chapter>().AsNoTracking()
            .Include(c => c.Comments).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == chapterId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Chapter not found");

        return _mapper.Map<ChapterResponse>(chapter);
    }

    public async Task<ChapterResponse> UpdateStatusAsync(Guid chapterId, Guid userId, UpdateChapterStatusRequest request)
    {
        var chapter = await _context.Set<Chapter>()
            .Include(c => c.Comments).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == chapterId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Chapter not found");

        await EnsureGuideForProjectAsync(chapter.ProjectId, userId);

        chapter.Status = Enum.Parse<ChapterStatus>(request.Status);

        if (!string.IsNullOrEmpty(request.Comment))
        {
            var comment = new ChapterComment
            {
                ChapterId = chapterId,
                UserId = userId,
                Content = request.Comment,
            };
            _context.Set<ChapterComment>().Add(comment);
        }

        await _context.SaveChangesAsync();

        return _mapper.Map<ChapterResponse>(chapter);
    }

    private async Task EnsureGuideForProjectAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        var studentProfile = await _context.Set<StudentProfile>().AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == project.StudentId && !s.IsDeleted);

        var activeAllocation = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Where(a => !a.IsDeleted
                && a.Status == AllocationStatus.Active
                && a.StudentId == project.StudentId)
            .OrderByDescending(a => a.AllocatedAt)
            .FirstOrDefaultAsync();

        var effectiveGuideId = activeAllocation?.GuideId ?? studentProfile?.GuideId;

        if (effectiveGuideId != userId)
            throw new UnauthorizedAccessException("Only the assigned guide can update this chapter");
    }
}
