namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class FacultyMember : BaseEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public Guid DepartmentId { get; set; }

    public Department Department { get; set; } = null!;

    public string Designation { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public DateTime JoiningDate { get; set; }

    public bool IsActive { get; set; } = true;
}
