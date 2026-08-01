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

    public async Task<AdminDashboardResponse> GetDashboardAsync(Guid? collegeId = null)
    {
        var isScoped = collegeId.HasValue;

        var totalUsers = await _context.Set<User>().AsNoTracking()
            .Where(u => !u.IsDeleted && (!isScoped || u.CollegeId == collegeId.Value))
            .CountAsync();

        var totalStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => !s.IsDeleted && (!isScoped || s.User != null && s.User.CollegeId == collegeId.Value))
            .CountAsync();

        var totalGuides = await _context.Set<GuideProfile>().AsNoTracking()
            .Where(g => !g.IsDeleted && (!isScoped || g.User != null && g.User.CollegeId == collegeId.Value))
            .CountAsync();

        var activeGuides = await _context.Set<GuideProfile>().AsNoTracking()
            .Where(g => !g.IsDeleted && g.IsAvailable && (!isScoped || g.User != null && g.User.CollegeId == collegeId.Value))
            .CountAsync();

        var totalHods = await _context.Set<Hod>().AsNoTracking()
            .Where(h => !h.IsDeleted && (!isScoped || h.CollegeId == collegeId.Value))
            .CountAsync();

        var activeHods = await _context.Set<Hod>().AsNoTracking()
            .Where(h => !h.IsDeleted && h.IsActive && h.User.Status == "Active"
                && (!isScoped || h.CollegeId == collegeId.Value))
            .CountAsync();

        var totalCollegeAdmins = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted && u.Role.Name == "CollegeAdmin"
                && (!isScoped || u.CollegeId == collegeId.Value))
            .CountAsync();

        var activeCollegeAdmins = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted && u.Status == "Active" && u.Role.Name == "CollegeAdmin"
                && (!isScoped || u.CollegeId == collegeId.Value))
            .CountAsync();

        var totalColleges = isScoped ? 1
            : await _context.Set<College>().AsNoTracking().CountAsync(c => !c.IsDeleted);

        var totalDepartments = await _context.Set<Department>().AsNoTracking()
            .Where(d => !d.IsDeleted && (!isScoped || d.CollegeId == collegeId.Value))
            .CountAsync();

        var activeAcademicYears = await _context.Set<AcademicYear>().AsNoTracking()
            .CountAsync(ay => !ay.IsDeleted && ay.IsCurrent);

        var recentLogs = await _context.Set<AuditLog>().AsNoTracking()
            .Include(al => al.User)
            .Where(al => !isScoped || al.User != null && al.User.CollegeId == collegeId.Value)
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
            .Where(u => !u.IsDeleted && (!isScoped || u.CollegeId == collegeId.Value))
            .GroupBy(u => u.Role.Name)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        var monthlyActivity = await GetMonthlyActivityAsync(collegeId);

        var departmentStats = await GetDepartmentStatsAsync(collegeId);

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

    private async Task<List<MonthlyActivity>> GetMonthlyActivityAsync(Guid? collegeId = null)
    {
        var isScoped = collegeId.HasValue;
        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-11);
        var start = new DateTime(twelveMonthsAgo.Year, twelveMonthsAgo.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var submissions = await _context.Set<Project>().AsNoTracking()
            .Where(p => !p.IsDeleted && p.CreatedAt >= start
                && (!isScoped || p.Student.CollegeId == collegeId.Value))
            .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var approvals = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Where(a => a.Action == ApprovalAction.Approved && a.CreatedAt >= start
                && (!isScoped || a.Guide != null && a.Guide.CollegeId == collegeId.Value))
            .GroupBy(a => new { a.CreatedAt.Year, a.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var meetings = await _context.Set<Meeting>().AsNoTracking()
            .Where(m => !m.IsDeleted && m.CreatedAt >= start
                && (!isScoped || m.Guide.CollegeId == collegeId.Value))
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

    private async Task<List<DepartmentStat>> GetDepartmentStatsAsync(Guid? collegeId = null)
    {
        var isScoped = collegeId.HasValue;

        var departments = await _context.Set<Department>().AsNoTracking()
            .Where(d => !d.IsDeleted && (!isScoped || d.CollegeId == collegeId.Value))
            .Select(d => new { d.Id, d.DepartmentName })
            .ToListAsync();

        var deptIds = departments.Select(d => d.Id).ToHashSet();
        if (deptIds.Count == 0)
            return new List<DepartmentStat>();

        var studentRoleId = await _context.Set<Role>().AsNoTracking()
            .Where(r => r.Name == "Student")
            .Select(r => r.Id)
            .FirstOrDefaultAsync();

        var studentCounts = await _context.Set<User>().AsNoTracking()
            .Where(u => !u.IsDeleted && u.RoleId == studentRoleId && u.DepartmentId.HasValue
                && deptIds.Contains(u.DepartmentId.Value)
                && (!isScoped || u.CollegeId == collegeId.Value))
            .GroupBy(u => u.DepartmentId!.Value)
            .Select(g => new { DepartmentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.DepartmentId, g => g.Count);

        var completedCounts = await _context.Set<Project>().AsNoTracking()
            .Where(p => !p.IsDeleted && p.Status == ProjectStatus.Completed
                && p.Student.DepartmentId.HasValue
                && deptIds.Contains(p.Student.DepartmentId.Value)
                && (!isScoped || p.Student.CollegeId == collegeId.Value))
            .GroupBy(p => p.Student.DepartmentId!.Value)
            .Select(g => new { DepartmentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.DepartmentId, g => g.Count);

        return departments.Select(d => new DepartmentStat
        {
            Name = d.DepartmentName,
            Students = studentCounts.TryGetValue(d.Id, out var s) ? s : 0,
            Completed = completedCounts.TryGetValue(d.Id, out var c) ? c : 0,
        }).ToList();
    }
}
