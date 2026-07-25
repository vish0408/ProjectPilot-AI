using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAuditLogService
{
    Task<List<AuditLogResponse>> GetAuditLogsAsync();
    Task<AuditLogResponse> GetAuditLogAsync(Guid id);
    Task LogAsync(Guid userId, string action, string entityType, string entityId, string? previousState, string? newState);
}
