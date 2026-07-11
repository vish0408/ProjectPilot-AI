namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Permission;

public class PermissionResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
