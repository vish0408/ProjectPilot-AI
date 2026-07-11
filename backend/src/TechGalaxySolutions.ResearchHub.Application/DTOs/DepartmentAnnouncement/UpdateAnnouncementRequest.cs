namespace TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;

public class UpdateAnnouncementRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
    public string Status { get; set; } = "Draft";
    public DateTime? ScheduledAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
