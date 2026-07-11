using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.GuideDashboard;

public class GuideDashboardResponse
{
    public int TotalAssignedStudents { get; set; }
    public int ProjectsUnderReview { get; set; }
    public int PendingReviews { get; set; }
    public int UpcomingMeetings { get; set; }
    public List<AssignedStudentSummary> AssignedStudents { get; set; } = new();
    public List<PendingReviewSummary> PendingReviewList { get; set; } = new();
    public List<UpcomingMeetingSummary> UpcomingMeetingsList { get; set; } = new();
    public List<NotificationResponse> RecentNotifications { get; set; } = new();
}

public class AssignedStudentSummary
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Enrollment { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string ResearchTopic { get; set; } = string.Empty;
    public string? ProjectTitle { get; set; }
    public string? ProjectStatus { get; set; }
    public double CompletionPercentage { get; set; }
    public int TotalChapters { get; set; }
    public int ApprovedChapters { get; set; }
}

public class PendingReviewSummary
{
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public Guid ReviewId { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime? SubmittedAt { get; set; }
}

public class UpcomingMeetingSummary
{
    public Guid MeetingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string MeetingLink { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
