namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;

public class UpdateFacultyRequest
{
    public Guid DepartmentId { get; set; }
    public string Designation { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public bool IsActive { get; set; }
}
