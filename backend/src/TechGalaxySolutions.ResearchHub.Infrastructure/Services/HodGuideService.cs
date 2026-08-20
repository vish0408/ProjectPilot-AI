using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
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
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var guides = await _context.Set<GuideProfile>().AsNoTracking()
            .Include(g => g.User).ThenInclude(u => u.DepartmentEntity)
            .Include(g => g.User).ThenInclude(u => u.CollegeEntity)
            .Where(g => !g.IsDeleted
                && g.User.CollegeId == hod.CollegeId
                && g.User.DepartmentId == hod.DepartmentId)
            .ToListAsync();

        var guideIds = guides.Select(g => g.UserId).ToList();

        var effectiveGuideByStudent = await GetEffectiveGuideMapAsync(hod);

        var assignedByGuide = effectiveGuideByStudent
            .Where(kv => kv.Value.HasValue && guideIds.Contains(kv.Value.Value))
            .ToLookup(kv => kv.Value!.Value, kv => kv.Key);

        var allStudentUserIds = effectiveGuideByStudent
            .Where(kv => kv.Value.HasValue)
            .Select(kv => kv.Key)
            .Distinct()
            .ToList();

        var projectCountsByStudent = new Dictionary<Guid, (int Active, int Completed)>();
        if (allStudentUserIds.Count > 0)
        {
            var projects = await _context.Projects.AsNoTracking()
                .Where(p => allStudentUserIds.Contains(p.StudentId) && !p.IsDeleted)
                .Select(p => new { p.StudentId, p.Status })
                .ToListAsync();
            projectCountsByStudent = projects
                .GroupBy(p => p.StudentId)
                .ToDictionary(
                    g => g.Key,
                    g => (
                        g.Count(p => p.Status == ProjectStatus.InProgress),
                        g.Count(p => p.Status == ProjectStatus.Completed)));
        }

        var result = new List<GuideSummaryResponse>();
        foreach (var guide in guides)
        {
            var assignedUserIds = assignedByGuide[guide.UserId].ToList();
            var activeCount = assignedUserIds.Sum(id => projectCountsByStudent.TryGetValue(id, out var c) ? c.Active : 0);
            var completedCount = assignedUserIds.Sum(id => projectCountsByStudent.TryGetValue(id, out var c) ? c.Completed : 0);

            result.Add(new GuideSummaryResponse
            {
                UserId = guide.UserId,
                FullName = guide.User.FullName,
                Email = guide.User.Email,
                EmployeeId = string.IsNullOrEmpty(guide.User.EmployeeId) ? "" : guide.User.EmployeeId,
                PhoneNumber = guide.User.PhoneNumber ?? "",
                Department = guide.Department ?? "",
                DepartmentId = guide.User.DepartmentId,
                CollegeId = guide.User.CollegeId,
                DepartmentName = guide.User.DepartmentEntity?.DepartmentName ?? guide.Department ?? "",
                CollegeName = guide.User.CollegeEntity?.Name ?? guide.User.College ?? "",
                Specialization = guide.Specialization ?? "",
                Designation = guide.Designation ?? "",
                IsAvailable = guide.IsAvailable,
                IsActive = guide.User.IsActive,
                AccountStatus = UserResponse.ComputeAccountStatus(guide.User.Status, guide.User.IsActive, guide.User.LockedUntil.HasValue && guide.User.LockedUntil.Value > DateTime.UtcNow, guide.User.IsFirstLogin, guide.User.TemporaryPasswordExpiresAt),
                AssignedStudents = assignedUserIds.Count,
                ActiveProjects = activeCount,
                CompletedProjects = completedCount,
            });
        }

        return result;
    }

    private async Task<Dictionary<Guid, Guid?>> GetEffectiveGuideMapAsync(Hod hod)
    {
        var scopeStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => !s.IsDeleted
                && s.User.CollegeId == hod.CollegeId
                && s.User.DepartmentId == hod.DepartmentId)
            .Select(s => new { s.UserId, s.GuideId })
            .ToListAsync();

        var scopeStudentIds = scopeStudents.Select(s => s.UserId).ToList();

        var activeAllocations = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Where(a => !a.IsDeleted
                && a.Status == AllocationStatus.Active
                && scopeStudentIds.Contains(a.StudentId))
            .Select(a => new { a.StudentId, a.GuideId, a.AllocatedAt })
            .OrderByDescending(a => a.AllocatedAt)
            .ToListAsync();
        var allocationByStudent = activeAllocations.ToLookup(a => a.StudentId);

        var map = new Dictionary<Guid, Guid?>(scopeStudents.Count);
        foreach (var student in scopeStudents)
        {
            var allocation = allocationByStudent[student.UserId].FirstOrDefault();
            map[student.UserId] = allocation?.GuideId ?? student.GuideId;
        }

        return map;
    }

    public async Task<GuideDetailResponse> GetGuideDetailAsync(Guid userId, Guid guideUserId)
    {
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var guide = await _context.Set<GuideProfile>().AsNoTracking()
            .Include(g => g.User).ThenInclude(u => u.DepartmentEntity)
            .Include(g => g.User).ThenInclude(u => u.CollegeEntity)
            .FirstOrDefaultAsync(g => g.UserId == guideUserId && !g.IsDeleted
                && g.User.CollegeId == hod.CollegeId
                && g.User.DepartmentId == hod.DepartmentId)
            ?? throw new KeyNotFoundException("Guide not found");

        var effectiveGuideByStudent = await GetEffectiveGuideMapAsync(hod);

        var scopeStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.ResearchStage)
            .Where(s => !s.IsDeleted
                && s.User.CollegeId == hod.CollegeId
                && s.User.DepartmentId == hod.DepartmentId)
            .ToListAsync();

        var assignedStudents = scopeStudents
            .Where(s => effectiveGuideByStudent.TryGetValue(s.UserId, out var guideId) && guideId == guideUserId)
            .ToList();

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
                Enrollment = string.IsNullOrEmpty(s.Enrollment) ? s.User.EmployeeId ?? "" : s.Enrollment,
                ResearchTopic = s.ResearchTopic ?? "",
                ResearchStageName = s.ResearchStage?.Name,
                ProjectStatus = proj?.Status.ToString() ?? "No Project",
                CompletionPercentage = proj?.CompletionPercentage ?? 0,
            });
        }

        return new GuideDetailResponse
        {
            UserId = guide.UserId,
            FullName = guide.User.FullName,
            Email = guide.User.Email,
            EmployeeId = string.IsNullOrEmpty(guide.User.EmployeeId) ? "" : guide.User.EmployeeId,
            PhoneNumber = guide.User.PhoneNumber ?? "",
            Department = guide.Department ?? "",
            DepartmentId = guide.User.DepartmentId,
            CollegeId = guide.User.CollegeId,
            DepartmentName = guide.User.DepartmentEntity?.DepartmentName ?? guide.Department ?? "",
            CollegeName = guide.User.CollegeEntity?.Name ?? guide.User.College ?? "",
            College = guide.User.College ?? "",
            Specialization = guide.Specialization ?? "",
            Designation = guide.Designation ?? "",
            Bio = guide.Bio ?? "",
            Institution = guide.Institution ?? "",
            IsAvailable = guide.IsAvailable,
            IsActive = guide.User.IsActive,
            AccountStatus = UserResponse.ComputeAccountStatus(guide.User.Status, guide.User.IsActive, guide.User.LockedUntil.HasValue && guide.User.LockedUntil.Value > DateTime.UtcNow, guide.User.IsFirstLogin, guide.User.TemporaryPasswordExpiresAt),
            EmailVerified = guide.User.EmailVerified,
            InvitationSentAt = guide.User.InvitationSentAt,
            ActivatedAt = guide.User.ActivatedAt,
            LastLoginAt = guide.User.LastLoginAt,
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
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var studentProfile = await _context.Set<StudentProfile>()
            .FirstOrDefaultAsync(s => s.UserId == request.StudentId && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Student not found");

        var studentUser = await _context.Users.AsNoTracking()
            .Where(u => u.Id == request.StudentId && !u.IsDeleted)
            .Select(u => new { u.CollegeId, u.DepartmentId })
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Student user not found");

        if (studentUser.CollegeId != hod.CollegeId || studentUser.DepartmentId != hod.DepartmentId)
            throw new UnauthorizedAccessException("You are not allowed to manage students outside your department");

        var guideUser = await _context.Users.FindAsync(request.GuideId)
            ?? throw new KeyNotFoundException("Guide not found");

        if (guideUser.CollegeId != hod.CollegeId || guideUser.DepartmentId != hod.DepartmentId)
            throw new UnauthorizedAccessException("You are not allowed to assign guides outside your department");

        var existingActive = await _context.Set<ProjectAllocation>()
            .Where(a => a.StudentId == request.StudentId && !a.IsDeleted && a.Status == AllocationStatus.Active)
            .ToListAsync();
        foreach (var old in existingActive)
        {
            old.Status = AllocationStatus.Changed;
            old.UpdatedAt = DateTime.UtcNow;
        }

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
