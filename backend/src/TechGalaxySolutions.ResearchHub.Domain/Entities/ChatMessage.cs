namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ChatMessage : BaseEntity
{
    public Guid ChatSessionId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Confidence { get; set; }
    public int? PromptTokens { get; set; }
    public int? CompletionTokens { get; set; }
    public string? ProviderUsed { get; set; }
    public int OrderIndex { get; set; }

    public ChatSession ChatSession { get; set; } = null!;
    public ICollection<Citation> Citations { get; set; } = new List<Citation>();
}
