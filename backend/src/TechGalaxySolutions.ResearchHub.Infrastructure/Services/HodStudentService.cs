using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodStudentService : IHodStudentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodStudentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResponse<StudentSummaryResponse>> GetStudentsAsync(Guid userId, string? search, string? sortBy, string? filterStatus, PagedRequest request)
    {
        var query = _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.Guide)
            .Where(s => !s.IsDeleted);

        if (!string.IsNullOrEmpty(search))
        {
            var term = search.ToLower();
            query = query.Where(s => s.User.FullName.ToLower().Contains(term)
                || s.User.Email.ToLower().Contains(term)
                || (s.Enrollment != null && s.Enrollment.ToLower().Contains(term)));
        }

        if (!string.IsNullOrEmpty(filterStatus))
        {
            if (filterStatus.ToLower() == "assigned")
                query = query.Where(s => s.GuideId != null);
            else if (filterStatus.ToLower() == "unassigned")
                query = query.Where(s => s.GuideId == null);
            else if (filterStatus.ToLower() == "active")
                query = query.Where(s => s.User.IsActive);
            else if (filterStatus.ToLower() == "inactive")
                query = query.Where(s => !s.User.IsActive);
        }

        var totalCount = await query.CountAsync();

        // Apply sorting
        IOrderedQueryable<StudentProfile> orderedQuery;
        switch (sortBy?.ToLower())
        {
            case "name":
                orderedQuery = query.OrderBy(s => s.User.FullName);
                break;
            case "email":
                orderedQuery = query.OrderBy(s => s.User.Email);
                break;
            case "enrollment":
                orderedQuery = query.OrderBy(s => s.Enrollment);
                break;
            case "progress":
                orderedQuery = query.OrderByDescending(s => _context.Projects.Where(p => p.StudentId == s.UserId).Max(p => (double?)p.CompletionPercentage) ?? 0);
                break;
            default:
                orderedQuery = query.OrderByDescending(s => s.CreatedAt);
                break;
        }

        var students = await orderedQuery
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var studentIds = students.Select(s => s.UserId).ToList();
        var studentProjects = await _context.Set<Project>().AsNoTracking()
            .Where(p => studentIds.Contains(p.StudentId) && !p.IsDeleted)
            .ToListAsync();
        var projectLookup = studentProjects.ToLookup(p => p.StudentId);

        var items = new List<StudentSummaryResponse>();
        foreach (var student in students)
        {
            var project = projectLookup[student.UserId].FirstOrDefault();
            items.Add(new StudentSummaryResponse
            {
                UserId = student.UserId,
                FullName = student.User.FullName,
                Email = student.User.Email,
                Enrollment = student.Enrollment ?? "",
                Department = student.Department ?? "",
                ResearchTopic = student.ResearchTopic ?? "",
                GuideName = student.Guide?.FullName,
                GuideId = student.GuideId,
                ProjectTitle = project?.Title,
                ProjectStatus = project?.Status.ToString(),
                CompletionPercentage = project?.CompletionPercentage ?? 0,
                CreatedAt = student.CreatedAt,
            });
        }

        return new PagedResponse<StudentSummaryResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<StudentDetailResponse> GetStudentDetailAsync(Guid userId, Guid studentUserId)
    {
        var student = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .ThenInclude(u => u.Role)
            .Include(s => s.Guide)
            .FirstOrDefaultAsync(s => s.UserId == studentUserId && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Student not found");

        var project = await _context.Projects.AsNoTracking()
            .Where(p => p.StudentId == studentUserId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        var roles = new List<string>();
        if (student.User.Role != null)
            roles.Add(student.User.Role.Name ?? "");

        return new StudentDetailResponse
        {
            UserId = student.UserId,
            FullName = student.User.FullName,
            Email = student.User.Email,
            Enrollment = student.Enrollment ?? "",
            Department = student.Department ?? "",
            College = student.User.College ?? "",
            PhoneNumber = student.User.PhoneNumber ?? "",
            ResearchTopic = student.ResearchTopic ?? "",
            GuideName = student.Guide?.FullName,
            GuideId = student.GuideId,
            ProjectTitle = project?.Title,
            ProjectId = project?.Id,
            ProjectStatus = project?.Status.ToString(),
            CompletionPercentage = project?.CompletionPercentage ?? 0,
            IsActive = student.User.IsActive,
            CreatedAt = student.CreatedAt,
            Roles = roles,
        };
    }

    public async Task AssignGuideAsync(Guid userId, AssignStudentGuideRequest request)
    {
        var studentProfile = await _context.Set<StudentProfile>()
            .FirstOrDefaultAsync(s => s.UserId == request.StudentId && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Student not found");

        var guide = await _context.Users.FindAsync(request.GuideId)
            ?? throw new KeyNotFoundException("Guide not found");

        var allocation = new ProjectAllocation
        {
            StudentId = request.StudentId,
            GuideId = request.GuideId,
            AllocatedByUserId = userId,
            Remarks = request.Remarks ?? "",
            Status = AllocationStatus.Active,
        };
        _context.Set<ProjectAllocation>().Add(allocation);

        studentProfile.GuideId = request.GuideId;
        studentProfile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task ToggleStudentStatusAsync(Guid userId, Guid studentUserId, bool isActive)
    {
        var user = await _context.Users.FindAsync(studentUserId)
            ?? throw new KeyNotFoundException("Student user not found");

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
