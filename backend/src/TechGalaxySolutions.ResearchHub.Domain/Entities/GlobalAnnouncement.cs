namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class GlobalAnnouncement : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Priority { get; set; } = "Normal";

    public string Status { get; set; } = "Draft";

    public DateTime? PublishedAt { get; set; }

    public Guid CreatedByUserId { get; set; }

    public User CreatedByUser { get; set; } = null!;
}
