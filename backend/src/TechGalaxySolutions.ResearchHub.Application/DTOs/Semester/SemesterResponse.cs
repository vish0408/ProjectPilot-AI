namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;

public class SemesterResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
