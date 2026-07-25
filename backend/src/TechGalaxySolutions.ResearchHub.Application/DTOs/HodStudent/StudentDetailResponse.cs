namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;

public class StudentDetailResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Enrollment { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string College { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string ResearchTopic { get; set; } = string.Empty;
    public string? GuideName { get; set; }
    public Guid? GuideId { get; set; }
    public string? ProjectTitle { get; set; }
    public Guid? ProjectId { get; set; }
    public string? ProjectStatus { get; set; }
    public double CompletionPercentage { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public List<string> Roles { get; set; } = new();
}
