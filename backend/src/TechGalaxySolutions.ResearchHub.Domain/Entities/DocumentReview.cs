namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class DocumentReview : BaseEntity
{
    public Guid DocumentId { get; set; }
    public ProjectDocument Document { get; set; } = null!;
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid GuideId { get; set; }
    public User Guide { get; set; } = null!;
    public string Status { get; set; } = "Pending";
    public string Comment { get; set; } = string.Empty;
    public int? Score { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
