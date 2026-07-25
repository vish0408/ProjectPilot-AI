namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Document;

public class DocumentResponse
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public Guid UploaderId { get; set; }
    public string UploaderName { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public string? Status { get; set; }
    public string? ReviewComment { get; set; }
    public int? ReviewScore { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class CreateDocumentRequest
{
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? ContentData { get; set; }
}

public class DocumentDownloadResponse
{
    public byte[] ContentData { get; set; } = Array.Empty<byte>();
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
}
