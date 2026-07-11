namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public Guid RoleId { get; set; }

    public Role Role { get; set; } = null!;
}