

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodProposal;

public class HodProposalResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Abstract { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string? GuideName { get; set; }
    public Guid? GuideId { get; set; }
    public string Department { get; set; } = string.Empty;
    public int Version { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByName { get; set; }
    public List<ProposalCommentItem> Comments { get; set; } = new();
}

public class ProposalCommentItem
{
    public Guid Id { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
