namespace TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

public class AIStreamChunk
{
    public string Content { get; set; } = string.Empty;

    public string? FinishReason { get; set; }

    public bool IsComplete => !string.IsNullOrEmpty(FinishReason);
}
