namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ProjectAllocation;

public class CreateAllocationRequest
{
    public Guid StudentId { get; set; }
    public Guid GuideId { get; set; }
    public Guid? ProjectId { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
