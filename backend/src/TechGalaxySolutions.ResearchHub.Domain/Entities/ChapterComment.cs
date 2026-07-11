namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ChapterComment : BaseEntity
{
    public Guid ChapterId { get; set; }
    public Chapter Chapter { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public int? LineNumber { get; set; }
}
