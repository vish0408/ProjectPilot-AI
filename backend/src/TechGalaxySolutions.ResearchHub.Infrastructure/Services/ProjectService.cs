using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Project;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProjectService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProjectResponse>> GetMyProjectsAsync(Guid userId)
    {
        var projects = await _context.Projects
            .Include(p => p.Student)
            .Include(p => p.Members).ThenInclude(m => m.User)
            .Where(p => p.StudentId == userId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ProjectResponse>>(projects);
    }

    public async Task<ProjectResponse> GetByIdAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Student)
            .Include(p => p.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.StudentId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("Access denied");

        return _mapper.Map<ProjectResponse>(project);
    }

    public async Task<ProjectResponse> CreateAsync(Guid userId, CreateProjectRequest request)
    {
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            StudentId = userId,
            Status = ProjectStatus.NotStarted,
            StartDate = DateTime.UtcNow,
            TargetEndDate = request.TargetEndDate,
            CompletionPercentage = 0,
        };

        _context.Projects.Add(project);

        var member = new ProjectMember
        {
            ProjectId = project.Id,
            UserId = userId,
            Role = MemberRole.Leader,
        };
        _context.ProjectMembers.Add(member);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(project.Id, userId);
    }

    public async Task<ProjectResponse> UpdateAsync(Guid projectId, Guid userId, UpdateProjectRequest request)
    {
        var project = await _context.Projects
            .Include(p => p.Student)
            .Include(p => p.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.StudentId != userId)
            throw new UnauthorizedAccessException("Only the project owner can update");

        project.Title = request.Title;
        project.Description = request.Description;
        project.Status = Enum.Parse<ProjectStatus>(request.Status);
        project.TargetEndDate = request.TargetEndDate;
        project.CompletionPercentage = request.CompletionPercentage;

        await _context.SaveChangesAsync();

        return _mapper.Map<ProjectResponse>(project);
    }

    public async Task DeleteAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.StudentId != userId)
            throw new UnauthorizedAccessException("Only the project owner can delete");

        project.IsDeleted = true;
        await _context.SaveChangesAsync();
    }

    public async Task<ProjectMemberResponse> AddMemberAsync(Guid projectId, Guid userId, Guid memberUserId, string role)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.StudentId != userId)
            throw new UnauthorizedAccessException("Only the project owner can add members");

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = memberUserId,
            Role = Enum.Parse<MemberRole>(role),
        };

        _context.ProjectMembers.Add(member);

        var user = await _context.Users.FindAsync(memberUserId)
            ?? throw new KeyNotFoundException("User not found");

        await _context.SaveChangesAsync();

        return new ProjectMemberResponse
        {
            Id = member.Id,
            UserId = memberUserId,
            UserName = user.FullName,
            Email = user.Email,
            Role = role,
        };
    }

    public async Task RemoveMemberAsync(Guid projectId, Guid userId, Guid memberId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.StudentId != userId)
            throw new UnauthorizedAccessException("Only the project owner can remove members");

        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.ProjectId == projectId)
            ?? throw new KeyNotFoundException("Member not found");

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
    }
}
