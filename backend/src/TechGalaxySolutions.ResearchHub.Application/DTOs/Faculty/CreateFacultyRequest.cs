namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;

public class CreateFacultyRequest
{
    public Guid UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public string Designation { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
}
