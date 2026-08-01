namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;

public class HodResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public Guid CollegeId { get; set; }
    public string CollegeName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Qualification { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
    public string? ProfilePhoto { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public string? UserStatus { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool EmailVerified { get; set; }

    public string AccountStatus
    {
        get
        {
            if (UserStatus == "Locked") return "Locked";
            if (UserStatus == "Disabled") return "Disabled";
            if (UserStatus == "Draft") return "Pending Activation";
            if (UserStatus == "InvitationSent") return "Invitation Sent";
            if (UserStatus == "Active") return "Active";
            if (!IsActive) return "Inactive";
            if (ActivatedAt.HasValue) return "Active";
            return "Pending Activation";
        }
    }
}
