using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProgress;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodProgressService : IHodProgressService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodProgressService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<HodProgressResponse> GetProgressAsync(Guid userId)
    {
        var students = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.Guide)
            .Where(s => !s.IsDeleted)
            .ToListAsync();

        var studentIds = students.Select(s => s.UserId).ToList();

        var projects = await _context.Projects.AsNoTracking()
            .Where(p => studentIds.Contains(p.StudentId) && !p.IsDeleted)
            .ToListAsync();
        var projectLookup = projects.ToLookup(p => p.StudentId);
        var projectIds = projects.Select(p => p.Id).ToList();

        var milestones = await _context.Milestones.AsNoTracking()
            .Where(m => projectIds.Contains(m.ProjectId) && !m.IsDeleted)
            .ToListAsync();
        var milestoneLookup = milestones.ToLookup(m => m.ProjectId);

        var now = DateTime.UtcNow;
        var studentProgressItems = new List<StudentProgressItem>();
        var delayedProjects = new List<DelayedProjectItem>();
        var upcomingDeadlines = new List<UpcomingDeadlineItem>();
        var totalCompleted = 0;
        var totalOnTrack = 0;
        var totalDelayed = 0;
        var totalCompletionSum = 0.0;

        foreach (var student in students)
        {
            var project = projectLookup[student.UserId].FirstOrDefault();
            if (project == null) continue;

            var projMilestones = milestoneLookup[project.Id].ToList();
            var completedMs = projMilestones.Count(m => m.IsCompleted);
            var totalMs = projMilestones.Count;
            var isDelayed = project.TargetEndDate.HasValue && project.TargetEndDate.Value < now && project.Status != ProjectStatus.Completed;

            totalCompletionSum += project.CompletionPercentage;

            if (project.Status == ProjectStatus.Completed)
                totalCompleted++;
            else if (isDelayed)
                totalDelayed++;
            else
                totalOnTrack++;

            studentProgressItems.Add(new StudentProgressItem
            {
                UserId = student.UserId,
                FullName = student.User.FullName,
                Email = student.User.Email,
                Enrollment = student.Enrollment ?? "",
                ProjectTitle = project.Title,
                GuideName = student.Guide?.FullName ?? "Not Assigned",
                CompletionPercentage = project.CompletionPercentage,
                Status = project.Status.ToString(),
                MilestonesCompleted = completedMs,
                TotalMilestones = totalMs,
                StartDate = project.StartDate,
                TargetEndDate = project.TargetEndDate,
                IsDelayed = isDelayed,
            });

            if (isDelayed)
            {
                var daysOverdue = (int)(now - project.TargetEndDate!.Value).TotalDays;
                delayedProjects.Add(new DelayedProjectItem
                {
                    ProjectId = project.Id,
                    Title = project.Title,
                    StudentName = student.User.FullName,
                    GuideName = student.Guide?.FullName ?? "Not Assigned",
                    CompletionPercentage = project.CompletionPercentage,
                    TargetEndDate = project.TargetEndDate.Value,
                    DaysOverdue = daysOverdue,
                });
            }

            if (project.TargetEndDate.HasValue && project.TargetEndDate.Value > now && project.TargetEndDate.Value <= now.AddDays(30))
            {
                upcomingDeadlines.Add(new UpcomingDeadlineItem
                {
                    ProjectId = project.Id,
                    Title = project.Title,
                    StudentName = student.User.FullName,
                    DeadlineType = "Project End",
                    Deadline = project.TargetEndDate.Value,
                    DaysRemaining = (int)(project.TargetEndDate.Value - now).TotalDays,
                });
            }
        }

        var totalProjects = studentProgressItems.Count;

        return new HodProgressResponse
        {
            Students = studentProgressItems,
            DelayedProjects = delayedProjects.OrderByDescending(d => d.DaysOverdue).ToList(),
            UpcomingDeadlines = upcomingDeadlines.OrderBy(d => d.Deadline).ToList(),
            Statistics = new ProgressStatistics
            {
                TotalProjects = totalProjects,
                OnTrack = totalOnTrack,
                Delayed = totalDelayed,
                Completed = totalCompleted,
                AverageCompletion = totalProjects > 0 ? Math.Round(totalCompletionSum / totalProjects, 1) : 0,
            },
        };
    }
}
