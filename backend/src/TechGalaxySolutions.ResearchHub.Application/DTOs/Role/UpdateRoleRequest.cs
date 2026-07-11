namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Role;

public class UpdateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<Guid> PermissionIds { get; set; } = new();
    public bool IsActive { get; set; }
}
