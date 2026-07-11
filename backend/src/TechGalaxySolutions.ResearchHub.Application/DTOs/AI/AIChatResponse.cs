namespace TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

public class AIChatResponse
{
    public string Content { get; set; } = string.Empty;

    public string? Model { get; set; }

    public AIUsage? Usage { get; set; }

    public string? FinishReason { get; set; }

    public long ResponseTimeMs { get; set; }

    public string Provider { get; set; } = string.Empty;
}
