namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Guid CollegeId { get; set; }

    public College College { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public ICollection<FacultyMember> FacultyMembers { get; set; } = new List<FacultyMember>();
}
