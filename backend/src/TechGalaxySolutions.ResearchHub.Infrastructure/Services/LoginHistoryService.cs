using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class LoginHistoryService : ILoginHistoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public LoginHistoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task RecordLoginAsync(Guid userId, bool isSuccess, string? ipAddress = null, string? userAgent = null, string? failureReason = null, string? roleName = null)
    {
        var (browser, os) = ParseUserAgent(userAgent);

        var entry = new LoginHistory
        {
            UserId = userId,
            LoginTime = DateTime.UtcNow,
            IpAddress = ipAddress,
            Browser = browser,
            OperatingSystem = os,
            UserAgent = userAgent,
            IsSuccess = isSuccess,
            FailureReason = failureReason,
            RoleName = roleName,
        };

        _context.Set<LoginHistory>().Add(entry);
        await _context.SaveChangesAsync();
    }

    public async Task RecordLogoutAsync(Guid userId, string? ipAddress = null)
    {
        var latest = await _context.Set<LoginHistory>()
            .Where(lh => lh.UserId == userId && lh.IsSuccess && lh.LogoutTime == null)
            .OrderByDescending(lh => lh.LoginTime)
            .FirstOrDefaultAsync();

        if (latest != null)
        {
            latest.LogoutTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<LoginHistoryResponse>> GetUserLoginHistoryAsync(Guid userId, int count = 20)
    {
        var entries = await _context.Set<LoginHistory>().AsNoTracking()
            .Where(lh => lh.UserId == userId)
            .OrderByDescending(lh => lh.LoginTime)
            .Take(count)
            .ToListAsync();

        return _mapper.Map<List<LoginHistoryResponse>>(entries);
    }

    private static (string? Browser, string? OS) ParseUserAgent(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
            return (null, null);

        var browser = "Unknown";
        var os = "Unknown";

        if (userAgent.Contains("Edg", StringComparison.OrdinalIgnoreCase)) browser = "Edge";
        else if (userAgent.Contains("Chrome", StringComparison.OrdinalIgnoreCase)) browser = "Chrome";
        else if (userAgent.Contains("Firefox", StringComparison.OrdinalIgnoreCase)) browser = "Firefox";
        else if (userAgent.Contains("Safari", StringComparison.OrdinalIgnoreCase)) browser = "Safari";
        else if (userAgent.Contains("MSIE", StringComparison.OrdinalIgnoreCase) || userAgent.Contains("Trident", StringComparison.OrdinalIgnoreCase)) browser = "Internet Explorer";

        if (userAgent.Contains("Windows", StringComparison.OrdinalIgnoreCase)) os = "Windows";
        else if (userAgent.Contains("Mac", StringComparison.OrdinalIgnoreCase)) os = "macOS";
        else if (userAgent.Contains("Linux", StringComparison.OrdinalIgnoreCase)) os = "Linux";
        else if (userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase)) os = "Android";
        else if (userAgent.Contains("iOS", StringComparison.OrdinalIgnoreCase) || userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase)) os = "iOS";

        return (browser, os);
    }
}
