namespace TechGalaxySolutions.ResearchHub.Application.DTOs.AcademicYear;

public class UpdateAcademicYearRequest
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; }
}
