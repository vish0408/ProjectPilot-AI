namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IDocumentRetriever
{
    Task<List<RetrievedDocument>> RetrieveRelevantChunksAsync(string question, Guid userId, int topK = 5);

    Task<List<RetrievedDocument>> RetrieveByKeywordsAsync(string query, Guid userId, int topK = 5);
}

public class RetrievedDocument
{
    public string DocumentId { get; set; } = string.Empty;
    public string DocumentTitle { get; set; } = string.Empty;
    public string ChunkContent { get; set; } = string.Empty;
    public string? SectionName { get; set; }
    public double RelevanceScore { get; set; }
    public string SourceType { get; set; } = string.Empty;
}
