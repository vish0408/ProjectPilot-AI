using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public NotificationService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<NotificationResponse>> GetMyNotificationsAsync(Guid userId)
    {
        var notifications = await _context.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return _mapper.Map<List<NotificationResponse>>(notifications);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications.AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead && !n.IsDeleted);
    }

    public async Task MarkAsReadAsync(Guid userId, MarkReadRequest request)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && request.NotificationIds.Contains(n.Id) && !n.IsDeleted)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead && !n.IsDeleted)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }
}
