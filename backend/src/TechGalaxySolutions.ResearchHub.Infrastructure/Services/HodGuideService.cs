using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodGuideService : IHodGuideService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodGuideService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<GuideSummaryResponse>> GetGuidesAsync(Guid userId)
    {
        var guides = await _context.Set<GuideProfile>().AsNoTracking()
            .Include(g => g.User)
            .Where(g => !g.IsDeleted)
            .ToListAsync();

        var guideIds = guides.Select(g => g.UserId).ToList();

        var studentCounts = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => s.GuideId.HasValue && guideIds.Contains(s.GuideId.Value) && !s.IsDeleted)
            .GroupBy(s => s.GuideId!.Value)
            .Select(g => new { GuideId = g.Key, Count = g.Count() })
            .ToListAsync();
        var studentCountLookup = studentCounts.ToDictionary(x => x.GuideId, x => x.Count);

        var completedProjects = await _context.Projects.AsNoTracking()
            .Where(p => guideIds.Contains(p.StudentId) && !p.IsDeleted && p.Status == ProjectStatus.Completed)
            .GroupBy(p => p.StudentId)
            .Select(g => new { StudentId = g.Key, Count = g.Count() })
            .ToListAsync();
        var completedProjectLookup = completedProjects.ToDictionary(x => x.StudentId, x => x.Count);

        var result = new List<GuideSummaryResponse>();
        foreach (var guide in guides)
        {
            var assignedCount = studentCountLookup.GetValueOrDefault(guide.UserId, 0);
            var completedCount = completedProjectLookup.GetValueOrDefault(guide.UserId, 0);

            result.Add(new GuideSummaryResponse
            {
                UserId = guide.UserId,
                FullName = guide.User.FullName,
                Email = guide.User.Email,
                Department = guide.Department ?? "",
                Specialization = guide.Specialization ?? "",
                Designation = guide.Designation ?? "",
                IsAvailable = guide.IsAvailable,
                AssignedStudents = assignedCount,
                CompletedProjects = completedCount,
            });
        }

        return result;
    }

    public async Task<GuideDetailResponse> GetGuideDetailAsync(Guid userId, Guid guideUserId)
    {
        var guide = await _context.Set<GuideProfile>().AsNoTracking()
            .Include(g => g.User)
            .FirstOrDefaultAsync(g => g.UserId == guideUserId && !g.IsDeleted)
            ?? throw new KeyNotFoundException("Guide not found");

        var assignedStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.GuideId == guideUserId && !s.IsDeleted)
            .ToListAsync();

        var assignedStudentIds = assignedStudents.Select(s => s.UserId).ToList();

        var projects = await _context.Projects.AsNoTracking()
            .Where(p => assignedStudentIds.Contains(p.StudentId) && !p.IsDeleted)
            .ToListAsync();
        var projectLookup = projects.ToLookup(p => p.StudentId);

        var completedCount = projects.Count(p => p.Status == ProjectStatus.Completed);
        var activeCount = projects.Count(p => p.Status == ProjectStatus.InProgress);

        var pendingReviews = await _context.Set<Domain.Entities.Review>().AsNoTracking()
            .CountAsync(r => r.GuideId == guideUserId && !r.IsDeleted && r.Status == ReviewStatus.Pending);

        var students = new List<GuidedStudentItem>();
        foreach (var s in assignedStudents)
        {
            var proj = projectLookup[s.UserId].FirstOrDefault();
            students.Add(new GuidedStudentItem
            {
                UserId = s.UserId,
                FullName = s.User.FullName,
                Email = s.User.Email,
                ResearchTopic = s.ResearchTopic ?? "",
                ProjectStatus = proj?.Status.ToString() ?? "No Project",
                CompletionPercentage = proj?.CompletionPercentage ?? 0,
            });
        }

        return new GuideDetailResponse
        {
            UserId = guide.UserId,
            FullName = guide.User.FullName,
            Email = guide.User.Email,
            PhoneNumber = guide.User.PhoneNumber ?? "",
            Department = guide.Department ?? "",
            College = guide.User.College ?? "",
            Specialization = guide.Specialization ?? "",
            Designation = guide.Designation ?? "",
            Bio = guide.Bio ?? "",
            Institution = guide.Institution ?? "",
            IsAvailable = guide.IsAvailable,
            AssignedStudents = assignedStudents.Count,
            MaxCapacity = 10,
            CompletedProjects = completedCount,
            ActiveProjects = activeCount,
            PendingReviews = pendingReviews,
            Students = students,
            CreatedAt = guide.CreatedAt,
        };
    }

    public async Task AssignGuideAsync(Guid userId, AssignGuideRequest request)
    {
        var studentProfile = await _context.Set<StudentProfile>()
            .FirstOrDefaultAsync(s => s.UserId == request.StudentId && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Student not found");

        var guideUser = await _context.Users.FindAsync(request.GuideId)
            ?? throw new KeyNotFoundException("Guide not found");

        var allocation = new ProjectAllocation
        {
            StudentId = request.StudentId,
            GuideId = request.GuideId,
            AllocatedByUserId = userId,
            Remarks = request.Remarks,
            Status = AllocationStatus.Active,
        };
        _context.Set<ProjectAllocation>().Add(allocation);

        studentProfile.GuideId = request.GuideId;
        studentProfile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
