namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;

public class ExportStudentsRequest
{
    public string? Search { get; set; }
    public string? Format { get; set; } = "csv"; // csv, excel, pdf
    public string? FilterStatus { get; set; }
}
