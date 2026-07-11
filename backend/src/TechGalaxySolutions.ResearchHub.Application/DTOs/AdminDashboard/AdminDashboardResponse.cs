namespace TechGalaxySolutions.ResearchHub.Application.DTOs.AdminDashboard;

public class AdminDashboardResponse
{
    public int TotalUsers { get; set; }
    public int TotalStudents { get; set; }
    public int TotalGuides { get; set; }
    public int TotalHods { get; set; }
    public int TotalColleges { get; set; }
    public int TotalDepartments { get; set; }
    public int ActiveAcademicYears { get; set; }
    public List<AuditLogSummary> RecentLogs { get; set; } = new();
    public Dictionary<string, int> UsersByRole { get; set; } = new();
}

public class AuditLogSummary
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
