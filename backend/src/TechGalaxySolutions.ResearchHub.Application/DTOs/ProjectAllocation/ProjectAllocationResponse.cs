namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ProjectAllocation;

public class ProjectAllocationResponse
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid GuideId { get; set; }
    public string GuideName { get; set; } = string.Empty;
    public Guid? ProjectId { get; set; }
    public string? ProjectTitle { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AllocatedAt { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string AllocatedByName { get; set; } = string.Empty;
}
