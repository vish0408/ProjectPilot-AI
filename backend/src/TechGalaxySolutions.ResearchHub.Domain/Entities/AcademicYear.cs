namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class AcademicYear : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsCurrent { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public ICollection<Semester> Semesters { get; set; } = new List<Semester>();
}
