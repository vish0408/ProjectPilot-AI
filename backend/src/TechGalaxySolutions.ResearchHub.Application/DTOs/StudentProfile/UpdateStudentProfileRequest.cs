namespace TechGalaxySolutions.ResearchHub.Application.DTOs.StudentProfile;

public class UpdateStudentProfileRequest
{
    public string Enrollment { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string? ResearchTopic { get; set; }
    public Guid? GuideId { get; set; }
}
