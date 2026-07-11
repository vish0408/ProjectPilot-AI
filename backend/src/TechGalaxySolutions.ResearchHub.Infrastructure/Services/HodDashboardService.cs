using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodDashboardService : IHodDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodDashboardService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<HodDashboardResponse> GetDashboardAsync(Guid userId)
    {
        var department = await _context.Set<DepartmentProfile>()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted);

        var totalStudents = await _context.Set<StudentProfile>().CountAsync(s => !s.IsDeleted);
        var totalGuides = await _context.Set<GuideProfile>().CountAsync(g => !g.IsDeleted);
        var activeProjects = await _context.Projects.CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.InProgress);
        var completedProjects = await _context.Projects.CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.Completed);
        var pendingReviews = await _context.Set<Review>().CountAsync(r => !r.IsDeleted && r.Status == ReviewStatus.Pending);

        var announcements = department != null
            ? await _context.Set<DepartmentAnnouncement>()
                .Include(a => a.CreatedByUser)
                .Where(a => a.DepartmentProfileId == department.Id && !a.IsDeleted && a.Status == AnnouncementStatus.Published)
                .OrderByDescending(a => a.PublishedAt)
                .Take(5)
                .ToListAsync()
            : new List<DepartmentAnnouncement>();

        var totalTopics = await _context.Set<ResearchTopic>().CountAsync(t => !t.IsDeleted);
        var activeTopics = await _context.Set<ResearchTopic>().CountAsync(t => !t.IsDeleted && t.IsActive);
        var totalCategories = await _context.Set<ResearchCategory>().CountAsync(c => !c.IsDeleted);
        var allocatedProjects = await _context.Set<ProjectAllocation>().CountAsync(a => !a.IsDeleted && a.Status == AllocationStatus.Active);

        var recentNotifications = await _context.Set<Domain.Entities.Notification>()
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .ToListAsync();

        return new HodDashboardResponse
        {
            TotalStudents = totalStudents,
            TotalGuides = totalGuides,
            ActiveProjects = activeProjects,
            CompletedProjects = completedProjects,
            PendingReviews = pendingReviews,
            Announcements = _mapper.Map<List<DepartmentAnnouncementResponse>>(announcements),
            ResearchStats = new ResearchStatistics
            {
                TotalResearchTopics = totalTopics,
                ActiveTopics = activeTopics,
                TotalCategories = totalCategories,
                AllocatedProjects = allocatedProjects,
            },
            RecentNotifications = _mapper.Map<List<NotificationResponse>>(recentNotifications),
        };
    }
}
