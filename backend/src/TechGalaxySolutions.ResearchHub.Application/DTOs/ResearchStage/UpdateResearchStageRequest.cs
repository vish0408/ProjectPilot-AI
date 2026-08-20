namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchStage;

public class UpdateResearchStageRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
