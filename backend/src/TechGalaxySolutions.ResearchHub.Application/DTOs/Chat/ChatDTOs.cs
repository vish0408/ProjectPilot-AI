namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Chat;

public class CreateSessionRequest
{
    public string Title { get; set; } = string.Empty;
    public string? ProjectId { get; set; }
    public string? ResearchArea { get; set; }
}

public class SendMessageRequest
{
    public Guid SessionId { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ChatSessionResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ResearchArea { get; set; }
    public int MessageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActivityAt { get; set; }
}

public class ChatSessionDetailResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ResearchArea { get; set; }
    public string? ContextSummary { get; set; }
    public int MessageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActivityAt { get; set; }
    public List<ChatMessageResponse> Messages { get; set; } = new();
    public List<DocumentReferenceResponse> DocumentReferences { get; set; } = new();
}

public class ChatMessageResponse
{
    public Guid Id { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Confidence { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<CitationResponse> Citations { get; set; } = new();
}

public class CitationResponse
{
    public Guid Id { get; set; }
    public string SourceTitle { get; set; } = string.Empty;
    public string? Authors { get; set; }
    public int? Year { get; set; }
    public string? SourceType { get; set; }
    public string? SectionName { get; set; }
    public string? Excerpt { get; set; }
    public double? RelevanceScore { get; set; }
}

public class DocumentReferenceResponse
{
    public Guid Id { get; set; }
    public string SourceType { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Authors { get; set; }
    public int? Year { get; set; }
    public string? Summary { get; set; }
}

public class ChatStreamChunk
{
    public string Content { get; set; } = string.Empty;
    public bool IsComplete { get; set; }
    public string? Error { get; set; }
    public Guid? MessageId { get; set; }
    public string? Confidence { get; set; }
}
