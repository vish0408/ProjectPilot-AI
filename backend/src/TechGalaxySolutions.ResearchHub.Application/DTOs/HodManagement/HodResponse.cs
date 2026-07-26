namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;

public class HodResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public Guid CollegeId { get; set; }
    public string CollegeName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Qualification { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
    public string? ProfilePhoto { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
