namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IVectorStore
{
    Task StoreEmbeddingAsync(string documentId, string chunkId, float[] embedding);

    Task<List<VectorSearchResult>> SearchAsync(float[] queryEmbedding, int topK = 5);

    Task DeleteDocumentEmbeddingsAsync(string documentId);
}

public class VectorSearchResult
{
    public string DocumentId { get; set; } = string.Empty;
    public string ChunkId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public float Score { get; set; }
}
