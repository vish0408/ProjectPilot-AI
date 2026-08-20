using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideStudent;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class GuideStudentService : IGuideStudentService
{
    private readonly ApplicationDbContext _context;

    public GuideStudentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GuideStudentDetailResponse> GetAssignedStudentDetailAsync(Guid guideUserId, Guid studentUserId)
    {
        // Canonical assignments live in ProjectAllocation (Active). StudentProfile.GuideId is a
        // denormalized mirror, so a guide may only view students whose effective guide is them.
        var profileGuidedIds = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => s.GuideId == guideUserId && !s.IsDeleted)
            .Select(s => s.UserId)
            .ToListAsync();

        var allocationGuidedIds = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Where(a => !a.IsDeleted
                && a.Status == AllocationStatus.Active
                && a.GuideId == guideUserId)
            .Select(a => a.StudentId)
            .ToListAsync();

        var candidateStudentIds = profileGuidedIds.Union(allocationGuidedIds).ToList();

        var activeAllocations = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Include(a => a.Guide)
            .Where(a => !a.IsDeleted
                && a.Status == AllocationStatus.Active
                && candidateStudentIds.Contains(a.StudentId))
            .OrderByDescending(a => a.AllocatedAt)
            .ToListAsync();
        var allocationByStudent = activeAllocations.ToLookup(a => a.StudentId);

        // Only students whose effective guide is the authenticated guide.
        var profile = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User).ThenInclude(u => u.DepartmentEntity)
            .Include(s => s.User).ThenInclude(u => u.CollegeEntity)
            .Include(s => s.Guide)
            .Include(s => s.ResearchStage)
            .Include(s => s.Coursework)
            .FirstOrDefaultAsync(s => s.UserId == studentUserId && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Student not found");

        var effectiveGuideId = allocationByStudent[studentUserId].FirstOrDefault()?.GuideId ?? profile.GuideId;

        if (effectiveGuideId != guideUserId)
            throw new UnauthorizedAccessException("You are not allowed to view this student");

        var project = await _context.Projects.AsNoTracking()
            .Where(p => p.StudentId == studentUserId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        var effectiveGuide = allocationByStudent[studentUserId].FirstOrDefault()?.Guide;
        if (effectiveGuide == null)
            effectiveGuide = profile.Guide;

        var courseworkList = profile.Coursework.ToList();
        var earnedCredits = courseworkList.Where(UserManagementService.IsCourseworkPassed).Sum(c => c.Credits);

        return new GuideStudentDetailResponse
        {
            UserId = profile.UserId,
            FullName = profile.User.FullName,
            Email = profile.User.Email,
            EmployeeId = string.IsNullOrEmpty(profile.User.EmployeeId) ? profile.Enrollment : profile.User.EmployeeId,
            Enrollment = string.IsNullOrEmpty(profile.Enrollment) ? profile.User.EmployeeId ?? "" : profile.Enrollment,
            Department = profile.Department ?? "",
            DepartmentId = profile.User.DepartmentId,
            CollegeId = profile.User.CollegeId,
            DepartmentName = profile.User.DepartmentEntity?.DepartmentName ?? profile.Department ?? "",
            CollegeName = profile.User.CollegeEntity?.Name ?? profile.User.College ?? "",
            College = profile.User.College ?? "",
            PhoneNumber = profile.User.PhoneNumber ?? "",
            ResearchTopic = profile.ResearchTopic ?? "",
            GuideName = effectiveGuide?.FullName,
            GuideId = effectiveGuide?.Id,
            GuideEmployeeId = string.IsNullOrEmpty(effectiveGuide?.EmployeeId) ? null : effectiveGuide!.EmployeeId,
            ProjectTitle = project?.Title,
            ProjectId = project?.Id,
            ProjectStatus = project?.Status.ToString(),
            CompletionPercentage = project?.CompletionPercentage ?? 0,
            IsActive = profile.User.IsActive,
            AccountStatus = UserResponse.ComputeAccountStatus(profile.User.Status, profile.User.IsActive, profile.User.LockedUntil.HasValue && profile.User.LockedUntil.Value > DateTime.UtcNow, profile.User.IsFirstLogin, profile.User.TemporaryPasswordExpiresAt),
            EmailVerified = profile.User.EmailVerified,
            JoiningCohort = profile.JoiningCohort,
            RegistrationDate = profile.RegistrationDate,
            PhdMode = profile.PhdMode,
            ResearchStageId = profile.ResearchStageId,
            ResearchStageName = profile.ResearchStage?.Name,
            RequiredCredits = profile.RequiredCredits,
            EarnedCredits = earnedCredits,
            PassedPapers = courseworkList.Count(UserManagementService.IsCourseworkPassed),
            PendingPapers = courseworkList.Count(c => !UserManagementService.IsCourseworkPassed(c) && !c.IsCompleted),
            CourseworkStatus = UserManagementService.DeriveCourseworkStatus(profile.RequiredCredits, earnedCredits, courseworkList),
            CreatedAt = profile.CreatedAt,
            LastLoginAt = profile.User.LastLoginAt,
        };
    }
}
