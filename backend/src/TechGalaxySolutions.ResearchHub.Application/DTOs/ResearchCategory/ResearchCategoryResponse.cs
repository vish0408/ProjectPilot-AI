namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;

public class ResearchCategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int ResearchTopicCount { get; set; }
}
