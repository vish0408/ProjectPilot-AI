namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class LiteratureReview : BaseEntity
{
    public Guid StudentId { get; set; }

    public User Student { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string ResearchArea { get; set; } = string.Empty;

    public string? ExecutiveSummary { get; set; }

    public string? ResearchGaps { get; set; }

    public string? RelatedWork { get; set; }

    public string? ComparisonResults { get; set; }

    public string? Status { get; set; } = "Draft";

    public ICollection<UploadedDocument> Documents { get; set; } = new List<UploadedDocument>();

    public ICollection<AnalysisHistory> AnalysisHistories { get; set; } = new List<AnalysisHistory>();
}
