namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class AIProposal : BaseEntity
{
    public Guid StudentId { get; set; }

    public User Student { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string ResearchArea { get; set; } = string.Empty;

    public string Keywords { get; set; } = string.Empty;

    public string Difficulty { get; set; } = string.Empty;

    public string Duration { get; set; } = string.Empty;

    public string Abstract { get; set; } = string.Empty;

    public string Objectives { get; set; } = string.Empty;

    public string ProblemStatement { get; set; } = string.Empty;

    public string Scope { get; set; } = string.Empty;

    public string LiteratureReview { get; set; } = string.Empty;

    public string Methodology { get; set; } = string.Empty;

    public string ExpectedOutcome { get; set; } = string.Empty;

    public string Timeline { get; set; } = string.Empty;

    public string RequiredTools { get; set; } = string.Empty;

    public string ExpectedResult { get; set; } = string.Empty;

    public string FutureScope { get; set; } = string.Empty;

    public string References { get; set; } = string.Empty;

    public string Status { get; set; } = "Draft";
}
