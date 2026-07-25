namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Hod : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public Guid CollegeId { get; set; }
    public College College { get; set; } = null!;
    public string Qualification { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
    public string? ProfilePhoto { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsActive { get; set; } = true;
}
