using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AdminDashboard;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AdminDashboardService : IAdminDashboardService
{
    private readonly ApplicationDbContext _context;

    public AdminDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardResponse> GetDashboardAsync()
    {
        var totalUsers = await _context.Set<User>().AsNoTracking()
            .CountAsync(u => !u.IsDeleted);

        var totalStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .CountAsync(s => !s.IsDeleted);

        var totalGuides = await _context.Set<GuideProfile>().AsNoTracking()
            .CountAsync(g => !g.IsDeleted);

        var totalHods = await _context.Set<DepartmentProfile>().AsNoTracking()
            .CountAsync(dp => !dp.IsDeleted && dp.HodUserId != null);

        var totalColleges = await _context.Set<College>().AsNoTracking()
            .CountAsync(c => !c.IsDeleted);

        var totalDepartments = await _context.Set<Department>().AsNoTracking()
            .CountAsync(d => !d.IsDeleted);

        var activeAcademicYears = await _context.Set<AcademicYear>().AsNoTracking()
            .CountAsync(ay => !ay.IsDeleted && ay.IsCurrent);

        var recentLogs = await _context.Set<AuditLog>().AsNoTracking()
            .Include(al => al.User)
            .OrderByDescending(al => al.Timestamp)
            .Take(10)
            .Select(al => new AuditLogSummary
            {
                Id = al.Id,
                UserName = al.User != null ? al.User.FullName : "System",
                Action = al.Action,
                EntityName = al.EntityName,
                Timestamp = al.Timestamp,
            })
            .ToListAsync();

        var usersByRole = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .GroupBy(u => u.Role.Name)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        return new AdminDashboardResponse
        {
            TotalUsers = totalUsers,
            TotalStudents = totalStudents,
            TotalGuides = totalGuides,
            TotalHods = totalHods,
            TotalColleges = totalColleges,
            TotalDepartments = totalDepartments,
            ActiveAcademicYears = activeAcademicYears,
            RecentLogs = recentLogs,
            UsersByRole = usersByRole,
        };
    }
}
