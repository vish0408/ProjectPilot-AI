namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Proposal;

public class GenerateProposalRequest
{
    public string ResearchArea { get; set; } = string.Empty;

    public string Keywords { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Medium";

    public string Duration { get; set; } = "6 Months";

    public string? AdditionalContext { get; set; }
}

public class ImproveProposalRequest
{
    public string SectionName { get; set; } = string.Empty;

    public string SectionContent { get; set; } = string.Empty;

    public string ImprovementType { get; set; } = "Improve";

    public string ResearchArea { get; set; } = string.Empty;
}

public class RegenerateSectionRequest
{
    public Guid ProposalId { get; set; }

    public string SectionName { get; set; } = string.Empty;

    public string ResearchArea { get; set; } = string.Empty;

    public string Keywords { get; set; } = string.Empty;
}

public class ProposalResponse
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

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

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

public class SaveProposalRequest
{
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
}

public class ProposalTemplateResponse
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string ResearchArea { get; set; } = string.Empty;

    public string Difficulty { get; set; } = string.Empty;

    public string Duration { get; set; } = string.Empty;

    public string Keywords { get; set; } = string.Empty;
}
