using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodGuideService : IHodGuideService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodGuideService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<GuideSummaryResponse>> GetGuidesAsync(Guid userId)
    {
        var guides = await _context.Set<GuideProfile>()
            .Include(g => g.User)
            .Where(g => !g.IsDeleted)
            .ToListAsync();

        var result = new List<GuideSummaryResponse>();
        foreach (var guide in guides)
        {
            var assignedCount = await _context.Set<StudentProfile>()
                .CountAsync(s => s.GuideId == guide.UserId && !s.IsDeleted);

            var completedCount = await _context.Projects
                .CountAsync(p => p.StudentId == guide.UserId && !p.IsDeleted && p.Status == ProjectStatus.Completed);

            result.Add(new GuideSummaryResponse
            {
                UserId = guide.UserId,
                FullName = guide.User.FullName,
                Email = guide.User.Email,
                Department = guide.Department,
                Specialization = guide.Specialization,
                Designation = guide.Designation,
                IsAvailable = guide.IsAvailable,
                AssignedStudents = assignedCount,
                CompletedProjects = completedCount,
            });
        }

        return result;
    }

    public async Task AssignGuideAsync(Guid userId, AssignGuideRequest request)
    {
        var studentProfile = await _context.Set<StudentProfile>()
            .FirstOrDefaultAsync(s => s.UserId == request.StudentId && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Student not found");

        var guideUser = await _context.Users.FindAsync(request.GuideId)
            ?? throw new KeyNotFoundException("Guide not found");

        // Create allocation record
        var allocation = new ProjectAllocation
        {
            StudentId = request.StudentId,
            GuideId = request.GuideId,
            AllocatedByUserId = userId,
            Remarks = request.Remarks,
            Status = AllocationStatus.Active,
        };
        _context.Set<ProjectAllocation>().Add(allocation);

        // Update student's guide
        studentProfile.GuideId = request.GuideId;
        studentProfile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
