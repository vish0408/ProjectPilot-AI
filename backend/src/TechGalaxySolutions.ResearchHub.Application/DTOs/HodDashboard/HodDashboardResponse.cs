using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodDashboard;

public class HodDashboardResponse
{
    // Header
    public string HodName { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string CollegeName { get; set; } = string.Empty;

    // Summary cards
    public int ActiveResearchProjects { get; set; }
    public int PendingTopicApprovals { get; set; }
    public int PendingProposalApprovals { get; set; }
    public int AssignedGuides { get; set; }
    public int MeetingsScheduled { get; set; }
    public int CompletedResearch { get; set; }
    public int DepartmentsManaged { get; set; }
    public int Notifications { get; set; }
    public int UpcomingDeadlines { get; set; }

    // Legacy fields for backward compatibility
    public int TotalGuides { get; set; }
    public int ActiveProjects { get; set; }
    public int CompletedProjects { get; set; }
    public int PendingReviews { get; set; }

    // PhD scholar metrics
    public int TotalScholars { get; set; }
    public int CourseworkInProgress { get; set; }
    public int CourseworkCompleted { get; set; }
    public int ResearchInProgress { get; set; }
    public int ThesisSubmitted { get; set; }
    public int CompletedScholars { get; set; }

    // Research stats
    public ResearchStatistics ResearchStats { get; set; } = new();

    // Lists
    public List<DepartmentAnnouncementResponse> Announcements { get; set; } = new();
    public List<NotificationResponse> RecentNotifications { get; set; } = new();
    
    // Charts
    public ChartData StudentProgressChart { get; set; } = new();
    public ChartData ResearchStatusChart { get; set; } = new();
    public ChartData GuideWorkloadChart { get; set; } = new();
    public ChartData MonthlyActivityChart { get; set; } = new();
    public ChartData ApprovalStatisticsChart { get; set; } = new();
    
    // Timeline
    public List<ActivityTimelineItem> RecentActivity { get; set; } = new();
    
    // Upcoming
    public List<UpcomingMeetingItem> UpcomingMeetings { get; set; } = new();
    public List<RecentSubmissionItem> RecentSubmissions { get; set; } = new();
}

public class ResearchStatistics
{
    public int TotalResearchTopics { get; set; }
    public int ActiveTopics { get; set; }
    public int TotalCategories { get; set; }
    public int AllocatedProjects { get; set; }
}

public class ChartData
{
    public List<string> Labels { get; set; } = new();
    public List<int> Data { get; set; } = new();
    public List<string> Colors { get; set; } = new();
}

public class ActivityTimelineItem
{
    public string Id { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class UpcomingMeetingItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string GuideName { get; set; } = string.Empty;
}

public class RecentSubmissionItem
{
    public Guid Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string SubmissionType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
