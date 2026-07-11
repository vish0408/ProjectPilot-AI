# Security Report - ResearchHubAI

## Authentication & Authorization

### JWT Configuration
| Parameter | Value | Assessment |
|-----------|-------|------------|
| Access Token Expiry | 15 minutes | ✅ Appropriate |
| Refresh Token Expiry | 7 days | ✅ Standard |
| Token Signing Key | Configurable via `Jwt:Key` | ⚠️ Null-forgiving operator (FIXED) |
| Issuer/Audience | Configurable | ✅ Proper |

### Authorization Guards
| Role | Endpoint Access | Status |
|------|----------------|--------|
| Admin | `admin/*` | ✅ All protected |
| HOD | `hod/*` | ✅ All protected |
| Guide | `guide/*`, `dashboard/guide`, `reviews/*`, etc. | ✅ All protected (FIXED) |
| Student | `student/*`, `dashboard/student`, `projects/*`, etc. | ✅ All protected |

## Identified Risks

### HIGH: Token Storage in localStorage
**Risk**: XSS vulnerability - tokens stored in `localStorage` are accessible to any JavaScript running on the page.
**Location**: `api/client.ts:17-18`, `services/AuthService.ts:84-103`
**Recommendation**: Use httpOnly cookies stored server-side.

### MEDIUM: CORS Configuration
**Risk**: Only `http://localhost:5173` is allowed.
**Location**: `Program.cs:47`
**Recommendation**: Make CORS origins configurable via environment variable.

### MEDIUM: Hardcoded Seed Passwords
**Risk**: Production seed data uses guessable passwords.
**Location**: `DbInitializer.cs`
**Recommendation**: Change all seed passwords before production deployment.

### LOW: SQL Injection
**Assessment**: No raw SQL strings found in the codebase. All queries use EF Core LINQ with parameterized queries. ✅

### LOW: XSS
**Assessment**: React's built-in JSX escaping provides basic XSS protection. No `dangerouslySetInnerHTML` usage found. ✅

### LOW: CSRF
**Assessment**: JWT bearer tokens are immune to CSRF when stored in Authorization header. ✅

## Security Checklist
| Control | Status |
|---------|--------|
| Password hashing (BCrypt) | ✅ Implemented |
| JWT token validation | ✅ Implemented |
| Role-based authorization | ✅ Implemented |
| SQL injection prevention | ✅ EF Core parameterized queries |
| XSS prevention | ✅ React JSX escaping |
| CORS configuration | ⚠️ Needs production config |
| Token storage | ❌ localStorage (should be httpOnly cookies) |
| Rate limiting | ❌ Not implemented |
| Audit logging | ✅ Admin audit logs |
| Input validation | ✅ FluentValidation |
| Exception sanitization | ✅ No stack traces in 500 responses |
| HTTPS enforcement | ❌ Not configured in code |
