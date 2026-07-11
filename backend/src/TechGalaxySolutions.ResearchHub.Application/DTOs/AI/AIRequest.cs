namespace TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

public class AIRequest
{
    public List<AIMessage> Messages { get; set; } = new();

    public AIOptions? Options { get; set; }

    public string? SystemPrompt { get; set; }
}
