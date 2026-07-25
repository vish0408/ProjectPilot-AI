# Role Authorization Fix Report

## Root Cause

The original `hod@researchhub.com` user was soft-deleted (`IsDeleted = true`) during development. Because the `Users` table has a **unique constraint on `Email`**, and the soft-deleted record still occupies that index, the user could not be recreated via the admin API. The `CreateUserAsync` method only checked for email conflicts among non-deleted users (`!u.IsDeleted`), but the SQL constraint applied to all rows — soft-deleted or not — causing a `DbUpdateException` on save.

Additionally, the `ExceptionMiddleware` returned `"You are not authorized to access this resource."` on **401 Unauthorized** (not 403 Forbidden), which misled users into thinking it was a role/permission problem when it was actually an authentication failure (invalid credentials or deactivated account).

## Files Modified

| File | Change |
|------|--------|
| `src/.../Api/Middlewares/ExceptionMiddleware.cs:80` | Fixed misleading 401 message from `"You are not authorized to access this resource."` to `"Invalid email, password, or account is deactivated."` |
| `src/.../Api/Program.cs:157-182` | Added `OnForbidden` handler to JWT bearer events returning structured JSON with `title: "Forbidden"` and `detail: "You do not have the required role to access this resource."` |
| `src/.../Infrastructure/Services/JwtService.cs` | Added `roleId`, `department`, `college` claims to JWT |
| `src/.../Infrastructure/Persistence/DbInitializer.cs` | Added HOD user (`hod@researchhub.com` / `Hod@123`); set `IsActive = true` on all seeded roles |
| `src/.../Infrastructure/Services/UserManagementService.cs` | `CreateUserAsync`: Changed duplicate checks to `IgnoreQueryFilters()` so soft-deleted emails are caught before hitting the SQL unique constraint. `UpdateUserAsync`: Same fix; added `Password` hash-on-change support |
| `src/.../Application/DTOs/UserManagement/UpdateUserRequest.cs` | Added optional `Password` property for admin password reset |
| `src/.../Application/Validators/UpdateUserRequestValidator.cs` | Added `Password` min-length rule (6 chars) when provided |
| `src/.../Infrastructure/Services/HodDashboardService.cs` | Fixed `Task.WhenAll` concurrent EF Core queries bug (replaced with sequential `await`) |
| `src/.../Infrastructure/Services/HodProfileService.cs` | Added unique `DepartmentName` handling to avoid `DbUpdateException` |

## JWT Payload

Current claims included in `GenerateAccessToken`:

| Claim | Value | Purpose |
|-------|-------|---------|
| `sub` | `user.Id` | User identifier |
| `email` | `user.Email` | Email for frontend display |
| `name` | `user.FullName` | Display name |
| `jti` | `Guid.NewGuid()` | Token unique ID |
| `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` | `user.Role.Name` | Role-based authorization (`[Authorize(Roles = "HOD")]`) |
| `roleId` | `user.RoleId` | Role identifier for permission lookups |
| `department` | `user.Department ?? ""` | Department for HOD/Admin filtering |
| `college` | `user.College ?? ""` | College for HOD/Admin filtering |

## Role Mapping

| DB Role Name | Backend Attribute | Frontend Role | Frontend Layout |
|-------------|-------------------|---------------|-----------------|
| `Admin` | `[Authorize(Roles = "Admin")]` | `"admin"` | Admin layout |
| `HOD` | `[Authorize(Roles = "HOD")]` | `"hod"` | HOD layout |
| `Guide` | `[Authorize(Roles = "Guide")]` | `"guide"` | Guide layout |
| `Student` | `[Authorize(Roles = "Student")]` | `"student"` | Student layout |

Frontend mapping in `AuthService.ts:67` does `role.toLowerCase()`, so `"HOD"` → `"hod"`. No case mismatch issues.

## Test Results

| Test | Result | Notes |
|------|--------|-------|
| `hod2@researchhub.com` login → all 12 HOD endpoints | ✅ Pass | Full HOD module verified |
| Admin login → `/admin/*` endpoints | ✅ Pass | Pre-existing |
| Guide login → `/guide/*` endpoints | ✅ Pass | Pre-existing |
| Student login → `/student/*` endpoints | ✅ Pass | Pre-existing |
| HOD → `/admin/dashboard` (cross-role) | ✅ 403 Forbidden | Correct behavior |
| Admin → `/hod/dashboard` (cross-role) | ✅ 403 Forbidden | Correct behavior |
| Invalid credentials → error response | ✅ Pass | Returns `"Invalid email, password, or account is deactivated."` |
| `hod@researchhub.com` recreate (DB only) | ✅ Resolved | Soft-deleted email conflict fixed via `IgnoreQueryFilters()` |
