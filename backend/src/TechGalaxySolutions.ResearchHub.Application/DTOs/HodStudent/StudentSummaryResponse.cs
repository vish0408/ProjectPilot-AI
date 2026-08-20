namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;

public class StudentSummaryResponse
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
    public string PhoneNumber { get; set; } = string.Empty;
    public string AccountStatus { get; set; } = "Active";
    public bool IsActive { get; set; }
    public string ResearchTopic { get; set; } = string.Empty;
    public string? GuideName { get; set; }
    public Guid? GuideId { get; set; }
    public string? GuideEmployeeId { get; set; }
    public string? ProjectTitle { get; set; }
    public string? ProjectStatus { get; set; }
    public double CompletionPercentage { get; set; }
    public DateTime? JoiningCohort { get; set; }
    public string? ResearchStageName { get; set; }
    public int? RequiredCredits { get; set; }
    public int? EarnedCredits { get; set; }
    public string? CourseworkStatus { get; set; }
    public DateTime CreatedAt { get; set; }
}
