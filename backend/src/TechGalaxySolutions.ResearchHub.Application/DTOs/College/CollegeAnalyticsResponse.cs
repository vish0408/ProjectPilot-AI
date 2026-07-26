namespace TechGalaxySolutions.ResearchHub.Application.DTOs.College;

public class CollegeAnalyticsResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int DepartmentCount { get; set; }
    public int StudentCount { get; set; }
    public int GuideCount { get; set; }
    public int HodCount { get; set; }
    public int CollegeAdminCount { get; set; }
    public int ResearchCount { get; set; }
}
