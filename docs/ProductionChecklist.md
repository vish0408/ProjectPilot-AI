# Production Readiness Checklist

## Security
- [x] JWT authentication on all non-public endpoints
- [x] Role-based authorization (Admin, HOD, Guide, Student)
- [x] Input validation via [ApiController] attributes
- [x] No hardcoded secrets in codebase
- [ ] Update AutoMapper 12.0.1 (has known high-severity CVE)
- [ ] Add rate limiting on auth endpoints
- [ ] Add forgot password / password reset flow
- [ ] Add account lockout after N failed attempts

## Data
- [x] SQL Server backed (no mock data)
- [x] Soft deletes on all entities
- [x] Audit log table schema (but not yet populated by all controllers — action filter + auth done)
- [x] Notification system (create, read, mark-read, mark-all-read, delete)
- [x] Backup & restore infrastructure

## Performance
- [ ] Add pagination to all list endpoints (page, pageSize parameters)
- [ ] Add search/filter to all list endpoints
- [ ] Add database indexes on frequently queried columns (most already have FK indexes)
- [ ] Reduce bundle size (currently 930 KB — consider dynamic imports)
- [ ] Add response caching for dashboard endpoints

## Monitoring
- [ ] Add health check endpoint
- [ ] Add structured logging (Serilog or similar)
- [ ] Add Application Insights / OpenTelemetry
- [ ] Add database query logging (EF Core logging)

## Reliability
- [x] Error handling on all API endpoints (ExceptionMiddleware)
- [x] Error state displays in all frontend pages
- [x] Loading states on all async pages
- [x] Empty states for zero-data scenarios
- [ ] Add retry policy for database transient faults
- [ ] Add circuit breaker for AI provider calls (already has retry)

## SaaS Readiness
- [ ] Add user self-registration
- [ ] Add email notifications (welcome, password reset, project updates)
- [ ] Add password change endpoint (SettingsShared.tsx non-functional)
- [ ] Add multi-tenancy support
- [ ] Add subscription/billing integration

## Remaining Gaps (Non-AI)
1. Password change — no backend endpoint exists
2. Audit logs — only AuthController logs (action filter logs mutations generically)
3. Notifications — need to be integrated into business operations (project create, review submit, etc.)
4. Reports — HOD only, Guide reports are client-side only
5. No PDF/Excel/CSV server-side export
6. Pagination not implemented on any list GET endpoint
7. AutoMapper vulnerability (NU1903)
