namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class DocumentChunk : BaseEntity
{
    public Guid UploadedDocumentId { get; set; }

    public UploadedDocument UploadedDocument { get; set; } = null!;

    public int ChunkIndex { get; set; }

    public string Content { get; set; } = string.Empty;

    public string? SectionName { get; set; }

    public int TokenCount { get; set; }
}
