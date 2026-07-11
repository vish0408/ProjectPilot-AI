namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

public class CreateDepartmentRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CollegeId { get; set; }
}
