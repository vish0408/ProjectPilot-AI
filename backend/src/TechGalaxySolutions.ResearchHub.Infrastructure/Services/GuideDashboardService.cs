using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class GuideDashboardService : IGuideDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GuideDashboardService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<GuideDashboardResponse> GetDashboardAsync(Guid userId)
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

        var recentNotifications = await _context.Set<Domain.Entities.Notification>().AsNoTracking()
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .ToListAsync();

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
                StudentName = r.Project.Student.FullName,
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
        };
    }
}
