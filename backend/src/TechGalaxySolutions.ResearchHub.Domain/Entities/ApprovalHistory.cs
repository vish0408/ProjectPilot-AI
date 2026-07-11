using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;

namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ApprovalHistory : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid? ChapterId { get; set; }
    public Chapter? Chapter { get; set; }
    public Guid GuideId { get; set; }
    public User Guide { get; set; } = null!;
    public ApprovalAction Action { get; set; }
    public string Comments { get; set; } = string.Empty;
    public string PreviousStatus { get; set; } = string.Empty;
}
