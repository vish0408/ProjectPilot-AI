using TechGalaxySolutions.ResearchHub.Application.DTOs.HodDashboard;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodDashboardService : IHodDashboardService
{
    private readonly IProjectAnalyticsService _analytics;

    public HodDashboardService(IProjectAnalyticsService analytics)
    {
        _analytics = analytics;
    }

    public async Task<HodDashboardResponse> GetDashboardAsync(Guid userId)
    {
        return await _analytics.GetHodDashboardAsync(userId);
    }
}
