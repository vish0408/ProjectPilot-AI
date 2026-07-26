using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AdminDashboard;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
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

        var activeGuides = await _context.Set<GuideProfile>().AsNoTracking()
            .CountAsync(g => !g.IsDeleted && g.IsAvailable);

        var totalHods = await _context.Set<Hod>().AsNoTracking()
            .CountAsync(h => !h.IsDeleted);

        var activeHods = await _context.Set<Hod>().AsNoTracking()
            .CountAsync(h => !h.IsDeleted && h.IsActive);

        var totalCollegeAdmins = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .CountAsync(u => !u.IsDeleted && u.Role.Name == "CollegeAdmin");

        var activeCollegeAdmins = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .CountAsync(u => !u.IsDeleted && u.IsActive && u.Role.Name == "CollegeAdmin");

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

        var monthlyActivity = await GetMonthlyActivityAsync();

        var departmentStats = await GetDepartmentStatsAsync();

        return new AdminDashboardResponse
        {
            TotalUsers = totalUsers,
            TotalStudents = totalStudents,
            TotalGuides = totalGuides,
            ActiveGuides = activeGuides,
            TotalHods = totalHods,
            ActiveHods = activeHods,
            TotalCollegeAdmins = totalCollegeAdmins,
            ActiveCollegeAdmins = activeCollegeAdmins,
            TotalColleges = totalColleges,
            TotalDepartments = totalDepartments,
            ActiveAcademicYears = activeAcademicYears,
            RecentLogs = recentLogs,
            UsersByRole = usersByRole,
            MonthlyActivity = monthlyActivity,
            DepartmentStats = departmentStats,
        };
    }

    private async Task<List<MonthlyActivity>> GetMonthlyActivityAsync()
    {
        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-11);
        var start = new DateTime(twelveMonthsAgo.Year, twelveMonthsAgo.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var submissions = await _context.Set<Project>().AsNoTracking()
            .Where(p => !p.IsDeleted && p.CreatedAt >= start)
            .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var approvals = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Where(a => a.Action == ApprovalAction.Approved && a.CreatedAt >= start)
            .GroupBy(a => new { a.CreatedAt.Year, a.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var meetings = await _context.Set<Meeting>().AsNoTracking()
            .Where(m => !m.IsDeleted && m.CreatedAt >= start)
            .GroupBy(m => new { m.CreatedAt.Year, m.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var months = new List<MonthlyActivity>();
        for (var d = start; d <= DateTime.UtcNow; d = d.AddMonths(1))
        {
            var label = d.ToString("MMM yyyy");
            months.Add(new MonthlyActivity
            {
                Month = label,
                Submissions = submissions.FirstOrDefault(s => s.Year == d.Year && s.Month == d.Month)?.Count ?? 0,
                Approvals = approvals.FirstOrDefault(a => a.Year == d.Year && a.Month == d.Month)?.Count ?? 0,
                Meetings = meetings.FirstOrDefault(m => m.Year == d.Year && m.Month == d.Month)?.Count ?? 0,
            });
        }

        return months;
    }

    private async Task<List<DepartmentStat>> GetDepartmentStatsAsync()
    {
        var departments = await _context.Set<Department>().AsNoTracking()
            .Where(d => !d.IsDeleted)
            .Select(d => new { d.Id, d.DepartmentName })
            .ToListAsync();

        var studentCounts = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => !s.IsDeleted && s.Department != null)
            .GroupBy(s => s.Department)
            .Select(g => new { DepartmentName = g.Key, Count = g.Count() })
            .ToListAsync();

        var completedCounts = await _context.Set<Project>().AsNoTracking()
            .Where(p => !p.IsDeleted && p.Status == ProjectStatus.Completed)
            .GroupBy(p => p.Student.Department)
            .Select(g => new { DepartmentName = g.Key, Count = g.Count() })
            .ToListAsync();

        return departments.Select(d => new DepartmentStat
        {
            Name = d.DepartmentName,
            Students = studentCounts.FirstOrDefault(s => s.DepartmentName == d.DepartmentName)?.Count ?? 0,
            Completed = completedCounts.FirstOrDefault(c => c.DepartmentName == d.DepartmentName)?.Count ?? 0,
        }).ToList();
    }
}
