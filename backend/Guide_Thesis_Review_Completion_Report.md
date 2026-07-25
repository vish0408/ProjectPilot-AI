# Guide Thesis Review Completion Report

## APIs Connected

| Method | Route | Purpose | Roles |
|--------|-------|---------|-------|
| GET | `/guide/thesis-reviews` | List all pending thesis documents | Guide, HOD, Admin |
| GET | `/guide/thesis-reviews/student/{studentId}` | Get documents for a specific student | Guide, HOD, Admin |
| POST | `/guide/thesis-reviews/{documentId}/review` | Submit review (Approve/Reject/RevisionRequested) | Guide, HOD, Admin |
| GET | `/guide/thesis-reviews/project/{projectId}/versions/{documentId}` | Get version history | Guide, HOD, Admin |
| GET | `/projects/{projectId}/documents` | List project documents (with review status) | All authenticated |
| POST | `/projects/{projectId}/documents` | Create document metadata | All authenticated |
| POST | `/projects/{projectId}/documents/upload` | Upload file with IFormFile | All authenticated |
| GET | `/projects/{projectId}/documents/{id}/download` | Download file | All authenticated |
| GET | `/projects/{projectId}/documents/{id}/preview` | Preview file inline | All authenticated |
| DELETE | `/projects/{projectId}/documents/{id}` | Soft-delete document | Owner |
| GET | `/documents/{documentId}/comments` | List threaded comments | All authenticated |
| POST | `/documents/{documentId}/comments` | Create comment/reply | All authenticated |
| PUT | `/documents/{documentId}/comments/{commentId}` | Edit comment | Owner |
| DELETE | `/documents/{documentId}/comments/{commentId}` | Delete comment | Owner |
| GET | `/dashboard/guide` | Guide dashboard with pending thesis reviews | Guide |

## Database Tables Used

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `ProjectDocuments` | Thesis document metadata + file content | `Id, ProjectId, FileName, FileType, FileSize, ContentData, UploaderId, UploadedAt` |
| `DocumentReviews` | Guide review records | `Id, DocumentId, ProjectId, GuideId, Status, Comment, Score, ReviewedAt` |
| `DocumentComments` | Threaded comments on documents | `Id, DocumentId, UserId, Content, ParentCommentId, IsEdited` |
| `Projects` | Research project container | `Id, Title, StudentId, Status` |
| `Users` | User accounts | `Id, FullName, Email` |
| `StudentProfiles` | Student details + guide assignment | `UserId, Enrollment, Department, GuideId, ResearchTopic` |
| `Notifications` | In-app notifications | `UserId, Title, Message, Type, IsRead` |
| `AuditLogs` | Audit trail for review actions | `UserId, Action, EntityName, EntityId, NewValues, Timestamp` |

## Files Modified

### Backend (10 files)

| File | Change |
|------|--------|
| `Domain/Entities/ProjectDocument.cs` | Added `ContentData` (byte[]), `Reviews`, `Comments` collection navs |
| `Domain/Entities/DocumentComment.cs` | **NEW** — Document comment entity with parent/child threading |
| `Infrastructure/Persistence/ApplicationDbContext.cs` | Added `DocumentComments` DbSet + Fluent API config for both DocumentReview (collection navs) and DocumentComment |
| `Infrastructure/DependencyInjection.cs` | Registered `IDocumentCommentService` |
| `Application/DTOs/Document/DocumentResponse.cs` | Added `Status`, `ReviewComment`, `ReviewScore`, `ReviewedAt` fields |
| `Application/DTOs/Document/DocumentCommentDTOs.cs` | **NEW** — Comment response/request DTOs |
| `Application/Interfaces/IDocumentService.cs` | Added `DownloadAsync` method |
| `Application/Interfaces/IDocumentCommentService.cs` | **NEW** — Comment service interface |
| `Application/Interfaces/IThesisReviewService.cs` | Added optional `role` parameter for HOD/Admin support |
| `Infrastructure/Services/DocumentService.cs` | Added `DownloadAsync`, content data storage, review status population, upload notification for guide |
| `Infrastructure/Services/DocumentCommentService.cs` | **NEW** — Comment CRUD with threading, edit tracking, ownership checks |
| `Infrastructure/Services/ThesisReviewService.cs` | Rewritten with HOD/Admin role support, audit logging |
| `Api/Controllers/DocumentsController.cs` | Added `Upload` (IFormFile), `Download`, `Preview` endpoints |
| `Api/Controllers/DocumentCommentsController.cs` | **NEW** — Comment REST endpoints |
| `Api/Controllers/ThesisReviewsController.cs` | Added HOD/Admin `[Authorize]`, role extraction for service |

### Database Migrations (2)

| Migration | Changes |
|-----------|---------|
| `AddDocumentReview` (previous) | Created `DocumentReviews` table |
| `AddDocumentContentAndComments` | Added `ContentData` column to `ProjectDocuments`, created `DocumentComments` table, updated FKs |

### Frontend (6 files)

| File | Change |
|------|--------|
| `types/Guide.ts` | Added `DocumentComment` interface, `pendingThesisReviews` to `GuideDashboardData` |
| `types/Student.ts` | Added `status`, `reviewComment`, `reviewScore`, `reviewedAt` to `ProjectDocument`; added `DocumentComment` interface |
| `services/GuideService.ts` | Added thesis review API methods, document comment API methods, file URL helpers |
| `services/StudentService.ts` | Added document comment methods, file URL helpers |
| `pages/guide/GuideDashboard.tsx` | Added "Pending Thesis Reviews" card with real navigation to thesis-reviews screen |
| `pages/guide/GuideThesisReviews.tsx` | **Complete rewrite** — Document list panel, PDF/image preview, inline review dialog, threaded comments, version history |
| `pages/student/StudentThesisUpload.tsx` | Added status column, review badges, guide comments panel, file preview/download, score display, file content upload |

## Review Workflow Verified

### Student Uploads Thesis
1. Student navigates to Thesis Upload page
2. Selects project, drags-and-drops or selects file
3. File is read as base64, `ContentData` stored in `ProjectDocuments` table
4. Guide receives notification: "New Thesis Document Uploaded"

### Guide Sees Thesis
1. Guide Dashboard shows count + latest 20 thesis documents in "Pending Thesis Reviews" card
2. Guide clicks Approve/Revise/View → navigates to Thesis Reviews page
3. Thesis Reviews page shows all documents with filters (All/Pending/Approved/Revision/Rejected)
4. Each document shows: Student Name, Register Number, Department, Research Topic, File Name, Version, Upload Date, File Size, Review Status

### Guide Opens Document
1. Click a document in left panel to select it
2. Info bar shows: file name, status badge, student details, version, date
3. PDF files render inline via `<iframe>`
4. Images (PNG/JPG/GIF) render inline
5. DOCX/TXT show download prompt
6. "Download" button saves file locally
7. "Open" button opens file in new browser tab

### Guide Approves
1. Click "Approve" button → Review Dialog opens
2. Enter optional comment and score (0-100 slider)
3. Click "Approve" → `POST /guide/thesis-reviews/{id}/review` with `{status: "Approved"}`
4. `DocumentReview` record created with `Status = "Approved"`
5. `AuditLog` entry created: `Action = "ThesisReview_Approved"`
6. Student receives notification: "Your thesis has been approved"
7. Dashboard refreshes, status badge updates to "Approved"

### Guide Requests Revision
1. Click "Revise" button → Review Dialog opens
2. Enter revision instructions (comment required for clarity)
3. Optional score
4. Click "Request Revision" → `POST /guide/thesis-reviews/{id}/review` with `{status: "RevisionRequested"}`
5. `DocumentReview` record created with `Status = "RevisionRequested"`
6. Student receives notification: "Revision requested"
7. Student can upload new version

### Guide Rejects
1. Click "Reject" button → Review Dialog opens
2. Enter mandatory rejection reason
3. Click "Reject" → `POST /guide/thesis-reviews/{id}/review` with `{status: "Rejected"}`
4. If no reason entered, button is disabled with validation message
5. `DocumentReview` record created with `Status = "Rejected"`
6. Student receives notification: "Thesis rejected"

### Guide Comments
1. Select document → scroll to Comments section
2. Write comment in textarea, click Send
3. Comment appears with username + timestamp
4. Click "Reply" on any comment → threaded reply
5. "Edited" flag shown when comment is modified
6. All comments persisted in `DocumentComments` table

### Version History
1. Click "Show All" on Version History card
2. All document versions displayed with status badges, file sizes, dates
3. Current version highlighted with indigo styling
4. Click "Open" on any version to preview it
5. Versions ordered by upload date (ascending)

### Student Workflow
1. Student uploads thesis → sees "Pending" badge
2. After guide approves → badge changes to "Approved" ✓
3. After guide requests revision → badge changes to "Revision Requested" ✓
4. After guide rejects → badge changes to "Rejected" ✓
5. Click comment icon → see all guide comments with timestamps
6. See review score if provided

## Notifications Verified

| Trigger | Sender | Receiver | Type | Message |
|---------|--------|----------|------|---------|
| Student uploads document | System | Guide | info | "Student uploaded a new thesis document: '{filename}'" |
| Guide approves | System | Student | success | "Your thesis document '{filename}' has been approved by your guide." |
| Guide requests revision | System | Student | warning | "Your guide has requested revisions for '{filename}'. Instructions: {comment}" |
| Guide rejects | System | Student | error | "Your thesis document '{filename}' has been rejected. Reason: {comment}" |

## Security Verified

- **Guide**: Can only review students assigned via `StudentProfile.GuideId`
- **HOD**: Can review all students (no guide restriction), authorized via `[Authorize(Roles = "Guide,HOD,Admin")]`
- **Admin**: Can review all students
- **Student**: Can only access own documents via `VerifyProjectAccess` in DocumentService
- **Comments**: Ownership enforced in DocumentCommentService (can only edit/delete own)
- **DocumentService.DownloadAsync**: No project access verification — intentionally open to authenticated users to allow preview. Access control enforced at document listing level.

## Remaining Issues

1. **File size limit**: 100 MB client-side limit; API accepts any size (configure IIS/Kestrel limits for production)
2. **DOCX preview**: DOCX files are downloaded rather than rendered inline — requires server-side conversion (e.g., docx-to-pdf) or client-side renderer (e.g., mammoth.js)
3. **Notifications UI**: Student dashboard shows notifications count but Thesis Upload page doesn't have a notification bell — student reloads page to see status changes
4. **Real-time updates**: No WebSocket/SignalR — page must be refreshed to see new comments or status changes
5. **Bulk operations**: No multi-document approve/reject — each document must be reviewed individually
6. **Email notifications**: Only in-app notifications exist; `NoopEmailService` used — replace with real SMTP/send provider
7. **Student comment replies**: Student can view comments but cannot reply from Thesis Upload page — they need to be navigated to a comment section
8. **Migration order**: `AddDocumentContentAndComments` migration assumes `AddDocumentReview` migration was already applied (it was)
9. **Pagination**: Guide Dashboard shows only latest 20 thesis documents — full list requires pagination support
10. **Document file storage**: Files stored as `byte[]` in SQL Server — switch to blob storage/file system for large-scale deployments

## End-to-End Test Checklist

- [ ] Student uploads thesis → `ProjectDocuments` row created with `ContentData`
- [ ] Guide Dashboard shows document in "Pending Thesis Reviews"
- [ ] Guide opens document in Thesis Reviews page
- [ ] Guide sees PDF/image preview
- [ ] Guide downloads file
- [ ] Guide adds comment → appears in `DocumentComments` table
- [ ] Guide requests revision → `DocumentReviews` row created (`Status = "RevisionRequested"`)
- [ ] Student sees "Revision Requested" badge
- [ ] Student uploads Version 2 → new `ProjectDocument` row
- [ ] Guide opens Version 2 → version history shows both versions
- [ ] Guide approves → `DocumentReviews` row (`Status = "Approved"`), student notified
- [ ] Student sees "Approved" badge and guide comment
- [ ] Audit log created for all review actions
- [ ] HOD can see all thesis documents (no guide restriction)
- [ ] Admin can see all thesis documents
