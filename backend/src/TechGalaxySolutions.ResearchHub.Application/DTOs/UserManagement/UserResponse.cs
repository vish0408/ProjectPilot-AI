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
    public int FailedLoginCount { get; set; }
    public DateTime? LockedUntil { get; set; }
    public bool IsLocked => LockedUntil.HasValue && LockedUntil.Value > DateTime.UtcNow;

    public string Status { get; set; } = "Draft";
    public DateTime? InvitationSentAt { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public DateTime? TemporaryPasswordExpiresAt { get; set; }

    public string AccountStatus
    {
        get
        {
            if (Status == "Locked") return "Locked";
            if (Status == "Disabled") return "Disabled";
            if (Status == "Draft") return "Draft";
            if (Status == "InvitationSent") return "Invitation Sent";
            if (Status == "EmailVerified") return "Email Verified";
            if (Status == "Active") return "Active";
            if (!IsActive) return "Inactive";
            if (IsLocked) return "Locked";
            if (IsFirstLogin) return "Pending Activation";
            if (TemporaryPasswordExpiresAt.HasValue && TemporaryPasswordExpiresAt.Value < DateTime.UtcNow) return "Password Expired";
            return "Active";
        }
    }
}
