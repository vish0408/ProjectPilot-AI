namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;

public class UpdateResearchTopicRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public bool IsActive { get; set; } = true;
}
