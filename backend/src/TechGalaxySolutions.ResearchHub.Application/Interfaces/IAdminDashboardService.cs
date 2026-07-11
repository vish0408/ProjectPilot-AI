using TechGalaxySolutions.ResearchHub.Application.DTOs.AdminDashboard;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardResponse> GetDashboardAsync();
}
