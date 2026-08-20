namespace TechGalaxySolutions.ResearchHub.Application.DTOs.GuideStudent;

public class GuideStudentDetailResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Enrollment { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public Guid? DepartmentId { get; set; }
    public Guid? CollegeId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string CollegeName { get; set; } = string.Empty;
    public string College { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string ResearchTopic { get; set; } = string.Empty;
    public string? GuideName { get; set; }
    public Guid? GuideId { get; set; }
    public string? GuideEmployeeId { get; set; }
    public string? ProjectTitle { get; set; }
    public Guid? ProjectId { get; set; }
    public string? ProjectStatus { get; set; }
    public double CompletionPercentage { get; set; }
    public bool IsActive { get; set; }
    public string AccountStatus { get; set; } = "Active";
    public bool EmailVerified { get; set; }
    public DateTime? JoiningCohort { get; set; }
    public DateTime? RegistrationDate { get; set; }
    public string? PhdMode { get; set; }
    public Guid? ResearchStageId { get; set; }
    public string? ResearchStageName { get; set; }
    public int? RequiredCredits { get; set; }
    public int? EarnedCredits { get; set; }
    public int? PassedPapers { get; set; }
    public int? PendingPapers { get; set; }
    public string? CourseworkStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
