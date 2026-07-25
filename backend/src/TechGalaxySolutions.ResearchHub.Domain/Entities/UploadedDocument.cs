namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class UploadedDocument : BaseEntity
{
    public Guid LiteratureReviewId { get; set; }

    public LiteratureReview LiteratureReview { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public string StoragePath { get; set; } = string.Empty;

    public string ExtractedText { get; set; } = string.Empty;

    public string? Title { get; set; }

    public string? Authors { get; set; }

    public string? Abstract { get; set; }

    public string? Sections { get; set; }

    public string? References { get; set; }

    public string? Doi { get; set; }

    public int? PublicationYear { get; set; }

    public string? Conference { get; set; }

    public string? Journal { get; set; }

    public string? Summary { get; set; }

    public string? Keywords { get; set; }

    public string? ResearchContributions { get; set; }

    public string? MethodologySummary { get; set; }

    public string? Strengths { get; set; }

    public string? Weaknesses { get; set; }

    public string? Limitations { get; set; }

    public string? FutureWork { get; set; }

    public string? NoveltyScore { get; set; }

    public Guid UploadedByUserId { get; set; }

    public User UploadedByUser { get; set; } = null!;
}
