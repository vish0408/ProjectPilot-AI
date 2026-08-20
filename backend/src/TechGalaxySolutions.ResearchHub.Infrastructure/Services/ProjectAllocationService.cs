using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ProjectAllocation;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ProjectAllocationService : IProjectAllocationService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProjectAllocationService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProjectAllocationResponse>> GetAllocationsAsync(Guid userId)
    {
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var allocations = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Include(a => a.Student)
            .Include(a => a.Guide)
            .Include(a => a.Project)
            .Include(a => a.AllocatedByUser)
            .Where(a => !a.IsDeleted
                && a.Student.CollegeId == hod.CollegeId
                && a.Student.DepartmentId == hod.DepartmentId)
            .OrderByDescending(a => a.AllocatedAt)
            .ToListAsync();

        return _mapper.Map<List<ProjectAllocationResponse>>(allocations);
    }

    public async Task<ProjectAllocationResponse> CreateAllocationAsync(Guid userId, CreateAllocationRequest request)
    {
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var studentUser = await _context.Users.AsNoTracking()
            .Where(u => u.Id == request.StudentId && !u.IsDeleted)
            .Select(u => new { u.Id, u.CollegeId, u.DepartmentId })
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Student not found");

        if (studentUser.CollegeId != hod.CollegeId || studentUser.DepartmentId != hod.DepartmentId)
            throw new UnauthorizedAccessException("You are not allowed to allocate students outside your department");

        var guideUser = await _context.Users.AsNoTracking()
            .Where(u => u.Id == request.GuideId && !u.IsDeleted)
            .Select(u => new { u.Id, u.CollegeId, u.DepartmentId })
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Guide not found");

        if (guideUser.CollegeId != hod.CollegeId || guideUser.DepartmentId != hod.DepartmentId)
            throw new UnauthorizedAccessException("You are not allowed to allocate guides outside your department");

        var existingActive = await _context.Set<ProjectAllocation>()
            .Where(a => a.StudentId == request.StudentId && !a.IsDeleted && a.Status == AllocationStatus.Active)
            .ToListAsync();
        foreach (var old in existingActive)
        {
            old.Status = AllocationStatus.Changed;
            old.UpdatedAt = DateTime.UtcNow;
        }

        var studentProfile = await _context.Set<StudentProfile>()
            .FirstOrDefaultAsync(s => s.UserId == request.StudentId && !s.IsDeleted);

        var allocation = new ProjectAllocation
        {
            StudentId = request.StudentId,
            GuideId = request.GuideId,
            ProjectId = request.ProjectId,
            AllocatedByUserId = userId,
            Remarks = request.Remarks,
            Status = AllocationStatus.Active,
        };

        _context.Set<ProjectAllocation>().Add(allocation);

        if (studentProfile != null)
        {
            studentProfile.GuideId = request.GuideId;
            studentProfile.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var saved = await _context.Set<ProjectAllocation>().AsNoTracking()
            .Include(a => a.Student)
            .Include(a => a.Guide)
            .Include(a => a.Project)
            .Include(a => a.AllocatedByUser)
            .FirstAsync(a => a.Id == allocation.Id);

        return _mapper.Map<ProjectAllocationResponse>(saved);
    }

    public async Task RevokeAllocationAsync(Guid allocationId, Guid userId)
    {
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted)
            ?? throw new UnauthorizedAccessException("HOD profile not found");

        var allocation = await _context.Set<ProjectAllocation>()
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.Id == allocationId && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Allocation not found");

        if (allocation.Student.CollegeId != hod.CollegeId || allocation.Student.DepartmentId != hod.DepartmentId)
            throw new UnauthorizedAccessException("You are not allowed to revoke allocations outside your department");

        allocation.Status = AllocationStatus.Revoked;
        allocation.UpdatedAt = DateTime.UtcNow;

        var hasOtherActive = await _context.Set<ProjectAllocation>().AsNoTracking()
            .AnyAsync(a => a.StudentId == allocation.StudentId
                && a.Id != allocation.Id
                && !a.IsDeleted
                && a.Status == AllocationStatus.Active);

        if (!hasOtherActive)
        {
            var studentProfile = await _context.Set<StudentProfile>()
                .FirstOrDefaultAsync(s => s.UserId == allocation.StudentId && !s.IsDeleted);
            if (studentProfile != null && studentProfile.GuideId == allocation.GuideId)
            {
                studentProfile.GuideId = null;
                studentProfile.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
    }
}
