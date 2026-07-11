namespace TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public Guid RoleId { get; set; }
}
