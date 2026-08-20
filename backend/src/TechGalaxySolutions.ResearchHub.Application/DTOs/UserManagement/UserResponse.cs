namespace TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

public class UserResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmployeeId { get; set; }
    public string? Department { get; set; }
    public string? College { get; set; }
    public string? Designation { get; set; }

    public bool IsFirstLogin { get; set; }
    public bool EmailVerified { get; set; }
    public DateTime? PasswordChangedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int FailedLoginCount { get; set; }
    public DateTime? LockedUntil { get; set; }
    public bool IsLocked => LockedUntil.HasValue && LockedUntil.Value > DateTime.UtcNow;

    public string Status { get; set; } = "Draft";
    public DateTime? InvitationSentAt { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public DateTime? TemporaryPasswordExpiresAt { get; set; }

    // Role-specific profile fields (populated from StudentProfile / GuideProfile / Hod)
    public string? Enrollment { get; set; }
    public string? ResearchTopic { get; set; }
    public Guid? GuideId { get; set; }
    public string? GuideName { get; set; }
    public Guid? AcademicYearId { get; set; }
    public string? AcademicYearName { get; set; }
    public Guid? SemesterId { get; set; }
    public string? SemesterName { get; set; }
    public string? Section { get; set; }

    // PhD scholar-specific
    public DateTime? JoiningCohort { get; set; }
    public DateTime? RegistrationDate { get; set; }
    public string? PhdMode { get; set; }
    public int? RequiredCredits { get; set; }
    public Guid? ResearchStageId { get; set; }
    public string? ResearchStageName { get; set; }
    public int? EarnedCredits { get; set; }
    public int? PassedPapers { get; set; }
    public int? PendingPapers { get; set; }
    public string? CourseworkStatus { get; set; }

    public string? Specialization { get; set; }
    public string? Bio { get; set; }
    public string? Qualification { get; set; }
    public int? YearsOfExperience { get; set; }
    public int AssignedStudents { get; set; }
    public string? ResearchStatus { get; set; }

    public string AccountStatus
    {
        get => ComputeAccountStatus(Status, IsActive, IsLocked, IsFirstLogin, TemporaryPasswordExpiresAt);
    }

    public static string ComputeAccountStatus(
        string status,
        bool isActive,
        bool isLocked,
        bool isFirstLogin,
        DateTime? temporaryPasswordExpiresAt)
    {
        if (status == "Locked") return "Locked";
        if (status == "Disabled") return "Disabled";
        if (status == "Draft") return "Draft";
        if (status == "InvitationSent") return "Invitation Sent";
        if (status == "EmailVerified") return "Email Verified";
        if (status == "Active") return "Active";
        if (!isActive) return "Inactive";
        if (isLocked) return "Locked";
        if (isFirstLogin) return "Pending Activation";
        if (temporaryPasswordExpiresAt.HasValue && temporaryPasswordExpiresAt.Value < DateTime.UtcNow) return "Password Expired";
        return "Active";
    }
}
