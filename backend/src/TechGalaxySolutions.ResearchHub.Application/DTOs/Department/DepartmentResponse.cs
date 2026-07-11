namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

public class DepartmentResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CollegeId { get; set; }
    public string CollegeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int FacultyCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
