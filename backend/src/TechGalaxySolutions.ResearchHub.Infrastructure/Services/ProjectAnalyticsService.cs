using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Dashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ProjectAnalyticsService : IProjectAnalyticsService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProjectAnalyticsService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<DashboardResponse> GetStudentDashboardAsync(Guid userId)
    {
        var project = await _context.Projects.AsNoTracking()
            .Where(p => p.StudentId == userId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                Project = p,
                UpcomingMilestones = p.Milestones
                    .Where(m => !m.IsCompleted && !m.IsDeleted)
                    .OrderBy(m => m.TargetDate)
                    .Take(5)
                    .ToList(),
                RecentDocuments = p.Documents
                    .Where(d => !d.IsDeleted)
                    .OrderByDescending(d => d.UploadedAt)
                    .Take(5)
                    .ToList(),
                PendingTasks = p.Tasks.Count(t => !t.IsDeleted && t.Status != TaskItemStatus.Completed),
                CompletedTasks = p.Tasks.Count(t => !t.IsDeleted && t.Status == TaskItemStatus.Completed),
            })
            .FirstOrDefaultAsync();

        var notifications = await _context.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .ToListAsync();

        var response = new DashboardResponse();

        if (project != null)
        {
            response.CurrentProject = _mapper.Map<ProjectSummary>(project.Project);
            response.CompletionPercentage = (int)project.Project.CompletionPercentage;
            response.PendingTasks = project.PendingTasks;
            response.CompletedTasks = project.CompletedTasks;
            response.UpcomingMilestones = _mapper.Map<List<MilestoneSummary>>(project.UpcomingMilestones);
            response.RecentDocuments = _mapper.Map<List<DocumentSummary>>(project.RecentDocuments);
        }

        response.Notifications = _mapper.Map<List<NotificationResponse>>(notifications);

        return response;
    }

    public async Task<GuideDashboardResponse> GetGuideDashboardAsync(Guid userId)
    {
        var assignedStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.GuideId == userId && !s.IsDeleted)
            .ToListAsync();

        var studentUserIds = assignedStudents.Select(s => s.UserId).ToList();

        var projects = await _context.Projects.AsNoTracking()
            .Include(p => p.Student)
            .Where(p => studentUserIds.Contains(p.StudentId) && !p.IsDeleted)
            .ToListAsync();

        var projectIds = projects.Select(p => p.Id).ToList();

        var pendingReviews = await _context.Set<Review>().AsNoTracking()
            .Include(r => r.Project)
            .Include(r => r.Project.Student)
            .Where(r => r.GuideId == userId && r.Status == ReviewStatus.Pending && !r.IsDeleted)
            .ToListAsync();

        var upcomingMeetings = await _context.Set<Meeting>().AsNoTracking()
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .Where(m => m.GuideId == userId && m.Status == MeetingStatus.Scheduled && m.ScheduledAt > DateTime.UtcNow && !m.IsDeleted)
            .OrderBy(m => m.ScheduledAt)
            .Take(5)
            .ToListAsync();

        var recentNotifications = await _context.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .ToListAsync();

        var thesisDocs = await _context.ProjectDocuments.AsNoTracking()
            .Include(d => d.Project).ThenInclude(p => p.Student)
            .Include(d => d.Uploader)
            .Where(d => !d.IsDeleted && studentUserIds.Contains(d.UploaderId))
            .OrderByDescending(d => d.UploadedAt)
            .Take(20)
            .ToListAsync();

        var thesisDocIds = thesisDocs.Select(d => d.Id).ToList();
        var thesisReviews = await _context.Set<DocumentReview>().AsNoTracking()
            .Where(r => thesisDocIds.Contains(r.DocumentId) && r.GuideId == userId && !r.IsDeleted)
            .GroupBy(r => r.DocumentId)
            .ToDictionaryAsync(g => g.Key, g => g.OrderByDescending(r => r.CreatedAt).FirstOrDefault());

        var thesisProfileIds = thesisDocs.Select(d => d.UploaderId).Distinct().ToList();
        var thesisProfiles = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => thesisProfileIds.Contains(s.UserId) && !s.IsDeleted)
            .ToDictionaryAsync(s => s.UserId);

        var pendingThesisReviews = new List<ThesisDocumentSummary>();
        foreach (var doc in thesisDocs)
        {
            var exists = thesisReviews.TryGetValue(doc.Id, out var review);
            pendingThesisReviews.Add(new ThesisDocumentSummary
            {
                DocumentId = doc.Id,
                ProjectId = doc.ProjectId,
                ProjectTitle = doc.Project.Title,
                FileName = doc.FileName,
                FileType = doc.FileType,
                FileSize = doc.FileSize,
                UploadedAt = doc.UploadedAt,
                StudentId = doc.UploaderId,
                StudentName = doc.Project.Student?.FullName ?? doc.Uploader.FullName,
                Enrollment = thesisProfiles.GetValueOrDefault(doc.UploaderId)?.Enrollment ?? "",
                Department = thesisProfiles.GetValueOrDefault(doc.UploaderId)?.Department ?? "",
                ResearchTopic = thesisProfiles.GetValueOrDefault(doc.UploaderId)?.ResearchTopic ?? "",
                ReviewStatus = review?.Status,
                Version = 1,
            });
        }

        return new GuideDashboardResponse
        {
            TotalAssignedStudents = assignedStudents.Count,
            ProjectsUnderReview = projects.Count(p => p.Status == ProjectStatus.InProgress),
            PendingReviews = pendingReviews.Count,
            UpcomingMeetings = upcomingMeetings.Count,
            AssignedStudents = assignedStudents.Select(s =>
            {
                var studentProjects = projects.Where(p => p.StudentId == s.UserId).ToList();
                return new AssignedStudentSummary
                {
                    UserId = s.UserId,
                    FullName = s.User.FullName,
                    Email = s.User.Email,
                    Enrollment = s.Enrollment,
                    Department = s.Department,
                    ResearchTopic = s.ResearchTopic ?? string.Empty,
                    ProjectTitle = studentProjects.FirstOrDefault()?.Title,
                    ProjectStatus = studentProjects.FirstOrDefault()?.Status.ToString(),
                    CompletionPercentage = studentProjects.FirstOrDefault()?.CompletionPercentage ?? 0,
                };
            }).ToList(),
            PendingReviewList = pendingReviews.Select(r => new PendingReviewSummary
            {
                ProjectId = r.ProjectId,
                ProjectTitle = r.Project.Title,
                StudentName = r.Project.Student?.FullName ?? "Unknown",
                ReviewId = r.Id,
                Type = "Project Review",
                SubmittedAt = r.CreatedAt,
            }).ToList(),
            UpcomingMeetingsList = upcomingMeetings.Select(m => new UpcomingMeetingSummary
            {
                MeetingId = m.Id,
                Title = m.Title,
                ScheduledAt = m.ScheduledAt,
                DurationMinutes = m.DurationMinutes,
                MeetingLink = m.MeetingLink,
                Status = m.Status.ToString(),
            }).ToList(),
            RecentNotifications = _mapper.Map<List<NotificationResponse>>(recentNotifications),
            PendingThesisReviews = pendingThesisReviews,
        };
    }

    public async Task<HodDashboardResponse> GetHodDashboardAsync(Guid userId)
    {
        var profile = await _context.Set<DepartmentProfile>().AsNoTracking()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted);

        Guid? deptId = profile?.Id;

        var totalStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .CountAsync(s => !s.IsDeleted);
        var totalGuides = await _context.Set<GuideProfile>().AsNoTracking()
            .CountAsync(g => !g.IsDeleted);

        var activeProjects = await _context.Projects.AsNoTracking()
            .CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.InProgress);
        var completedProjects = await _context.Projects.AsNoTracking()
            .CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.Completed);

        var pendingReviews = await _context.Set<Review>().AsNoTracking()
            .CountAsync(r => !r.IsDeleted && r.Status == ReviewStatus.Pending);

        var meetingsScheduled = await _context.Set<Meeting>().AsNoTracking()
            .CountAsync(m => !m.IsDeleted && m.Status == MeetingStatus.Scheduled);

        var departmentsManaged = await _context.Departments.AsNoTracking()
            .CountAsync(d => !d.IsDeleted);

        var allProjects = await _context.Projects.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToListAsync();

        var allStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.Guide)
            .Where(s => !s.IsDeleted)
            .ToListAsync();

        var allGuides = await _context.Set<GuideProfile>().AsNoTracking()
            .Include(g => g.User)
            .Where(g => !g.IsDeleted)
            .ToListAsync();

        var topicsCount = await _context.Set<ResearchTopic>().AsNoTracking()
            .CountAsync(t => !t.IsDeleted);
        var activeTopics = await _context.Set<ResearchTopic>().AsNoTracking()
            .CountAsync(t => !t.IsDeleted && t.IsActive);
        var categoriesCount = await _context.Set<ResearchCategory>().AsNoTracking()
            .CountAsync(c => !c.IsDeleted);
        var allocationsCount = await _context.Set<ProjectAllocation>().AsNoTracking()
            .CountAsync(a => !a.IsDeleted && a.Status == AllocationStatus.Active);

        var approvalStats = await _context.Set<ApprovalHistory>().AsNoTracking()
            .GroupBy(a => a.Action)
            .Select(g => new { Action = g.Key, Count = g.Count() })
            .ToListAsync();

        var recentActivities = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Include(a => a.Guide)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .Select(a => new ActivityTimelineItem
            {
                Id = a.Id.ToString(),
                Action = a.Action.ToString(),
                Description = string.IsNullOrEmpty(a.Comments) ? "No details" : a.Comments,
                UserName = a.Guide != null ? a.Guide.FullName : "System",
                Timestamp = a.CreatedAt,
                Type = "Approval"
            })
            .ToListAsync();

        var upcomingMeetings = await _context.Set<Meeting>().AsNoTracking()
            .Include(m => m.Guide)
            .Where(m => !m.IsDeleted && m.Status == MeetingStatus.Scheduled && m.ScheduledAt >= DateTime.UtcNow)
            .OrderBy(m => m.ScheduledAt)
            .Take(5)
            .Select(m => new UpcomingMeetingItem
            {
                Id = m.Id,
                Title = m.Title,
                ScheduledAt = m.ScheduledAt,
                DurationMinutes = m.DurationMinutes,
                Status = m.Status.ToString(),
                GuideName = m.Guide != null ? m.Guide.FullName : ""
            })
            .ToListAsync();

        var recentSubmissions = await _context.Projects.AsNoTracking()
            .Include(p => p.Student)
            .Where(p => !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .Take(10)
            .Select(p => new RecentSubmissionItem
            {
                Id = p.Id,
                StudentName = p.Student.FullName,
                SubmissionType = "Project",
                Title = p.Title,
                SubmittedAt = p.CreatedAt,
                Status = p.Status.ToString()
            })
            .ToListAsync();

        var notifications = await _context.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .ToListAsync();

        var announcements = deptId.HasValue
            ? await _context.Set<DepartmentAnnouncement>().AsNoTracking()
                .Include(a => a.CreatedByUser)
                .Where(a => a.DepartmentProfileId == deptId.Value && !a.IsDeleted && a.Status == AnnouncementStatus.Published)
                .OrderByDescending(a => a.PublishedAt)
                .Take(5)
                .ToListAsync()
            : new List<DepartmentAnnouncement>();

        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var monthlyActivity = await _context.Projects.AsNoTracking()
            .Where(p => !p.IsDeleted && p.CreatedAt >= sixMonthsAgo)
            .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync();

        var assignedGuideCount = allGuides.Count(g => allStudents.Any(s => s.GuideId == g.UserId));
        var pendingTopicApprovals = topicsCount;
        var pendingProposalApprovals = await _context.Set<AIProposal>().AsNoTracking()
            .CountAsync(p => !p.IsDeleted && (string.IsNullOrEmpty(p.Status) || p.Status == "Pending"));

        var now = DateTime.UtcNow;
        var upcomingDeadlines = allProjects.Count(p =>
            p.TargetEndDate.HasValue &&
            p.TargetEndDate.Value > now &&
            p.TargetEndDate.Value <= now.AddDays(30) &&
            p.Status != ProjectStatus.Completed);

        var monthLabels = new List<string>();
        var monthData = new List<int>();
        for (int i = 5; i >= 0; i--)
        {
            var dt = now.AddMonths(-i);
            monthLabels.Add(dt.ToString("MMM yyyy"));
            monthData.Add(monthlyActivity.FirstOrDefault(m => m.Year == dt.Year && m.Month == dt.Month)?.Count ?? 0);
        }

        var onTrack = allProjects.Count(p => p.CompletionPercentage >= 50 && p.Status != ProjectStatus.Completed);
        var behind = allProjects.Count(p => p.CompletionPercentage < 50 && p.Status != ProjectStatus.Completed && p.Status != ProjectStatus.NotStarted);
        var notStarted = allProjects.Count(p => p.Status == ProjectStatus.NotStarted);
        var completed = allProjects.Count(p => p.Status == ProjectStatus.Completed);

        var inProgress = allProjects.Count(p => p.Status == ProjectStatus.InProgress);
        var onHold = allProjects.Count(p => p.Status == ProjectStatus.OnHold);
        var cancelled = 0;

        var topGuides = allGuides
            .Select(g => new
            {
                Name = g.User.FullName,
                Count = allStudents.Count(s => s.GuideId == g.UserId)
            })
            .OrderByDescending(g => g.Count)
            .Take(10)
            .ToList();

        var approved = approvalStats.FirstOrDefault(a => a.Action == ApprovalAction.Approved)?.Count ?? 0;
        var rejected = approvalStats.FirstOrDefault(a => a.Action == ApprovalAction.Rejected)?.Count ?? 0;
        var pendingApprovals = approvalStats.FirstOrDefault(a => a.Action == ApprovalAction.Submitted)?.Count ?? 0;

        return new HodDashboardResponse
        {
            TotalStudents = totalStudents,
            ActiveResearchProjects = activeProjects,
            PendingTopicApprovals = pendingTopicApprovals,
            PendingProposalApprovals = pendingProposalApprovals,
            AssignedGuides = assignedGuideCount,
            MeetingsScheduled = meetingsScheduled,
            CompletedResearch = completedProjects,
            DepartmentsManaged = departmentsManaged,
            Notifications = notifications.Count,
            UpcomingDeadlines = upcomingDeadlines,

            TotalGuides = totalGuides,
            ActiveProjects = activeProjects,
            CompletedProjects = completedProjects,
            PendingReviews = pendingReviews,

            ResearchStats = new ResearchStatistics
            {
                TotalResearchTopics = topicsCount,
                ActiveTopics = activeTopics,
                TotalCategories = categoriesCount,
                AllocatedProjects = allocationsCount,
            },

            Announcements = _mapper.Map<List<DepartmentAnnouncementResponse>>(announcements),
            RecentNotifications = _mapper.Map<List<NotificationResponse>>(notifications),

            StudentProgressChart = new ChartData
            {
                Labels = new List<string> { "On Track", "Behind", "Not Started", "Completed" },
                Data = new List<int> { onTrack, behind, notStarted, completed },
                Colors = new List<string> { "#22c55e", "#ef4444", "#f59e0b", "#3b82f6" }
            },
            ResearchStatusChart = new ChartData
            {
                Labels = new List<string> { "In Progress", "Completed", "On Hold", "Not Started", "Cancelled" },
                Data = new List<int> { inProgress, completedProjects, onHold, notStarted, cancelled },
                Colors = new List<string> { "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#6b7280" }
            },
            GuideWorkloadChart = new ChartData
            {
                Labels = topGuides.Select(g => g.Name).ToList(),
                Data = topGuides.Select(g => g.Count).ToList(),
                Colors = topGuides.Select((_, i) => $"hsl({(i * 35) % 360}, 70%, 50%)").ToList()
            },
            MonthlyActivityChart = new ChartData
            {
                Labels = monthLabels,
                Data = monthData,
                Colors = Enumerable.Repeat("#3b82f6", 6).ToList()
            },
            ApprovalStatisticsChart = new ChartData
            {
                Labels = new List<string> { "Approved", "Rejected", "Pending" },
                Data = new List<int> { approved, rejected, pendingApprovals },
                Colors = new List<string> { "#22c55e", "#ef4444", "#f59e0b" }
            },

            RecentActivity = recentActivities,
            UpcomingMeetings = upcomingMeetings,
            RecentSubmissions = recentSubmissions,
        };
    }
}
