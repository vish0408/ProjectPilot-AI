using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(ApplicationDbContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetClientIpAddress()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return "Unknown";

        var headers = httpContext.Request.Headers;

        var forwardedFor = headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var ip = forwardedFor.Split(',')[0].Trim();
            if (!string.IsNullOrWhiteSpace(ip))
                return NormalizeIp(ip);
        }

        var realIp = headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(realIp))
            return NormalizeIp(realIp);

        var remoteIp = httpContext.Connection.RemoteIpAddress;
        if (remoteIp != null)
            return NormalizeIp(remoteIp.ToString());

        return "Unknown";
    }

    private static string NormalizeIp(string ip)
    {
        if (ip == "::1") return "127.0.0.1";
        return ip;
    }

    private string? GetUserAgent()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return null;
        return httpContext.Request.Headers["User-Agent"].FirstOrDefault();
    }

    public async Task<List<AuditLogResponse>> GetAllAuditLogsAsync()
    {
        var logs = await _context.Set<AuditLog>().AsNoTracking()
            .Include(al => al.User)
            .OrderByDescending(al => al.Timestamp)
            .ToListAsync();

        return _mapper.Map<List<AuditLogResponse>>(logs);
    }

    public async Task<PagedResponse<AuditLogResponse>> GetAuditLogsAsync(PagedRequest request)
    {
        IQueryable<AuditLog> query = _context.Set<AuditLog>().AsNoTracking()
            .Include(al => al.User);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(al =>
                al.Action.ToLower().Contains(term) ||
                (al.User != null && al.User.FullName.ToLower().Contains(term)) ||
                al.EntityName.ToLower().Contains(term) ||
                al.IpAddress.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(request.StatusFilter))
        {
            var actionTerm = request.StatusFilter.ToLower();
            query = query.Where(al => al.Action.ToLower() == actionTerm);
        }

        query = request.SortDirection == "desc"
            ? query.OrderByDescending(al => al.Timestamp)
            : query.OrderBy(al => al.Timestamp);

        var totalCount = await query.CountAsync();
        var logs = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var items = _mapper.Map<List<AuditLogResponse>>(logs);
        return new PagedResponse<AuditLogResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<AuditLogResponse> GetAuditLogAsync(Guid id)
    {
        var log = await _context.Set<AuditLog>().AsNoTracking()
            .Include(al => al.User)
            .FirstOrDefaultAsync(al => al.Id == id)
            ?? throw new KeyNotFoundException("Audit log not found");

        return _mapper.Map<AuditLogResponse>(log);
    }

    public async Task LogAsync(Guid userId, string action, string entityType, string entityId, string? previousState, string? newState)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityType,
            EntityId = entityId,
            OldValues = previousState ?? string.Empty,
            NewValues = newState ?? string.Empty,
            IpAddress = GetClientIpAddress(),
            UserAgent = GetUserAgent(),
            Timestamp = DateTime.UtcNow,
        };

        _context.Set<AuditLog>().Add(log);
        await _context.SaveChangesAsync();
    }
}
