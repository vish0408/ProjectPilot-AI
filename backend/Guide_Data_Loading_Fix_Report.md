# Guide Portal Data Loading Fix Report

## Root Causes

### 1. Null Reference Exception in `GuideDashboardService.GetDashboardAsync()`
**File:** `backend/src/.../Infrastructure/Services/GuideDashboardService.cs:128`

The dashboard endpoint `/dashboard/guide` crashed with a `NullReferenceException` when a `Review` record existed whose associated `Student` was null (orphaned record or deleted user). The expression `r.Project.Student.FullName` assumed `Student` was always non-null. This caused the entire dashboard to fail with a 500 error, and the frontend showed "Failed to load dashboard data."

Additionally, any page that reuses the dashboard endpoint (`GuideAssignedStudents`, `GuideResearchProgress`, `GuideReports`) also showed error/empty states because the shared data source (`GuideDashboardData`) never loaded.

**Fix:** Changed to `r.Project.Student?.FullName ?? "Unknown"` (null-conditional access with fallback).

### 2. `PagedResponse` Type Mismatch on `/reviews/my` Endpoint
**File:** `frontend/.../src/services/GuideService.ts:37`

The backend `GET /reviews/my` returns `PagedResponse<ReviewResponse>` (an object with `items`, `pageNumber`, `pageSize`, `totalCount`). But the frontend expected a plain `Review[]` array. The response JSON `{ items: [...], pageNumber: 1, ... }` was assigned to `reviews` state, and calling `.filter(r => r.status === "pending")` threw a runtime error (`TypeError: reviews.filter is not a function`) caught in try-catch. The page then showed "No pending reviews" and stat cards showed "0".

All reviews on the Pending Approvals page were invisible despite data existing in the database.

**Fix:** Changed frontend to type-cast as `PagedResponse<Review>` and extract `.items`.

### 3. Hardcoded Sidebar Badges Misleading Users
**File:** `frontend/.../src/utils/navigation.ts`

The sidebar badges were hardcoded strings (`badge: "12"` for assigned students, `badge: "5"` for thesis reviews). These static numbers never matched actual SQL Server data. When a user saw "5 Thesis Reviews" in the sidebar but "0 documents submitted" on the page, they reasonably believed the system was broken.

**Fix:** Removed all hardcoded badge values — set to `null`. Badges will be added back only when a dynamic count API is integrated.

### 4. Wrong URLs for Document Comment Update/Delete Endpoints
**File:** `frontend/.../src/services/GuideService.ts:167-175`

`updateDocumentComment(commentId)` used URL `/documents/${commentId}/comments` (treating commentId as documentId). `deleteDocumentComment(commentId)` had the same issue. The backend routes are:
- `PUT /documents/{documentId}/comments/{commentId}`
- `DELETE /documents/{documentId}/comments/{commentId}`

These methods would always hit the wrong endpoint. Since no frontend page currently calls these methods (the thesis review page only lists/adds comments, never edits/deletes), this was not user-facing yet, but it was a correctness issue.

**Fix:** Added `documentId` parameter to both methods and corrected the URL template.

---

## Files Modified

| # | File | Change |
|---|------|--------|
| 1 | `backend/.../GuideDashboardService.cs` | Fixed null reference: `r.Project.Student?.FullName ?? "Unknown"` |
| 2 | `frontend/.../GuideService.ts` | Added `AppNotification` import |
| 3 | `frontend/.../GuideService.ts` | `getMyReviews()` returns `PagedResponse<Review>.items` |
| 4 | `frontend/.../GuideService.ts` | `getProjectReviews()` returns `PagedResponse<Review>.items` |
| 5 | `frontend/.../GuideService.ts` | `updateDocumentComment(documentId, commentId, content)` — fixed URL |
| 6 | `frontend/.../GuideService.ts` | `deleteDocumentComment(documentId, commentId)` — fixed URL |
| 7 | `frontend/.../navigation.ts` | Removed all hardcoded sidebar badges (GUIDE, STUDENT, ADMIN navs) |

---

## Guide Portal API Endpoint Verification

| Endpoint | Status | Issue Found | Fixed |
|----------|--------|-------------|-------|
| `GET /dashboard/guide` | ✅ | NullReferenceException on `Student.FullName` | Yes |
| `GET /guide/profile` | ✅ | None | — |
| `PUT /guide/profile` | ✅ | None | — |
| `GET /reviews/my` | ✅ | PagedResponse type mismatch on frontend | Yes |
| `POST /reviews/project/{projectId}` | ✅ | None | — |
| `GET /guide/thesis-reviews` | ✅ | None | — |
| `POST /guide/thesis-reviews/{docId}/review` | ✅ | None | — |
| `GET /guide/thesis-reviews/project/{projectId}/versions/{docId}` | ✅ | None | — |
| `GET /documents/{docId}/comments` | ✅ | None | — |
| `POST /documents/{docId}/comments` | ✅ | None | — |
| `PUT /documents/{docId}/comments/{commentId}` | ✅ | Frontend URL was wrong | Yes |
| `DELETE /documents/{docId}/comments/{commentId}` | ✅ | Frontend URL was wrong | Yes |
| `GET /meetings` | ✅ | None | — |
| `POST /meetings` | ✅ | None | — |
| `GET /notifications` | ✅ | None | — |
| `GET /notifications/unread-count` | ✅ | None | — |
| `PUT /notifications/mark-read` | ✅ | None | — |
| `PUT /notifications/mark-all-read` | ✅ | None | — |

---

## Verification

- **Backend build:** 0 errors, 0 warnings
- **Frontend build:** 0 errors, builds in ~4s
- **Dashboard:** Fixed null reference — now returns all zero counts gracefully when tables are empty
- **Pending Approvals:** Now correctly parses `PagedResponse.items` — reviews display when data exists
- **Sidebar:** No longer shows hardcoded numbers that contradict real data
- **Document Comments:** Update/delete endpoints now use correct URL patterns

## Data Flow (After Fix)

```
1. Guide logs in → JWT contains "Guide" role claim
2. GuidePortal loads:
   ├── Dashboard → GET /dashboard/guide ✅
   │   └── GuideAssignedStudents, GuideResearchProgress, GuideReports all reuse ✅
   ├── Thesis Reviews → GET /guide/thesis-reviews ✅
   ├── Pending Approvals → GET /reviews/my → PagedResponse → .items ✅
   ├── Meetings → GET /meetings ✅
   └── Notifications → GET /notifications ✅
3. All data comes from SQL Server — no mock data
```

## Remaining Observations (Non-Critical)

1. **N+1 query in `ThesisReviewService.GetPendingReviewsAsync()`** — inside the foreach over documents, an individual `CountAsync()` executes per document. For documents < 50 this is fine; for large portfolios, consider a grouped query.
2. **Dashboard endpoint uses 6 separate SQL queries** — could be optimized with raw SQL or a view, but acceptable for <1000 students.
3. **ReviewsController has no role restriction** — `[Authorize]` without `Roles = "Guide"` means any authenticated user can call review endpoints. The service internally uses the user ID as guide ID.
4. **Assigned students page has no dedicated endpoint** — reuses dashboard data. Add `GET /guide/students` if pagination/search becomes needed.
