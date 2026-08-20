namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Coursework;

public class CourseworkSummaryResponse
{
    public int? RequiredCredits { get; set; }
    public int EarnedCredits { get; set; }
    public int RemainingCredits { get; set; }
    public int TotalPapers { get; set; }
    public int PassedPapers { get; set; }
    public int PendingPapers { get; set; }
    public int FailedPapers { get; set; }
    public string CourseworkStatus { get; set; } = string.Empty;
    public decimal CompletionPercentage { get; set; }
}
