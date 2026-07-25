namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

public class DepartmentResponse
{
    public Guid Id { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CollegeId { get; set; }
    public string CollegeName { get; set; } = string.Empty;
    public Guid? HodId { get; set; }
    public string? HodName { get; set; }
    public bool IsActive { get; set; }
    public int FacultyCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
