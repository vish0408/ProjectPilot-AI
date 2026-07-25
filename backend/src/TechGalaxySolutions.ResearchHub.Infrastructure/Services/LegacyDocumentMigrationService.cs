using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class LegacyDocumentMigrationService : ILegacyDocumentMigrationService
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<LegacyDocumentMigrationService> _logger;

    public LegacyDocumentMigrationService(
        ApplicationDbContext context,
        IFileStorageService fileStorage,
        ILogger<LegacyDocumentMigrationService> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task<LegacyMigrationReport> RunMigrationAsync()
    {
        var report = new LegacyMigrationReport
        {
            RunAt = DateTime.UtcNow,
        };

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        var documents = await _context.ProjectDocuments
            .Where(d => !d.IsDeleted)
            .OrderBy(d => d.UploadedAt)
            .ToListAsync();

        report.TotalDocuments = documents.Count;

        foreach (var document in documents)
        {
            var entry = new LegacyMigrationEntry
            {
                DocumentId = document.Id,
                FileName = document.FileName,
                ProjectId = document.ProjectId,
            };

            try
            {
                var result = await MigrateSingleDocumentAsync(document);
                entry.Status = result;
                entry.NewStoredFilePath = document.StoredFilePath;

                switch (result)
                {
                    case "Migrated":
                        report.MigratedDocuments++;
                        break;
                    case "Skipped":
                        report.SkippedDocuments++;
                        break;
                    case "Missing":
                        report.MissingDocuments++;
                        break;
                    case "Failed":
                        report.FailedDocuments++;
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate document {DocumentId}", document.Id);
                entry.Status = "Failed";
                entry.ErrorMessage = ex.Message;
                report.FailedDocuments++;
            }

            report.Details.Add(entry);
        }

        await _context.SaveChangesAsync();

        stopwatch.Stop();
        report.Duration = stopwatch.Elapsed;

        _logger.LogInformation(
            "Legacy document migration completed: {Total} total, {Migrated} migrated, {Skipped} skipped, {Missing} missing, {Failed} failed in {Duration}",
            report.TotalDocuments, report.MigratedDocuments, report.SkippedDocuments,
            report.MissingDocuments, report.FailedDocuments, report.Duration);

        return report;
    }

    private async Task<string> MigrateSingleDocumentAsync(ProjectDocument document)
    {
        if (!string.IsNullOrEmpty(document.StoredFilePath))
        {
            var fileBytes = await _fileStorage.ReadFileAsync(document.StoredFilePath);
            if (fileBytes != null)
            {
                document.DocumentStatus = null;
                return "Skipped";
            }

            document.DocumentStatus = "MissingFile";
            return "Missing";
        }

        if (document.ContentData is { Length: > 0 })
        {
            var bytes = document.ContentData;
            var storedPath = await _fileStorage.SaveFileAsync(bytes, document.FileName, "thesis");

            document.StoredFilePath = storedPath;
            document.DocumentStatus = "Migrated";
            document.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation(
                "Migrated document {DocumentId} ({FileName}): saved to {Path}",
                document.Id, document.FileName, storedPath);

            return "Migrated";
        }

        document.DocumentStatus = "MissingFile";
        document.UpdatedAt = DateTime.UtcNow;

        _logger.LogWarning(
            "Document {DocumentId} ({FileName}) has no ContentData and no StoredFilePath — marked as MissingFile",
            document.Id, document.FileName);

        return "Missing";
    }
}
