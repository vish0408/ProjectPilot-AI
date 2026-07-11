namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = new List<User>();

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}