namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;

public class AssignStudentGuideRequest
{
    public Guid StudentId { get; set; }
    public Guid GuideId { get; set; }
    public string? Remarks { get; set; }
}
