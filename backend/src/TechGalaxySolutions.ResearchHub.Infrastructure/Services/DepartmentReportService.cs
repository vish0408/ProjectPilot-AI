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
        var reports = await _context.Set<DepartmentReport>()
            .Include(r => r.GeneratedByUser)
            .Where(r => !r.IsDeleted)
            .OrderByDescending(r => r.GeneratedAt)
            .ToListAsync();

        return _mapper.Map<List<DepartmentReportResponse>>(reports);
    }

    public async Task<DepartmentReportResponse> GenerateReportAsync(Guid userId, string reportType, string title)
    {
        var deptProfile = await _context.Set<DepartmentProfile>()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted)
            ?? throw new InvalidOperationException("Department profile not found. Set up your HOD profile first.");

        object reportData;

        switch (reportType.ToLower())
        {
            case "student-progress":
                reportData = await GenerateStudentProgressReport();
                break;
            case "guide-performance":
                reportData = await GenerateGuidePerformanceReport();
                break;
            case "department-analytics":
                reportData = await GenerateDepartmentAnalytics();
                break;
            case "project-completion":
                reportData = await GenerateProjectCompletionReport();
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

    private async Task<object> GenerateStudentProgressReport()
    {
        var students = await _context.Set<StudentProfile>()
            .Include(s => s.User)
            .Include(s => s.Guide)
            .Where(s => !s.IsDeleted)
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

    private async Task<object> GenerateGuidePerformanceReport()
    {
        var guides = await _context.Set<GuideProfile>()
            .Include(g => g.User)
            .Where(g => !g.IsDeleted)
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

    private async Task<object> GenerateDepartmentAnalytics()
    {
        var totalStudents = await _context.Set<StudentProfile>().CountAsync(s => !s.IsDeleted);
        var totalGuides = await _context.Set<GuideProfile>().CountAsync(g => !g.IsDeleted);
        var activeProjects = await _context.Projects.CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.InProgress);
        var completedProjects = await _context.Projects.CountAsync(p => !p.IsDeleted && p.Status == ProjectStatus.Completed);

        return new
        {
            ReportType = "Department Analytics",
            GeneratedAt = DateTime.UtcNow,
            Data = new { totalStudents, totalGuides, activeProjects, completedProjects }
        };
    }

    private async Task<object> GenerateProjectCompletionReport()
    {
        var projects = await _context.Projects
            .Include(p => p.Student)
            .Where(p => !p.IsDeleted)
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
