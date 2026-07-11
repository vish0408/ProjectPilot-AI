namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;

public class AssignGuideRequest
{
    public Guid StudentId { get; set; }
    public Guid GuideId { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
