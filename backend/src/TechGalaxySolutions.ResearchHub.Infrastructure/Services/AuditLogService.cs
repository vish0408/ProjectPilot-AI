using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AuditLogService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AuditLogResponse>> GetAuditLogsAsync()
    {
        var logs = await _context.Set<AuditLog>().AsNoTracking()
            .Include(al => al.User)
            .OrderByDescending(al => al.Timestamp)
            .ToListAsync();

        return _mapper.Map<List<AuditLogResponse>>(logs);
    }

    public async Task<AuditLogResponse> GetAuditLogAsync(Guid id)
    {
        var log = await _context.Set<AuditLog>().AsNoTracking()
            .Include(al => al.User)
            .FirstOrDefaultAsync(al => al.Id == id)
            ?? throw new KeyNotFoundException("Audit log not found");

        return _mapper.Map<AuditLogResponse>(log);
    }
}
