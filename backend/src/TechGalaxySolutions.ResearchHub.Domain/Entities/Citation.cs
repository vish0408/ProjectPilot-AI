namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Citation : BaseEntity
{
    public Guid ChatMessageId { get; set; }
    public string SourceTitle { get; set; } = string.Empty;
    public string? Authors { get; set; }
    public int? Year { get; set; }
    public string? SourceType { get; set; }
    public string? SectionName { get; set; }
    public string? Excerpt { get; set; }
    public double? RelevanceScore { get; set; }
    public string? DocumentReferenceId { get; set; }

    public ChatMessage ChatMessage { get; set; } = null!;
}
