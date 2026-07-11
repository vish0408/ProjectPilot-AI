using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAuditLogService
{
    Task<List<AuditLogResponse>> GetAuditLogsAsync();
    Task<AuditLogResponse> GetAuditLogAsync(Guid id);
}
