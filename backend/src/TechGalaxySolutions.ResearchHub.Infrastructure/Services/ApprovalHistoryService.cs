using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ApprovalHistory;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ApprovalHistoryService : IApprovalHistoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ApprovalHistoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ApprovalHistoryResponse>> GetProjectHistoryAsync(Guid userId, Guid projectId)
    {
        await EnsureGuideForProjectAsync(projectId, userId);

        var history = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Include(h => h.Project)
            .Include(h => h.Chapter)
            .Include(h => h.Guide)
            .Where(h => h.ProjectId == projectId && !h.IsDeleted)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ApprovalHistoryResponse>>(history);
    }

    public async Task<List<ApprovalHistoryResponse>> GetChapterHistoryAsync(Guid userId, Guid chapterId)
    {
        var chapter = await _context.Set<Chapter>().AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == chapterId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Chapter not found");

        await EnsureGuideForProjectAsync(chapter.ProjectId, userId);

        var history = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Include(h => h.Project)
            .Include(h => h.Chapter)
            .Include(h => h.Guide)
            .Where(h => h.ChapterId == chapterId && !h.IsDeleted)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ApprovalHistoryResponse>>(history);
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
            throw new UnauthorizedAccessException("Only the assigned guide can view this history");
    }
}
