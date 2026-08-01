namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? EmployeeId { get; set; }
    public string? Department { get; set; }
    public string? College { get; set; }
    public string? Designation { get; set; }
    public Guid? CollegeId { get; set; }
    public College? CollegeEntity { get; set; }
    public Guid? DepartmentId { get; set; }
    public Department? DepartmentEntity { get; set; }

    // Legacy fields
    public bool IsFirstLogin { get; set; } = true;
    public string? TemporaryPasswordHash { get; set; }
    public DateTime? TemporaryPasswordExpiresAt { get; set; }
    public DateTime? PasswordChangedAt { get; set; }
    public int FailedLoginCount { get; set; }
    public DateTime? LockedUntil { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiresAt { get; set; }

    // Activation workflow
    public string Status { get; set; } = "Draft";
    public bool EmailVerified { get; set; }
    public string? ActivationToken { get; set; }
    public DateTime? ActivationExpiry { get; set; }
    public DateTime? InvitationSentAt { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
