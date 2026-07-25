using TechGalaxySolutions.ResearchHub.Application.DTOs.Dashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IProjectAnalyticsService
{
    Task<DashboardResponse> GetStudentDashboardAsync(Guid userId);
    Task<GuideDashboardResponse> GetGuideDashboardAsync(Guid userId);
    Task<HodDashboardResponse> GetHodDashboardAsync(Guid userId);
}
