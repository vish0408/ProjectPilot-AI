using TechGalaxySolutions.ResearchHub.Application.DTOs.Dashboard;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponse> GetStudentDashboardAsync(Guid userId);
}
