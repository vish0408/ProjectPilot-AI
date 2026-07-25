namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

public class CreateDepartmentRequest
{
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CollegeId { get; set; }
}
