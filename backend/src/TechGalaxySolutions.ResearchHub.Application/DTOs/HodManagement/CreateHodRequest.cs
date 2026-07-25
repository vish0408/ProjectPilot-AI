namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;

public class CreateHodRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? EmployeeId { get; set; }
    public string? Designation { get; set; }
    public string? Password { get; set; }
    public Guid DepartmentId { get; set; }
    public string Qualification { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
    public string? ProfilePhoto { get; set; }
    public string Status { get; set; } = "Active";
}
