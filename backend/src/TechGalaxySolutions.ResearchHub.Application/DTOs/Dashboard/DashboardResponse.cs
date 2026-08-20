using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Dashboard;

public class DashboardResponse
{
    public ProjectSummary? CurrentProject { get; set; }
    public int CompletionPercentage { get; set; }
    public int PendingTasks { get; set; }
    public int CompletedTasks { get; set; }
    public List<MilestoneSummary> UpcomingMilestones { get; set; } = new();
    public List<DocumentSummary> RecentDocuments { get; set; } = new();
    public List<NotificationResponse> Notifications { get; set; } = new();

    // PhD scholar info
    public DateTime? JoiningCohort { get; set; }
    public string? ResearchStageName { get; set; }
    public int? RequiredCredits { get; set; }
    public int? EarnedCredits { get; set; }
    public int PassedPapers { get; set; }
    public int PendingPapers { get; set; }
    public string? CourseworkStatus { get; set; }
    public decimal CourseworkCompletionPercentage { get; set; }
}

public class ProjectSummary
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double CompletionPercentage { get; set; }
}

public class MilestoneSummary
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime TargetDate { get; set; }
    public bool IsCompleted { get; set; }
}

public class DocumentSummary
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public string UploaderName { get; set; } = string.Empty;
}
