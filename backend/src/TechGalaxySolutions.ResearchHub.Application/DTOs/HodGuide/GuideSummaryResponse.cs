namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;

public class GuideSummaryResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public int AssignedStudents { get; set; }
    public int CompletedProjects { get; set; }
}
