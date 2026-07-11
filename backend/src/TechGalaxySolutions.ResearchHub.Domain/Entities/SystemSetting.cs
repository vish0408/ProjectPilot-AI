namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class SystemSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Group { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
