namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class AnalysisHistory : BaseEntity
{
    public Guid LiteratureReviewId { get; set; }

    public LiteratureReview LiteratureReview { get; set; } = null!;

    public string AnalysisType { get; set; } = string.Empty;

    public string InputSummary { get; set; } = string.Empty;

    public string OutputContent { get; set; } = string.Empty;

    public string? ProviderUsed { get; set; }

    public int? PromptTokensUsed { get; set; }

    public int? CompletionTokensUsed { get; set; }
}
