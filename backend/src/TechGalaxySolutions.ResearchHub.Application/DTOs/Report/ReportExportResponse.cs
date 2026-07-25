namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Report;

public class ReportExportResponse
{
    public byte[] FileContent { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
