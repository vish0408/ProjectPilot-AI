namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Semester : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public int Number { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public Guid AcademicYearId { get; set; }

    public AcademicYear AcademicYear { get; set; } = null!;

    public bool IsCurrent { get; set; } = false;

    public bool IsActive { get; set; } = true;
}
