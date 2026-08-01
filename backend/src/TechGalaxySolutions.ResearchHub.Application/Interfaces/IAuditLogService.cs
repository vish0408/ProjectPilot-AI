using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAuditLogService
{
    Task<PagedResponse<AuditLogResponse>> GetAuditLogsAsync(PagedRequest request, Guid? collegeId = null);
    Task<List<AuditLogResponse>> GetAllAuditLogsAsync(Guid? collegeId = null);
    Task<AuditLogResponse> GetAuditLogAsync(Guid id, Guid? collegeId = null);
    Task LogAsync(Guid userId, string action, string entityType, string entityId, string? previousState, string? newState);
}
