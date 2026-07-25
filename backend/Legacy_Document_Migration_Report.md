# Legacy Document Migration Report

## Overview

**Date:** 2026-07-19  
**Migration Tool:** `LegacyDocumentMigrationService`  
**Trigger:** `POST /admin/legacy-documents/migrate` (Admin-only, idempotent)

This migration transitions `ProjectDocument` entries from the old dual storage model (inline `ContentData` + optional `StoredFilePath`) to the new file-system-only model. It is safe to re-run at any time; already-migrated documents are detected and skipped.

---

## Decision Matrix

For each non-deleted `ProjectDocument`:

| Condition | Action Taken |
|---|---|
| `StoredFilePath` is set *and* file exists on disk | **Skipped** — no change; `DocumentStatus` set to `null` |
| `StoredFilePath` is set *but* file is missing from disk | **Missing** — `DocumentStatus` set to `"MissingFile"` |
| `StoredFilePath` is null *and* `ContentData` has bytes | **Migrated** — bytes saved to disk via `IFileStorageService`, `StoredFilePath` updated, `DocumentStatus` set to `"Migrated"` |
| Both `StoredFilePath` and `ContentData` are null/empty | **Missing** — `DocumentStatus` set to `"MissingFile"` |

---

## Database Changes

### New Column

| Table | Column | Type | Description |
|---|---|---|---|
| `ProjectDocuments` | `DocumentStatus` | `nvarchar(max)`, nullable | Set to `"MissingFile"` or `"Migrated"` by the migration service. Null for healthy, already-migrated documents. |

### Migration

- **Migration file:** `20260719081352_AddDocumentStatusColumn`
- Applied to the target database on 2026-07-19.

---

## API Endpoint

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/legacy-documents/migrate` | Admin | Runs the migration and returns a `LegacyMigrationReport` JSON payload. |

### Response Shape

```json
{
  "totalDocuments": 2,
  "migratedDocuments": 0,
  "missingDocuments": 0,
  "failedDocuments": 0,
  "skippedDocuments": 2,
  "details": [
    {
      "documentId": "guid",
      "fileName": "document.docx",
      "projectId": "guid",
      "status": "Skipped | Migrated | Missing | Failed",
      "errorMessage": null,
      "newStoredFilePath": "thesis/file_abc123.docx"
    }
  ],
  "runAt": "2026-07-19T08:17:49Z",
  "duration": "00:00:00.3528420"
}
```

---

## Verification

### Test Results

- **Build:** 0 errors, 0 warnings (backend + infrastructure)
- **Migration:** Applied successfully to SQL Server
- **Migration run:** `POST /admin/legacy-documents/migrate` returned HTTP 200 with 2 documents processed
- **Idempotency:** Second run produced identical results (all "Skipped")
- **Download behaviour:** Documents with `DocumentStatus = "MissingFile"` now return:
  > `404 Not Found: "The original file is no longer available."`
  
  Instead of the previous generic `"File content not found"`.

### Manual Test Steps

1. Verify a newly uploaded document opens and downloads → should work (existing flow unchanged)
2. Run `POST /admin/legacy-documents/migrate` as Admin → verify report counts
3. Attempt to download a document tagged `MissingFile` → should receive friendly 404 message
4. Re-run migration → confirm all documents come back as "Skipped" (idempotent)

---

## Files Changed

| File | Change |
|---|---|
| `Domain/Entities/ProjectDocument.cs` | Added `string? DocumentStatus` property |
| `Infrastructure/Migrations/20260719081352_AddDocumentStatusColumn.cs` | Migration: ADD COLUMN `DocumentStatus` |
| `Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs` | Updated snapshot to include `DocumentStatus` |
| `Application/Interfaces/ILegacyDocumentMigrationService.cs` | New interface + DTOs (`LegacyMigrationReport`, `LegacyMigrationEntry`) |
| `Infrastructure/Services/LegacyDocumentMigrationService.cs` | New migration implementation (idempotent, per-document logic) |
| `Infrastructure/DependencyInjection.cs` | Registered `ILegacyDocumentMigrationService` |
| `Api/Controllers/AdminLegacyDocumentsController.cs` | New admin controller with `POST /migrate` endpoint |
| `Api/Controllers/DocumentsController.cs` | Updated download/preview endpoints to catch `InvalidOperationException` with friendly message |
| `Infrastructure/Services/DocumentService.cs` | `DownloadFileAsync` now throws `InvalidOperationException` when `DocumentStatus == "MissingFile"` |
