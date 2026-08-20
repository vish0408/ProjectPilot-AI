namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodProfile;

public class HodProfileResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    // Real identity + scope fields
    public string? EmployeeId { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Designation { get; set; }
    public string CollegeName { get; set; } = string.Empty;
    public Guid? CollegeId { get; set; }
    public Guid? DepartmentId { get; set; }
    public string AccountStatus { get; set; } = "Active";
}
