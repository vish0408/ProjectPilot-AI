namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;

public class StudentSummaryResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Enrollment { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string ResearchTopic { get; set; } = string.Empty;
    public string? GuideName { get; set; }
    public Guid? GuideId { get; set; }
    public string? ProjectTitle { get; set; }
    public string? ProjectStatus { get; set; }
    public double CompletionPercentage { get; set; }
    public DateTime CreatedAt { get; set; }
}
