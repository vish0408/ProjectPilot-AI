namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ResearchCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DisciplineGroup { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? DepartmentProfileId { get; set; }
    public DepartmentProfile? DepartmentProfile { get; set; }
    public ICollection<ResearchTopic> ResearchTopics { get; set; } = new List<ResearchTopic>();
}
