namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodProposal;

public class ReviewProposalRequest
{
    public string Action { get; set; } = string.Empty; // "Approve", "Reject", "RequestRevision"
    public string? Remarks { get; set; }
}
