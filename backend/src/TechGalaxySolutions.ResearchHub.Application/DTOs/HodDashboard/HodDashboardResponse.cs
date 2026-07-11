using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodDashboard;

public class HodDashboardResponse
{
    public int TotalStudents { get; set; }
    public int TotalGuides { get; set; }
    public int ActiveProjects { get; set; }
    public int CompletedProjects { get; set; }
    public int PendingReviews { get; set; }
    public List<DepartmentAnnouncementResponse> Announcements { get; set; } = new();
    public ResearchStatistics ResearchStats { get; set; } = new();
    public List<NotificationResponse> RecentNotifications { get; set; } = new();
}

public class ResearchStatistics
{
    public int TotalResearchTopics { get; set; }
    public int ActiveTopics { get; set; }
    public int TotalCategories { get; set; }
    public int AllocatedProjects { get; set; }
}
