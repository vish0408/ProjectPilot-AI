using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Milestone;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class MilestoneService : IMilestoneService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public MilestoneService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<MilestoneResponse>> GetProjectMilestonesAsync(Guid projectId, Guid userId)
    {
        await VerifyProjectAccess(projectId, userId);

        var milestones = await _context.Milestones.AsNoTracking()
            .Where(m => m.ProjectId == projectId && !m.IsDeleted)
            .OrderBy(m => m.TargetDate)
            .ToListAsync();

        return _mapper.Map<List<MilestoneResponse>>(milestones);
    }

    public async Task<MilestoneResponse> CreateAsync(Guid projectId, Guid userId, CreateMilestoneRequest request)
    {
        await VerifyProjectAccess(projectId, userId);

        var milestone = new Milestone
        {
            ProjectId = projectId,
            Title = request.Title,
            Description = request.Description,
            TargetDate = request.TargetDate,
            IsCompleted = false,
        };

        _context.Milestones.Add(milestone);
        await _context.SaveChangesAsync();

        return _mapper.Map<MilestoneResponse>(milestone);
    }

    public async Task<MilestoneResponse> UpdateAsync(Guid milestoneId, Guid userId, UpdateMilestoneRequest request)
    {
        var milestone = await _context.Milestones
            .FirstOrDefaultAsync(m => m.Id == milestoneId && !m.IsDeleted)
            ?? throw new KeyNotFoundException("Milestone not found");

        await VerifyProjectAccess(milestone.ProjectId, userId);

        milestone.Title = request.Title;
        milestone.Description = request.Description;
        milestone.TargetDate = request.TargetDate;
        milestone.IsCompleted = request.IsCompleted;

        await _context.SaveChangesAsync();

        return _mapper.Map<MilestoneResponse>(milestone);
    }

    public async Task DeleteAsync(Guid milestoneId, Guid userId)
    {
        var milestone = await _context.Milestones
            .FirstOrDefaultAsync(m => m.Id == milestoneId && !m.IsDeleted)
            ?? throw new KeyNotFoundException("Milestone not found");

        await VerifyProjectAccess(milestone.ProjectId, userId);

        milestone.IsDeleted = true;
        await _context.SaveChangesAsync();
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
