namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;

public class GuideSummaryResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public Guid? DepartmentId { get; set; }
    public Guid? CollegeId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string CollegeName { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public bool IsActive { get; set; }
    public string AccountStatus { get; set; } = "Active";
    public int AssignedStudents { get; set; }
    public int ActiveProjects { get; set; }
    public int CompletedProjects { get; set; }
}
