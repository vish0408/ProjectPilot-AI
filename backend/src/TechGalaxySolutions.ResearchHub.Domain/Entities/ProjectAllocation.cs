using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;

namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ProjectAllocation : BaseEntity
{
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public Guid GuideId { get; set; }
    public User Guide { get; set; } = null!;
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public Guid AllocatedByUserId { get; set; }
    public User AllocatedByUser { get; set; } = null!;
    public AllocationStatus Status { get; set; } = AllocationStatus.Active;
    public DateTime AllocatedAt { get; set; } = DateTime.UtcNow;
    public string Remarks { get; set; } = string.Empty;
}
