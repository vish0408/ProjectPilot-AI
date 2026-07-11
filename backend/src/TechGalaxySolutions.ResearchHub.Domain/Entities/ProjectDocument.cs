namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ProjectDocument : BaseEntity
{
    public Guid ProjectId { get; set; }

    public Project Project { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public Guid UploaderId { get; set; }

    public User Uploader { get; set; } = null!;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
