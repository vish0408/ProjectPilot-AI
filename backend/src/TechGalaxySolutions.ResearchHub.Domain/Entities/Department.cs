namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Department : BaseEntity
{
    public string DepartmentCode { get; set; } = string.Empty;

    public string DepartmentName { get; set; } = string.Empty;

    public string ShortName { get; set; } = string.Empty;

    public Guid CollegeId { get; set; }

    public College College { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public Guid? HodId { get; set; }

    public User? Hod { get; set; }

    public ICollection<FacultyMember> FacultyMembers { get; set; } = new List<FacultyMember>();
}
