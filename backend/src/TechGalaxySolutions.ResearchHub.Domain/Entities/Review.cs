using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;

namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Review : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid GuideId { get; set; }
    public User Guide { get; set; } = null!;
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    public string Notes { get; set; } = string.Empty;
    public DateTime? ReviewedAt { get; set; }
}
