namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public class LegacyMigrationEntry
{
    public Guid DocumentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public string? NewStoredFilePath { get; set; }
}

public class LegacyMigrationReport
{
    public int TotalDocuments { get; set; }
    public int MigratedDocuments { get; set; }
    public int MissingDocuments { get; set; }
    public int FailedDocuments { get; set; }
    public int SkippedDocuments { get; set; }
    public List<LegacyMigrationEntry> Details { get; set; } = new();
    public DateTime RunAt { get; set; }
    public TimeSpan Duration { get; set; }
}

public interface ILegacyDocumentMigrationService
{
    Task<LegacyMigrationReport> RunMigrationAsync();
}
