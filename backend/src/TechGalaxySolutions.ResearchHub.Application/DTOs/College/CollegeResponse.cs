namespace TechGalaxySolutions.ResearchHub.Application.DTOs.College;

public class CollegeResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? SubscriptionId { get; set; }
    public long StorageLimitBytes { get; set; }
    public int DepartmentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
