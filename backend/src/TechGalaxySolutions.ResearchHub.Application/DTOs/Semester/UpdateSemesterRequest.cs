namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;

public class UpdateSemesterRequest
{
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid AcademicYearId { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; }
}
