namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class DepartmentProfile : BaseEntity
{
    public string DepartmentName { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Guid? HodUserId { get; set; }
    public User? HodUser { get; set; }
}
