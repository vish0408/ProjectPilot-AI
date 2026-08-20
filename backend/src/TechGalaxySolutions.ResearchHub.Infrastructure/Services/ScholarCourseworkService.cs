using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Coursework;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Constants;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ScholarCourseworkService : IScholarCourseworkService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IAuditLogService _auditLogService;

    public ScholarCourseworkService(ApplicationDbContext context, IMapper mapper, IAuditLogService auditLogService)
    {
        _context = context;
        _mapper = mapper;
        _auditLogService = auditLogService;
    }

    public async Task<List<CourseworkResponse>> GetCourseworkAsync(Guid studentUserId, Guid currentUserId, string role, Guid? collegeId)
    {
        var profile = await ResolveAccessibleStudentAsync(studentUserId, currentUserId, role, collegeId);
        var items = await _context.Set<ScholarCoursework>().AsNoTracking()
            .Where(c => c.StudentProfileId == profile.Id && !c.IsDeleted)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
        return _mapper.Map<List<CourseworkResponse>>(items);
    }

    public async Task<CourseworkResponse> GetCourseworkItemAsync(Guid studentUserId, Guid courseworkId, Guid currentUserId, string role, Guid? collegeId)
    {
        var profile = await ResolveAccessibleStudentAsync(studentUserId, currentUserId, role, collegeId);
        var item = await _context.Set<ScholarCoursework>().AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == courseworkId && c.StudentProfileId == profile.Id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Coursework not found");
        return _mapper.Map<CourseworkResponse>(item);
    }

    public async Task<CourseworkResponse> CreateAsync(Guid studentUserId, CreateCourseworkRequest request, Guid currentUserId, string role, Guid? collegeId)
    {
        var profile = await ResolveAccessibleStudentAsync(studentUserId, currentUserId, role, collegeId, allowStudentSelf: false);
        ValidateRequest(request.PaperCode, request.PaperName, request.Credits, request.ExamStatus, request.CompletedDate, profile.RegistrationDate);

        var duplicate = await _context.Set<ScholarCoursework>().AsNoTracking()
            .AnyAsync(c => c.StudentProfileId == profile.Id && c.PaperCode == request.PaperCode && !c.IsDeleted);
        if (duplicate)
            throw new ConflictException($"Coursework paper '{request.PaperCode}' already exists for this scholar");

        var entity = new ScholarCoursework
        {
            StudentProfileId = profile.Id,
            PaperCode = request.PaperCode,
            PaperName = request.PaperName,
            Credits = request.Credits,
            ExamType = request.ExamType,
            ExamStatus = request.ExamStatus,
            Result = request.Result,
            Marks = request.Marks,
            Grade = request.Grade,
            AttemptDate = request.AttemptDate,
            CompletedDate = request.CompletedDate,
            IsCompleted = request.ExamStatus.Equals(PhdConstants.ExamStatusPassed, StringComparison.OrdinalIgnoreCase),
        };

        _context.Set<ScholarCoursework>().Add(entity);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(currentUserId, "Coursework Added", "Coursework", entity.Id.ToString(), null,
            $"{entity.PaperCode} ({entity.PaperName}) - {entity.Credits} credits");

        return _mapper.Map<CourseworkResponse>(entity);
    }

    public async Task<CourseworkResponse> UpdateAsync(Guid studentUserId, Guid courseworkId, UpdateCourseworkRequest request, Guid currentUserId, string role, Guid? collegeId)
    {
        var profile = await ResolveAccessibleStudentAsync(studentUserId, currentUserId, role, collegeId, allowStudentSelf: false);
        ValidateRequest(request.PaperCode, request.PaperName, request.Credits, request.ExamStatus, request.CompletedDate, profile.RegistrationDate);

        var entity = await _context.Set<ScholarCoursework>()
            .FirstOrDefaultAsync(c => c.Id == courseworkId && c.StudentProfileId == profile.Id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Coursework not found");

        var previousState = $"{entity.PaperCode} | {entity.ExamStatus} | {entity.Credits} credits | {entity.Result ?? "-"}";

        var duplicate = await _context.Set<ScholarCoursework>().AsNoTracking()
            .AnyAsync(c => c.StudentProfileId == profile.Id && c.Id != courseworkId && c.PaperCode == request.PaperCode && !c.IsDeleted);
        if (duplicate)
            throw new ConflictException($"Coursework paper '{request.PaperCode}' already exists for this scholar");

        entity.PaperCode = request.PaperCode;
        entity.PaperName = request.PaperName;
        entity.Credits = request.Credits;
        entity.ExamType = request.ExamType;
        entity.ExamStatus = request.ExamStatus;
        entity.Result = request.Result;
        entity.Marks = request.Marks;
        entity.Grade = request.Grade;
        entity.AttemptDate = request.AttemptDate;
        entity.CompletedDate = request.CompletedDate;
        entity.IsCompleted = request.ExamStatus.Equals(PhdConstants.ExamStatusPassed, StringComparison.OrdinalIgnoreCase);
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(currentUserId, "Coursework Updated", "Coursework", entity.Id.ToString(), previousState,
            $"{entity.PaperCode} | {entity.ExamStatus} | {entity.Credits} credits | {entity.Result ?? "-"}");

        return _mapper.Map<CourseworkResponse>(entity);
    }

    public async Task DeleteAsync(Guid studentUserId, Guid courseworkId, Guid currentUserId, string role, Guid? collegeId)
    {
        var profile = await ResolveAccessibleStudentAsync(studentUserId, currentUserId, role, collegeId, allowStudentSelf: false);
        var entity = await _context.Set<ScholarCoursework>()
            .FirstOrDefaultAsync(c => c.Id == courseworkId && c.StudentProfileId == profile.Id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Coursework not found");

        var previousState = $"{entity.PaperCode} | {entity.PaperName} | {entity.Credits} credits";

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(currentUserId, "Coursework Deleted", "Coursework", entity.Id.ToString(), previousState, null);
    }

    public async Task<CourseworkSummaryResponse> GetSummaryAsync(Guid studentUserId, Guid currentUserId, string role, Guid? collegeId)
    {
        var profile = await ResolveAccessibleStudentAsync(studentUserId, currentUserId, role, collegeId);
        var items = await _context.Set<ScholarCoursework>().AsNoTracking()
            .Where(c => c.StudentProfileId == profile.Id && !c.IsDeleted)
            .ToListAsync();

        var earned = items.Where(UserManagementService.IsCourseworkPassed).Sum(c => c.Credits);
        var passed = items.Count(UserManagementService.IsCourseworkPassed);
        var pending = items.Count(c => !c.IsCompleted && !c.IsDeleted);
        var failed = items.Count(c => c.ExamStatus.Equals(PhdConstants.ExamStatusFailed, StringComparison.OrdinalIgnoreCase));
        var required = profile.RequiredCredits ?? 0;
        var remaining = required > 0 ? Math.Max(0, required - earned) : 0;
        var percentage = required > 0 ? Math.Round((decimal)earned / required * 100, 0) : (items.Count > 0 ? 100m : 0m);

        return new CourseworkSummaryResponse
        {
            RequiredCredits = profile.RequiredCredits,
            EarnedCredits = earned,
            RemainingCredits = remaining,
            TotalPapers = items.Count,
            PassedPapers = passed,
            PendingPapers = pending,
            FailedPapers = failed,
            CourseworkStatus = UserManagementService.DeriveCourseworkStatus(profile.RequiredCredits, earned, items),
            CompletionPercentage = percentage,
        };
    }

    private async Task<StudentProfile> ResolveAccessibleStudentAsync(Guid studentUserId, Guid currentUserId, string role, Guid? collegeId, bool allowStudentSelf = true)
    {
        var profile = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(sp => sp.User)
            .FirstOrDefaultAsync(sp => sp.UserId == studentUserId && !sp.IsDeleted)
            ?? throw new KeyNotFoundException("Scholar not found");

        var roleName = role.ToLowerInvariant();

        if (roleName == "student")
        {
            if (!allowStudentSelf)
                throw new ForbiddenException("Scholars cannot modify official coursework results");
            if (profile.UserId != currentUserId)
                throw new ForbiddenException("You can only view your own coursework");
            return profile;
        }

        if (roleName == "superadmin")
            return profile;

        if (roleName == "collegeadmin")
        {
            if (!collegeId.HasValue || profile.User.CollegeId != collegeId.Value)
                throw new ForbiddenException("You are not allowed to access scholars in another college");
            return profile;
        }

        if (roleName == "hod")
        {
            var hod = await _context.Set<Hod>().AsNoTracking()
                .FirstOrDefaultAsync(h => h.UserId == currentUserId && !h.IsDeleted)
                ?? throw new ForbiddenException("HOD profile not found");
            if (profile.User.CollegeId != hod.CollegeId || profile.User.DepartmentId != hod.DepartmentId)
                throw new ForbiddenException("You are not allowed to access scholars outside your department");
            return profile;
        }

        if (roleName == "guide")
        {
            if (profile.GuideId != currentUserId)
                throw new ForbiddenException("You are not allowed to access scholars not assigned to you");
            return profile;
        }

        throw new ForbiddenException("Access denied");
    }

    private static void ValidateRequest(string paperCode, string paperName, int credits, string examStatus, DateTime? completedDate, DateTime? registrationDate)
    {
        if (string.IsNullOrWhiteSpace(paperCode))
            throw new InvalidOperationException("Paper code is required");
        if (string.IsNullOrWhiteSpace(paperName))
            throw new InvalidOperationException("Paper name is required");
        if (credits <= 0)
            throw new InvalidOperationException("Credits must be greater than zero");
        if (string.IsNullOrWhiteSpace(examStatus))
            throw new InvalidOperationException("Exam status is required");
        if (completedDate.HasValue && registrationDate.HasValue && completedDate.Value.Date < registrationDate.Value.Date)
            throw new InvalidOperationException("Completed date cannot precede the scholar's registration date");
    }
}
