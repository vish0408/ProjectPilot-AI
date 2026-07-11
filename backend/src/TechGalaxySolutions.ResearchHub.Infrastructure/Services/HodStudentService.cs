using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodStudentService : IHodStudentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodStudentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<StudentSummaryResponse>> GetStudentsAsync(Guid userId, string? search, string? sortBy, string? filterStatus)
    {
        var query = _context.Set<StudentProfile>().AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.Guide)
            .Where(s => !s.IsDeleted);

        if (!string.IsNullOrEmpty(search))
        {
            var term = search.ToLower();
            query = query.Where(s => s.User.FullName.ToLower().Contains(term)
                || s.User.Email.ToLower().Contains(term)
                || s.Enrollment.Contains(term));
        }

        var students = await query.OrderByDescending(s => s.CreatedAt).ToListAsync();

        var studentIds = students.Select(s => s.UserId).ToList();
        var studentProjects = await _context.Set<Project>().AsNoTracking()
            .Where(p => studentIds.Contains(p.StudentId) && !p.IsDeleted)
            .ToListAsync();
        var projectLookup = studentProjects.ToLookup(p => p.StudentId);

        var result = new List<StudentSummaryResponse>();
        foreach (var student in students)
        {
            var project = projectLookup[student.UserId].FirstOrDefault();

            result.Add(new StudentSummaryResponse
            {
                UserId = student.UserId,
                FullName = student.User.FullName,
                Email = student.User.Email,
                Enrollment = student.Enrollment,
                Department = student.Department,
                ResearchTopic = student.ResearchTopic ?? "",
                GuideName = student.Guide?.FullName,
                GuideId = student.GuideId,
                ProjectTitle = project?.Title,
                ProjectStatus = project?.Status.ToString(),
                CompletionPercentage = project?.CompletionPercentage ?? 0,
                CreatedAt = student.CreatedAt,
            });
        }

        return result;
    }
}
