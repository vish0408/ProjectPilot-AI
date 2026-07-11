using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Dashboard;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DashboardService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<DashboardResponse> GetStudentDashboardAsync(Guid userId)
    {
        var project = await _context.Projects.AsNoTracking()
            .Include(p => p.Milestones)
            .Include(p => p.Documents).ThenInclude(d => d.Uploader)
            .Include(p => p.Tasks)
            .Where(p => p.StudentId == userId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        var notifications = await _context.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .ToListAsync();

        var response = new DashboardResponse();

        if (project != null)
        {
            response.CurrentProject = _mapper.Map<ProjectSummary>(project);
            response.CompletionPercentage = (int)project.CompletionPercentage;
            response.PendingTasks = project.Tasks.Count(t => t.Status != TaskItemStatus.Completed);
            response.CompletedTasks = project.Tasks.Count(t => t.Status == TaskItemStatus.Completed);
            response.UpcomingMilestones = _mapper.Map<List<MilestoneSummary>>(
                project.Milestones.Where(m => !m.IsCompleted).OrderBy(m => m.TargetDate).Take(5));
            response.RecentDocuments = _mapper.Map<List<DocumentSummary>>(
                project.Documents.Where(d => !d.IsDeleted).OrderByDescending(d => d.UploadedAt).Take(5));
        }

        response.Notifications = _mapper.Map<List<Application.DTOs.Notification.NotificationResponse>>(notifications);

        return response;
    }
}
