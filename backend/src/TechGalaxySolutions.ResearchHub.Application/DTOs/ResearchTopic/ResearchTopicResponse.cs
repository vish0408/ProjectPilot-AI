namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;

public class ResearchTopicResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
}
