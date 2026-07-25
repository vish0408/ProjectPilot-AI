using TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ILoginHistoryService
{
    Task RecordLoginAsync(Guid userId, bool isSuccess, string? ipAddress = null, string? userAgent = null, string? failureReason = null, string? roleName = null);
    Task RecordLogoutAsync(Guid userId, string? ipAddress = null);
    Task<List<LoginHistoryResponse>> GetUserLoginHistoryAsync(Guid userId, int count = 20);
}
