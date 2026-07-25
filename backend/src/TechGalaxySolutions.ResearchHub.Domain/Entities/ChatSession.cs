namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ChatSession : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string? ProjectId { get; set; }
    public string? ResearchArea { get; set; }
    public string? ContextSummary { get; set; }
    public int MessageCount { get; set; }
    public DateTime LastActivityAt { get; set; }

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    public ICollection<DocumentReference> DocumentReferences { get; set; } = new List<DocumentReference>();
}
