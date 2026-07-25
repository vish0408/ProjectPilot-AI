namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class College : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public string Status { get; set; } = "Active";

    public Guid? SubscriptionId { get; set; }

    public long StorageLimitBytes { get; set; } = 1073741824;

    public ICollection<Department> Departments { get; set; } = new List<Department>();
}
