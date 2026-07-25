namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IEmbeddingProvider
{
    Task<float[]> GenerateEmbeddingAsync(string text);

    Task<List<float[]>> GenerateEmbeddingsAsync(List<string> texts);
}
