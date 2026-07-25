# Guide Dashboard Final Debug Report

## Exact Exception

```
Exception Type:    Microsoft.Data.SqlClient.SqlException
Message:           Invalid column name 'StoredFilePath'.
Inner Exception:   None
Source:            Core Microsoft SqlClient Data Provider
Error Number:      207
State:             1
Class:             16
```

## Root Cause

**Unapplied EF Core migration `20260719063247_AddStoredFilePath`.**

The `StoredFilePath` property was added to the `ProjectDocument` entity in a previous coding session, and the migration scaffolding (`dotnet ef migrations add AddStoredFilePath`) was run to generate the migration .cs file. However, the migration was **never applied to the SQL Server database** via `dotnet ef database update`.

When the dashboard endpoint `GET /dashboard/guide` executes `GuideDashboardService.GetDashboardAsync()` at line 59, it queries `ProjectDocuments` table with a SELECT that includes `[p1].[StoredFilePath]`. Since the column doesn't exist in the actual SQL Server table, the database throws:

```
Invalid column name 'StoredFilePath'.
```

This `SqlException` propagates through the middleware, is caught by `ExceptionMiddleware` (line 96-102 in `ExceptionMiddleware.cs`), and returned as HTTP 500:

```json
{"error":{"title":"Internal Server Error","detail":"An unexpected error occurred...","status":500}}
```

The frontend `GuideDashboard.tsx` catches this error (line 39), sets `data = null`, and displays:
> **Failed to load dashboard data.**

## Trace

| Step | Detail |
|------|--------|
| HTTP Request | `GET /dashboard/guide` with Bearer token (Guide role) |
| Controller | `GuideDashboardController.GetDashboard()` (line 20) |
| Service | `GuideDashboardService.GetDashboardAsync(userId)` (line 24) |
| **Failing Query** | 6th query: `_context.ProjectDocuments.AsNoTracking()...ToListAsync()` (line 59) |
| **Generated SQL** | `SELECT [p1].[Id], [p1].[ContentData], [p1].[StoredFilePath], ... FROM [ProjectDocuments] AS [p1]` |
| **Exception** | Line 122-135 in api_stdout.txt: `SqlException: Invalid column name 'StoredFilePath'` |
| **Middleware** | `ExceptionMiddleware.InvokeAsync()` returns 500 |

## Fix Applied

```
> dotnet ef database update --project ...\Infrastructure --startup-project ...\Api
Applying migration '20260719063247_AddStoredFilePath'.
ALTER TABLE [ProjectDocuments] ADD [StoredFilePath] nvarchar(max) NULL;
Done.
```

## Verification

| Test | Result |
|------|--------|
| `GET /health` | `{"status":"Healthy","database":"Connected"}` |
| `GET /dashboard/guide` | HTTP 200 — valid JSON with all sections |
| `totalAssignedStudents` | `1` (Priya Sharma) |
| `projectsUnderReview` | `0` |
| `pendingReviews` | `0` |
| `upcomingMeetings` | `0` |
| `assignedStudents` | 1 student with full profile, project, progress |
| `pendingReviewList` | `[]` (empty — no pending project reviews) |
| `pendingThesisReviews` | 3 documents with review statuses (null, RevisionRequested, Rejected) |
| `GET /guide/thesis-reviews` | HTTP 200 — 3 documents with versioning |
| `GET /reviews/my` | `{"items":[],...}` — PagedResponse format |
| `GET /meetings` | 2 meetings returned |
| `GET /guide/profile` | HTTP 200 — full profile |
| `GET /notifications` | `{"items":[]}` |

## Files Modified During Investigation

| File | Change |
|------|--------|
| `Infrastructure/Services/GuideDashboardService.cs:128` | `r.Project.Student.FullName` → `r.Project.Student?.FullName ?? "Unknown"` |
| `Infrastructure/Persistence/Migrations/20260719063247_AddStoredFilePath.cs` | Created but unapplied |
| SQL Server `ProjectDocuments` table | `ADD StoredFilePath nvarchar(max) NULL` (applied via `database update`) |

## Conclusion

A single SQL schema mismatch (missing column `StoredFilePath`) was the sole cause of the dashboard 500 error. All other data loading issues (thesis reviews showing "0 documents", pending approvals empty) were **secondary symptoms** caused by the frontend PagedResponse type mismatch (fixed in the previous session) or by the dashboard failure itself (since AssignedStudents, ResearchProgress, Reports all reuse the dashboard endpoint).

The dashboard now returns HTTP 200 with valid JSON containing real SQL Server data for all sections.
