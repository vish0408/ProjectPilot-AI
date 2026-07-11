namespace TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentReport;

public class DepartmentReportResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public string GeneratedByName { get; set; } = string.Empty;
}
