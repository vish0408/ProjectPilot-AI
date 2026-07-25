namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodProgress;

public class HodProgressResponse
{
    public List<StudentProgressItem> Students { get; set; } = new();
    public List<DelayedProjectItem> DelayedProjects { get; set; } = new();
    public List<UpcomingDeadlineItem> UpcomingDeadlines { get; set; } = new();
    public ProgressStatistics Statistics { get; set; } = new();
}

public class StudentProgressItem
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Enrollment { get; set; } = string.Empty;
    public string ProjectTitle { get; set; } = string.Empty;
    public string GuideName { get; set; } = string.Empty;
    public double CompletionPercentage { get; set; }
    public string Status { get; set; } = string.Empty;
    public int MilestonesCompleted { get; set; }
    public int TotalMilestones { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? TargetEndDate { get; set; }
    public bool IsDelayed { get; set; }
}

public class DelayedProjectItem
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string GuideName { get; set; } = string.Empty;
    public double CompletionPercentage { get; set; }
    public DateTime TargetEndDate { get; set; }
    public int DaysOverdue { get; set; }
}

public class UpcomingDeadlineItem
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string DeadlineType { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public int DaysRemaining { get; set; }
}

public class ProgressStatistics
{
    public int TotalProjects { get; set; }
    public int OnTrack { get; set; }
    public int Delayed { get; set; }
    public int Completed { get; set; }
    public double AverageCompletion { get; set; }
}
