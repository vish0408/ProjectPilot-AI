namespace TechGalaxySolutions.ResearchHub.Application.DTOs.GlobalAnnouncement;

public class UpdateGlobalAnnouncementRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
