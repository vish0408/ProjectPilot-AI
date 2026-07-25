using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideDashboard;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class GuideDashboardService : IGuideDashboardService
{
    private readonly IProjectAnalyticsService _analytics;

    public GuideDashboardService(IProjectAnalyticsService analytics)
    {
        _analytics = analytics;
    }

    public async Task<GuideDashboardResponse> GetDashboardAsync(Guid userId)
    {
        return await _analytics.GetGuideDashboardAsync(userId);
    }
}
