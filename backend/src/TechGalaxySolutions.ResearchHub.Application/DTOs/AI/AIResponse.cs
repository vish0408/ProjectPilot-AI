namespace TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

public class AIResponse
{
    public string Content { get; set; } = string.Empty;

    public string? Model { get; set; }

    public AIUsage? Usage { get; set; }

    public string? FinishReason { get; set; }
}
