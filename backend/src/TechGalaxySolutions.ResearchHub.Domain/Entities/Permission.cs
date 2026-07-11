namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Permission : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Group { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
