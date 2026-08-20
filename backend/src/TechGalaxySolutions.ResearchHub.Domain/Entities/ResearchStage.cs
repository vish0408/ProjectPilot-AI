namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ResearchStage : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<StudentProfile> Students { get; set; } = new List<StudentProfile>();
}
