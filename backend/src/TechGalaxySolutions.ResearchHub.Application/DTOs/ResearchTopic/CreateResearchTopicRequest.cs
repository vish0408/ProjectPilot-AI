namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;

public class CreateResearchTopicRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
}
