namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ResearchTopic : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public ResearchCategory Category { get; set; } = null!;
    public Guid DepartmentProfileId { get; set; }
    public DepartmentProfile DepartmentProfile { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}
