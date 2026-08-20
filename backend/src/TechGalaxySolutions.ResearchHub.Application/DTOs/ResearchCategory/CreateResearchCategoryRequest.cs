namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;

public class CreateResearchCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DisciplineGroup { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
