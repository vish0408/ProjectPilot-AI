using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAuditLogService
{
    Task<PagedResponse<AuditLogResponse>> GetAuditLogsAsync(PagedRequest request);
    Task<List<AuditLogResponse>> GetAllAuditLogsAsync();
    Task<AuditLogResponse> GetAuditLogAsync(Guid id);
    Task LogAsync(Guid userId, string action, string entityType, string entityId, string? previousState, string? newState);
}
