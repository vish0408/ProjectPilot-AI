using System.Text.Json;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentReport;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class DepartmentReportService : IDepartmentReportService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DepartmentReportService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DepartmentReportResponse>> GetReportsAsync(Guid userId)
    {
        var deptProfile = await GetDepartmentProfileAsync(userId);

        var reports = await _context.Set<DepartmentReport>().AsNoTracking()
            .Include(r => r.GeneratedByUser)
            .Where(r => !r.IsDeleted && r.DepartmentProfileId == deptProfile.Id)
            .OrderByDescending(r => r.GeneratedAt)
            .ToListAsync();

        return _mapper.Map<List<DepartmentReportResponse>>(reports);
    }

    private async Task<DepartmentProfile> GetDepartmentProfileAsync(Guid userId)
    {
        var deptProfile = await _context.Set<DepartmentProfile>().AsNoTracking()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted)
            ?? throw new InvalidOperationException("Department profile not found. Set up your HOD profile first.");

        return deptProfile;
    }

    public async Task<DepartmentReportResponse> GenerateReportAsync(Guid userId, string reportType, string title)
    {
        var deptProfile = await GetDepartmentProfileAsync(userId);

        var scope = await GetScopeAsync(userId);

        object reportData;

        switch (reportType.ToLower())
        {
            case "student-progress":
                reportData = await GenerateStudentProgressReport(scope);
                break;
            case "guide-performance":
                reportData = await GenerateGuidePerformanceReport(scope);
                break;
            case "department-analytics":
                reportData = await GenerateDepartmentAnalytics(scope);
                break;
            case "project-completion":
                reportData = await GenerateProjectCompletionReport(scope);
                break;
            default:
                throw new ArgumentException($"Unknown report type: {reportType}");
        }

        var report = new DepartmentReport
        {
            DepartmentProfileId = deptProfile.Id,
            Title = title,
            ReportType = reportType,
            Data = JsonSerializer.Serialize(reportData),
            GeneratedByUserId = userId,
        };

        _context.Set<DepartmentReport>().Add(report);
        await _context.SaveChangesAsync();

        report.GeneratedByUser = (await _context.Users.FindAsync(userId))!;

        return _mapper.Map<DepartmentReportResponse>(report);
    }

    private async Task<ReportScope> GetScopeAsync(Guid userId)
    {
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        return new ReportScope(hod.CollegeId, hod.DepartmentId);
    }

    private sealed record ReportScope(Guid CollegeId, Guid DepartmentId);

    private async Task<object> GenerateStudentProgressReport(ReportScope scope)
    {
        var students = await _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.Guide)
            .Where(s => !s.IsDeleted
                && s.User.CollegeId == scope.CollegeId
                && s.User.DepartmentId == scope.DepartmentId)
            .Select(s => new
            {
                StudentName = s.User.FullName,
                s.Enrollment,
                s.Department,
                GuideName = s.Guide != null ? s.Guide.FullName : null,
                s.ResearchTopic,
            })
            .ToListAsync();

        return new { ReportType = "Student Progress", GeneratedAt = DateTime.UtcNow, Data = students };
    }

    private async Task<object> GenerateGuidePerformanceReport(ReportScope scope)
    {
        var guides = await _context.Set<GuideProfile>().AsNoTracking()
            .Include(g => g.User)
            .Where(g => !g.IsDeleted
                && g.User.CollegeId == scope.CollegeId
                && g.User.DepartmentId == scope.DepartmentId)
            .Select(g => new
            {
                GuideName = g.User.FullName,
                g.Department,
                g.Specialization,
                g.Designation,
                AssignedStudents = _context.Set<StudentProfile>().Count(s => s.GuideId == g.UserId && !s.IsDeleted),
            })
            .ToListAsync();

        return new { ReportType = "Guide Performance", GeneratedAt = DateTime.UtcNow, Data = guides };
    }

    private async Task<object> GenerateDepartmentAnalytics(ReportScope scope)
    {
        var totalStudents = await _context.Set<StudentProfile>().AsNoTracking()
            .CountAsync(s => !s.IsDeleted && s.User.CollegeId == scope.CollegeId && s.User.DepartmentId == scope.DepartmentId);
        var totalGuides = await _context.Set<GuideProfile>().AsNoTracking()
            .CountAsync(g => !g.IsDeleted && g.User.CollegeId == scope.CollegeId && g.User.DepartmentId == scope.DepartmentId);
        var activeProjects = await _context.Projects.AsNoTracking()
            .Include(p => p.Student)
            .CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.InProgress
                && p.Student.CollegeId == scope.CollegeId && p.Student.DepartmentId == scope.DepartmentId);
        var completedProjects = await _context.Projects.AsNoTracking()
            .Include(p => p.Student)
            .CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.Completed
                && p.Student.CollegeId == scope.CollegeId && p.Student.DepartmentId == scope.DepartmentId);

        return new
        {
            ReportType = "Department Analytics",
            GeneratedAt = DateTime.UtcNow,
            Data = new { totalStudents, totalGuides, activeProjects, completedProjects }
        };
    }

    private async Task<object> GenerateProjectCompletionReport(ReportScope scope)
    {
        var projects = await _context.Projects.AsNoTracking()
            .Include(p => p.Student)
            .Where(p => !p.IsDeleted
                && p.Student.CollegeId == scope.CollegeId
                && p.Student.DepartmentId == scope.DepartmentId)
            .Select(p => new
            {
                ProjectTitle = p.Title,
                StudentName = p.Student.FullName,
                Status = p.Status.ToString(),
                p.CompletionPercentage,
                p.StartDate,
            })
            .ToListAsync();

        return new { ReportType = "Project Completion", GeneratedAt = DateTime.UtcNow, Data = projects };
    }
}
