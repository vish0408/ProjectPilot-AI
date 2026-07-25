namespace TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public Guid RoleId { get; set; }
    public Guid? CollegeId { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? Password { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmployeeId { get; set; }
    public string? Designation { get; set; }
}
