namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class DocumentReference : BaseEntity
{
    public Guid ChatSessionId { get; set; }
    public string SourceType { get; set; } = string.Empty;
    public Guid? LiteratureReviewId { get; set; }
    public Guid? UploadedDocumentId { get; set; }
    public Guid? ProposalId { get; set; }
    public string? Title { get; set; }
    public string? Authors { get; set; }
    public int? Year { get; set; }
    public string? Summary { get; set; }

    public ChatSession ChatSession { get; set; } = null!;
}
