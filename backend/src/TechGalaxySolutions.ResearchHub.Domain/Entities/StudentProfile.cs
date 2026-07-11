namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class StudentProfile : BaseEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string Enrollment { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Institution { get; set; } = string.Empty;

    public string? ResearchTopic { get; set; }

    public Guid? GuideId { get; set; }

    public User? Guide { get; set; }
}
