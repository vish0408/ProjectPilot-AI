using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentReport;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IDepartmentReportService
{
    Task<List<DepartmentReportResponse>> GetReportsAsync(Guid userId);
    Task<DepartmentReportResponse> GenerateReportAsync(Guid userId, string reportType, string title);
}
