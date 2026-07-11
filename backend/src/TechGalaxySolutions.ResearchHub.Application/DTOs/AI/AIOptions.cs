namespace TechGalaxySolutions.ResearchHub.Application.DTOs.AI;

public class AIOptions
{
    public string Model { get; set; } = string.Empty;

    public double Temperature { get; set; } = 0.7;

    public int MaxTokens { get; set; } = 2048;

    public double? TopP { get; set; }

    public double? FrequencyPenalty { get; set; }

    public double? PresencePenalty { get; set; }

    public Dictionary<string, string>? AdditionalParameters { get; set; }
}
