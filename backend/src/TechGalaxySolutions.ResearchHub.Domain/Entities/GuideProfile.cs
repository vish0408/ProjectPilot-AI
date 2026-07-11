namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class GuideProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Bio { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
}
