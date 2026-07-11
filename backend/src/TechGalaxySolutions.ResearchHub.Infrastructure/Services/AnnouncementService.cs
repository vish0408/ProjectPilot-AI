using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AnnouncementService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DepartmentAnnouncementResponse>> GetAnnouncementsAsync(Guid userId)
    {
        var department = await _context.Set<DepartmentProfile>()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted);

        if (department == null) return new List<DepartmentAnnouncementResponse>();

        var announcements = await _context.Set<DepartmentAnnouncement>()
            .Include(a => a.CreatedByUser)
            .Where(a => a.DepartmentProfileId == department.Id && !a.IsDeleted)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<DepartmentAnnouncementResponse>>(announcements);
    }

    public async Task<DepartmentAnnouncementResponse> CreateAnnouncementAsync(Guid userId, CreateAnnouncementRequest request)
    {
        var department = await _context.Set<DepartmentProfile>()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department profile not found. Set up your profile first.");

        var announcement = new DepartmentAnnouncement
        {
            DepartmentProfileId = department.Id,
            Title = request.Title,
            Content = request.Content,
            Priority = Enum.Parse<AnnouncementPriority>(request.Priority),
            Status = request.ScheduledAt.HasValue ? AnnouncementStatus.Scheduled : AnnouncementStatus.Draft,
            ScheduledAt = request.ScheduledAt,
            ExpiresAt = request.ExpiresAt,
            CreatedByUserId = userId,
        };

        _context.Set<DepartmentAnnouncement>().Add(announcement);
        await _context.SaveChangesAsync();

        announcement.CreatedByUser = (await _context.Users.FindAsync(userId))!;

        return _mapper.Map<DepartmentAnnouncementResponse>(announcement);
    }

    public async Task<DepartmentAnnouncementResponse> UpdateAnnouncementAsync(Guid id, Guid userId, UpdateAnnouncementRequest request)
    {
        var announcement = await _context.Set<DepartmentAnnouncement>()
            .Include(a => a.CreatedByUser)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Announcement not found");

        announcement.Title = request.Title;
        announcement.Content = request.Content;
        announcement.Priority = Enum.Parse<AnnouncementPriority>(request.Priority);
        announcement.Status = Enum.Parse<AnnouncementStatus>(request.Status);
        announcement.ScheduledAt = request.ScheduledAt;
        announcement.ExpiresAt = request.ExpiresAt;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<DepartmentAnnouncementResponse>(announcement);
    }

    public async Task PublishAnnouncementAsync(Guid id, Guid userId)
    {
        var announcement = await _context.Set<DepartmentAnnouncement>()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Announcement not found");

        announcement.Status = AnnouncementStatus.Published;
        announcement.PublishedAt = DateTime.UtcNow;
        announcement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task ExpireAnnouncementAsync(Guid id, Guid userId)
    {
        var announcement = await _context.Set<DepartmentAnnouncement>()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Announcement not found");

        announcement.Status = AnnouncementStatus.Expired;
        announcement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
