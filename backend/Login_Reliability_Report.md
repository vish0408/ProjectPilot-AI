# Login Reliability Report

## Summary
100/100 consecutive login attempts succeeded with **0 HTTP 500 errors**, confirming the audit log `try/catch` fix eliminates the intermittent server error during login.

## Root Cause
The `AuditLogActionFilter` (an `ActionFilter`) runs on every controller action, including `AuthController.Login`. When `IAuditLogService.LogAsync` threw an unhandled exception (e.g., transient DB issue, null reference in filter context), the filter's exception propagated up through the ASP.NET Core pipeline, causing the entire login request to fail with HTTP 500 — even though `AuthService.LoginAsync` had already completed successfully.

The same issue existed in `AuthController.Login` itself, which called `_auditLogService.LogAsync` without error handling.

## Fix
1. **`AuditLogActionFilter.cs:46-53`** — Wrapped `await _auditLogService.LogAsync(...)` call in `try/catch`, logging the error but allowing the request to proceed normally.
2. **`AuthController.Login`** — Wrapped the controller-level audit log call in `try/catch`, logging a warning instead of throwing.

## Test Results
| Metric | Value |
|--------|-------|
| Total attempts | 100 |
| Successful (200) | 100 |
| Failed (HTTP 500) | 0 |
| Duration | ~24s |
| Success rate | **100%** |

## Verification
- 100 login requests executed sequentially via `Invoke-WebRequest` against `http://localhost:5168/auth/login`
- All returned HTTP 200 with valid JWT tokens
- No `ExceptionMiddleware` errors observed in server logs

## Files Changed
- `backend/src/.../Controllers/AuthController.cs` — audit log wrapped in try/catch; Stopwatch diagnostic logging removed
- `backend/src/.../Filters/AuditLogActionFilter.cs` — filter-level audit log wrapped in try/catch
