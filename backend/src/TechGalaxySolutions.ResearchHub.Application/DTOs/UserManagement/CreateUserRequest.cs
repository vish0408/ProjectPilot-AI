namespace TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

public class CreateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public Guid RoleId { get; set; }
    public Guid? CollegeId { get; set; }
    public Guid? DepartmentId { get; set; }
    public bool IsActive { get; set; } = true;
    public bool SendWelcomeEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmployeeId { get; set; }
    public string? Designation { get; set; }
}
