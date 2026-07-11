namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class DepartmentReport : BaseEntity
{
    public Guid DepartmentProfileId { get; set; }
    public DepartmentProfile DepartmentProfile { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public Guid GeneratedByUserId { get; set; }
    public User GeneratedByUser { get; set; } = null!;
}
