namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Permission;

public class UpdatePermissionRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
}
