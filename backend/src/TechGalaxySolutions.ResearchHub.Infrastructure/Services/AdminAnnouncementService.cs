using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GlobalAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AdminAnnouncementService : IAdminAnnouncementService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AdminAnnouncementService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<GlobalAnnouncementResponse>> GetAnnouncementsAsync()
    {
        var announcements = await _context.Set<GlobalAnnouncement>().AsNoTracking()
            .Include(a => a.CreatedByUser)
            .Where(a => !a.IsDeleted)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<GlobalAnnouncementResponse>>(announcements);
    }

    public async Task<GlobalAnnouncementResponse> GetAnnouncementAsync(Guid id)
    {
        var announcement = await _context.Set<GlobalAnnouncement>().AsNoTracking()
            .Include(a => a.CreatedByUser)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Announcement not found");

        return _mapper.Map<GlobalAnnouncementResponse>(announcement);
    }

    public async Task<GlobalAnnouncementResponse> CreateAnnouncementAsync(Guid userId, CreateGlobalAnnouncementRequest request)
    {
        var userExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Id == userId && !u.IsDeleted);

        if (!userExists)
            throw new KeyNotFoundException("User not found");

        var announcement = new GlobalAnnouncement
        {
            Title = request.Title,
            Content = request.Content,
            Priority = request.Priority,
            Status = "Draft",
            CreatedByUserId = userId,
        };

        _context.Set<GlobalAnnouncement>().Add(announcement);
        await _context.SaveChangesAsync();

        await _context.Entry(announcement).Reference(a => a.CreatedByUser).LoadAsync();

        return _mapper.Map<GlobalAnnouncementResponse>(announcement);
    }

    public async Task<GlobalAnnouncementResponse> UpdateAnnouncementAsync(Guid id, UpdateGlobalAnnouncementRequest request)
    {
        var announcement = await _context.Set<GlobalAnnouncement>()
            .Include(a => a.CreatedByUser)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Announcement not found");

        announcement.Title = request.Title;
        announcement.Content = request.Content;
        announcement.Priority = request.Priority;
        announcement.Status = request.Status;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<GlobalAnnouncementResponse>(announcement);
    }

    public async Task PublishAnnouncementAsync(Guid id)
    {
        var announcement = await _context.Set<GlobalAnnouncement>()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Announcement not found");

        announcement.Status = "Published";
        announcement.PublishedAt = DateTime.UtcNow;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAnnouncementAsync(Guid id)
    {
        var announcement = await _context.Set<GlobalAnnouncement>()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Announcement not found");

        announcement.IsDeleted = true;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
