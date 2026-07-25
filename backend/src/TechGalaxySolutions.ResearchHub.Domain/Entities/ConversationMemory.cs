namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ConversationMemory : BaseEntity
{
    public Guid ChatSessionId { get; set; }
    public string MemoryKey { get; set; } = string.Empty;
    public string MemoryValue { get; set; } = string.Empty;
    public int Priority { get; set; }
    public DateTime LastAccessedAt { get; set; }

    public ChatSession ChatSession { get; set; } = null!;
}
