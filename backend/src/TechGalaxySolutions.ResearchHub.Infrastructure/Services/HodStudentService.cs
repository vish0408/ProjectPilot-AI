using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
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
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted);
        if (hod == null)
            throw new UnauthorizedAccessException("HOD profile not found");

        var query = _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User).ThenInclude(u => u.DepartmentEntity)
            .Include(s => s.User).ThenInclude(u => u.CollegeEntity)
            .Include(s => s.Guide)
            .Include(s => s.ResearchStage)
            .Include(s => s.Coursework)
            .Where(s => !s.IsDeleted
                && s.User.CollegeId == hod.CollegeId
                && s.User.DepartmentId == hod.DepartmentId);

        if (!string.IsNullOrEmpty(search))
        {
            var term = search.ToLower();
            query = query.Where(s => s.User.FullName.ToLower().Contains(term)
                || s.User.Email.ToLower().Contains(term)
                || (s.Enrollment != null && s.Enrollment.ToLower().Contains(term))
                || (s.User.EmployeeId != null && s.User.EmployeeId.ToLower().Contains(term))
                || (s.User.PhoneNumber != null && s.User.PhoneNumber.ToLower().Contains(term))
                || (s.ResearchTopic != null && s.ResearchTopic.ToLower().Contains(term))
                || (s.Guide != null && s.Guide.FullName.ToLower().Contains(term)));
        }

        if (!string.IsNullOrEmpty(filterStatus))
        {
            if (filterStatus.ToLower() == "assigned")
                query = query.Where(s => s.GuideId != null
                    || _context.Set<ProjectAllocation>().Any(a => a.StudentId == s.UserId && !a.IsDeleted && a.Status == AllocationStatus.Active));
            else if (filterStatus.ToLower() == "unassigned")
                query = query.Where(s => s.GuideId == null
                    && !_context.Set<ProjectAllocation>().Any(a => a.StudentId == s.UserId && !a.IsDeleted && a.Status == AllocationStatus.Active));
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

        var activeAllocations = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Include(a => a.Guide)
            .Where(a => !a.IsDeleted && a.Status == AllocationStatus.Active && studentIds.Contains(a.StudentId))
            .ToListAsync();
        var allocationLookup = activeAllocations
            .OrderByDescending(a => a.AllocatedAt)
            .ToLookup(a => a.StudentId);

        var items = new List<StudentSummaryResponse>();
        foreach (var student in students)
        {
            var project = projectLookup[student.UserId].FirstOrDefault();
            var effectiveGuide = allocationLookup[student.UserId].FirstOrDefault()?.Guide ?? student.Guide;
            var earnedCredits = student.Coursework.Where(UserManagementService.IsCourseworkPassed).Sum(c => c.Credits);
            var courseworkStatus = UserManagementService.DeriveCourseworkStatus(student.RequiredCredits, earnedCredits, student.Coursework.ToList());

            items.Add(new StudentSummaryResponse
            {
                UserId = student.UserId,
                FullName = student.User.FullName,
                Email = student.User.Email,
                EmployeeId = string.IsNullOrEmpty(student.User.EmployeeId) ? student.Enrollment : student.User.EmployeeId,
                Enrollment = string.IsNullOrEmpty(student.Enrollment) ? student.User.EmployeeId ?? "" : student.Enrollment,
                Department = student.Department ?? "",
                DepartmentId = student.User.DepartmentId,
                CollegeId = student.User.CollegeId,
                DepartmentName = student.User.DepartmentEntity?.DepartmentName ?? student.Department ?? "",
                CollegeName = student.User.CollegeEntity?.Name ?? student.User.College ?? "",
                PhoneNumber = student.User.PhoneNumber ?? "",
                AccountStatus = UserResponse.ComputeAccountStatus(student.User.Status, student.User.IsActive, student.User.LockedUntil.HasValue && student.User.LockedUntil.Value > DateTime.UtcNow, student.User.IsFirstLogin, student.User.TemporaryPasswordExpiresAt),
                IsActive = student.User.IsActive,
                ResearchTopic = student.ResearchTopic ?? "",
                GuideName = effectiveGuide?.FullName,
                GuideId = effectiveGuide?.Id,
                GuideEmployeeId = string.IsNullOrEmpty(effectiveGuide?.EmployeeId) ? null : effectiveGuide!.EmployeeId,
                ProjectTitle = project?.Title,
                ProjectStatus = project?.Status.ToString(),
                CompletionPercentage = project?.CompletionPercentage ?? 0,
                JoiningCohort = student.JoiningCohort,
                ResearchStageName = student.ResearchStage?.Name,
                RequiredCredits = student.RequiredCredits,
                EarnedCredits = earnedCredits,
                CourseworkStatus = courseworkStatus,
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
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var student = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User).ThenInclude(u => u.Role)
            .Include(s => s.User).ThenInclude(u => u.DepartmentEntity)
            .Include(s => s.User).ThenInclude(u => u.CollegeEntity)
            .Include(s => s.Guide)
            .Include(s => s.ResearchStage)
            .Include(s => s.Coursework)
            .FirstOrDefaultAsync(s => s.UserId == studentUserId && !s.IsDeleted
                && s.User.CollegeId == hod.CollegeId
                && s.User.DepartmentId == hod.DepartmentId)
            ?? throw new KeyNotFoundException("Student not found");

        var project = await _context.Projects.AsNoTracking()
            .Where(p => p.StudentId == studentUserId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        var activeAllocation = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Include(a => a.Guide)
            .Where(a => a.StudentId == studentUserId && !a.IsDeleted && a.Status == AllocationStatus.Active)
            .OrderByDescending(a => a.AllocatedAt)
            .FirstOrDefaultAsync();

        var effectiveGuide = activeAllocation?.Guide ?? student.Guide;

        var roles = new List<string>();
        if (student.User.Role != null)
            roles.Add(student.User.Role.Name ?? "");

        var earnedCredits = student.Coursework.Where(UserManagementService.IsCourseworkPassed).Sum(c => c.Credits);
        var courseworkList = student.Coursework.ToList();

        return new StudentDetailResponse
        {
            UserId = student.UserId,
            FullName = student.User.FullName,
            Email = student.User.Email,
            EmployeeId = string.IsNullOrEmpty(student.User.EmployeeId) ? student.Enrollment : student.User.EmployeeId,
            Enrollment = string.IsNullOrEmpty(student.Enrollment) ? student.User.EmployeeId ?? "" : student.Enrollment,
            Department = student.Department ?? "",
            DepartmentId = student.User.DepartmentId,
            CollegeId = student.User.CollegeId,
            DepartmentName = student.User.DepartmentEntity?.DepartmentName ?? student.Department ?? "",
            CollegeName = student.User.CollegeEntity?.Name ?? student.User.College ?? "",
            College = student.User.College ?? "",
            PhoneNumber = student.User.PhoneNumber ?? "",
            ResearchTopic = student.ResearchTopic ?? "",
            GuideName = effectiveGuide?.FullName,
            GuideId = effectiveGuide?.Id,
            GuideEmployeeId = string.IsNullOrEmpty(effectiveGuide?.EmployeeId) ? null : effectiveGuide!.EmployeeId,
            ProjectTitle = project?.Title,
            ProjectId = project?.Id,
            ProjectStatus = project?.Status.ToString(),
            CompletionPercentage = project?.CompletionPercentage ?? 0,
            IsActive = student.User.IsActive,
            AccountStatus = UserResponse.ComputeAccountStatus(student.User.Status, student.User.IsActive, student.User.LockedUntil.HasValue && student.User.LockedUntil.Value > DateTime.UtcNow, student.User.IsFirstLogin, student.User.TemporaryPasswordExpiresAt),
            EmailVerified = student.User.EmailVerified,
            InvitationSentAt = student.User.InvitationSentAt,
            ActivatedAt = student.User.ActivatedAt,
            JoiningCohort = student.JoiningCohort,
            RegistrationDate = student.RegistrationDate,
            PhdMode = student.PhdMode,
            ResearchStageId = student.ResearchStageId,
            ResearchStageName = student.ResearchStage?.Name,
            RequiredCredits = student.RequiredCredits,
            EarnedCredits = earnedCredits,
            PassedPapers = courseworkList.Count(UserManagementService.IsCourseworkPassed),
            PendingPapers = courseworkList.Count(c => !UserManagementService.IsCourseworkPassed(c) && !c.IsCompleted),
            CourseworkStatus = UserManagementService.DeriveCourseworkStatus(student.RequiredCredits, earnedCredits, courseworkList),
            CreatedAt = student.CreatedAt,
            LastLoginAt = student.User.LastLoginAt,
            Roles = roles,
        };
    }

    public async Task AssignGuideAsync(Guid userId, AssignStudentGuideRequest request)
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

        var guide = await _context.Users.FindAsync(request.GuideId)
            ?? throw new KeyNotFoundException("Guide not found");

        if (guide.CollegeId != hod.CollegeId || guide.DepartmentId != hod.DepartmentId)
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
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == studentUserId && !u.IsDeleted
                && u.CollegeId == hod.CollegeId
                && u.DepartmentId == hod.DepartmentId)
            ?? throw new KeyNotFoundException("Student user not found");

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
