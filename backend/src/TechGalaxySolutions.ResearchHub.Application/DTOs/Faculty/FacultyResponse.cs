namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;

public class FacultyResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
