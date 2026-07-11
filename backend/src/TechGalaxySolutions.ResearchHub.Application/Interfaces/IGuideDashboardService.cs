using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideDashboard;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IGuideDashboardService
{
    Task<GuideDashboardResponse> GetDashboardAsync(Guid userId);
}
