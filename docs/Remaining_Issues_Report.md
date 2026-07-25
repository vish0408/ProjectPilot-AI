# Remaining Issues Report

## Summary

| Area | Status | Notes |
|------|--------|-------|
| **Notifications** | ✅ Done | Create + Delete backend/frontend, error states |
| **Audit Logs** | ✅ Done | Service + action filter + auth controller logging |
| **Backup/Restore** | ✅ Done | Entity, service, controller, frontend, migration |
| **Empty Catches** | ✅ Done | 70+ fixed across 34 pages |
| **Documentation** | ✅ Done | 6 docs generated |
| **AutoMapper CVE** | ❌ Open | NU1903 — high severity, needs upgrade to 13.x |

---

## 1. Critical Remaining Issues

### AutoMapper Vulnerability (NU1903)
- **Severity:** High
- **Package:** AutoMapper 12.0.1
- **Advisory:** https://github.com/advisories/GHSA-rvv3-g6hj-g44x
- **Fix:** Upgrade to AutoMapper 13.0.0+ in all .csproj files

### Password Change — No Backend Endpoint
- **Severity:** Medium
- **File:** `pages/shared/SettingsShared.tsx`
- **Issue:** Password change form has no `POST /auth/change-password` endpoint
- **Fix:** Add `ChangePasswordRequest` DTO, endpoint in AuthController, service method

### No Pagination on List Endpoints
- **Severity:** Medium
- **Scope:** All 33 list GET endpoints return all records unbounded
- **Fix:** Add `page`, `pageSize` query params to each endpoint + frontend pagination controls

---

## 2. Moderate Remaining Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Guide reports page uses client-side data only | `GuideReports.tsx` | Not showing real report data |
| 2 | No server-side PDF/Excel/CSV export | Backend | Exports are client-side only (blob download) |
| 3 | No forgot-password/reset-password flow | `AuthController` | Users cannot self-recover accounts |
| 4 | Frontend bundle 930 KB | Build output | Slow initial load — needs code-splitting |
| 5 | `AdminDashboard.tsx` shows "-" for Active Projects | `AdminDashboardResponse` | Missing field in API response |

---

## 3. Minor Remaining Issues

| # | Issue | Notes |
|---|-------|-------|
| 1 | RoleRoute.tsx was deleted — verify no imports remain | Already done |
| 2 | `useNotification` hook is a stub | Uses local state only, not API-backed |
| 3 | NotificationsScreen still has `any` type for map item | TypeScript strictness issue |
| 4 | AuthController uses `User.FindFirst()` instead of `User.GetUserId()` extension | Architecture constraint noted |
| 5 | `BackupRecord` controller Download endpoint returns file path but not actual file stream | Needs `FileStreamResult` |

---

## 4. Files Modified (This Session)

### Backend (12 files)
| File | Change |
|------|--------|
| `Filters/AuditLogActionFilter.cs` | NEW — Cross-cutting audit trail filter |
| `Controllers/AuthController.cs` | Added IAuditLogService injection, login/logout/register audit |
| `Controllers/NotificationsController.cs` | Added POST (create) + DELETE endpoints |
| `Controllers/AdminBackupController.cs` | NEW — Backup CRUD endpoints |
| `Domain/Entities/BackupRecord.cs` | NEW — Backup entity |
| `Application/Interfaces/INotificationService.cs` | Added Create + Delete |
| `Application/Interfaces/IAuditLogService.cs` | Added LogAsync |
| `Application/Interfaces/IBackupRestoreService.cs` | NEW |
| `Infrastructure/Services/NotificationService.cs` | Added Create + Delete implementation |
| `Infrastructure/Services/AuditLogService.cs` | Added LogAsync implementation |
| `Infrastructure/Services/BackupRestoreService.cs` | NEW — SQL BACKUP DATABASE execution |
| `Infrastructure/DependencyInjection.cs` | Registered BackupRestoreService |
| `Infrastructure/Persistence/ApplicationDbContext.cs` | Added BackupRecords DbSet + config |
| `Application/MappingProfiles/AdminMappingProfile.cs` | Added BackupRecord mapping |
| `Application/DTOs/Notification/CreateNotificationRequest.cs` | NEW |
| `Application/DTOs/Backup/BackupRecordResponse.cs` | NEW |
| `Api/Program.cs` | Added AuditLogActionFilter registration |
| `Infrastructure/Migrations/20260717101757_AddBackupRecords.cs` | NEW migration |

### Frontend (37 files)
| File | Change |
|------|--------|
| `pages/shared/NotificationsScreen.tsx` | Added delete, error state, notificationService |
| `pages/admin/AdminBackupRestore.tsx` | Rewritten with real API integration |
| `services/AdminService.ts` | Added backup methods |
| `services/NotificationService.ts` | Added delete method |
| `types/Admin.ts` | Added BackupRecordResponse type |
| `pages/*.tsx` (34 files) | Fixed 70+ empty catch blocks |

### Docs (6 files)
| File | Purpose |
|------|---------|
| `Architecture.md` | Architecture overview |
| `Database.md` | Database schema |
| `API.md` | API reference |
| `Deployment.md` | Deployment guide |
| `ProductionChecklist.md` | Production readiness |
| `Remaining_Issues_Report.md` | This report |
