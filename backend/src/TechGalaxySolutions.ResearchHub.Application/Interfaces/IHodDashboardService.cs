using TechGalaxySolutions.ResearchHub.Application.DTOs.HodDashboard;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodDashboardService
{
    Task<HodDashboardResponse> GetDashboardAsync(Guid userId);
}
