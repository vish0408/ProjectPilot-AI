namespace TechGalaxySolutions.ResearchHub.Application.DTOs.GlobalAnnouncement;

public class CreateGlobalAnnouncementRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
}
