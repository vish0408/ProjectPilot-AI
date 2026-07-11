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
        var allocations = await _context.Set<ProjectAllocation>()
            .Include(a => a.Student)
            .Include(a => a.Guide)
            .Include(a => a.Project)
            .Include(a => a.AllocatedByUser)
            .Where(a => !a.IsDeleted)
            .OrderByDescending(a => a.AllocatedAt)
            .ToListAsync();

        return _mapper.Map<List<ProjectAllocationResponse>>(allocations);
    }

    public async Task<ProjectAllocationResponse> CreateAllocationAsync(Guid userId, CreateAllocationRequest request)
    {
        var allocation = new ProjectAllocation
        {
            StudentId = request.StudentId,
            GuideId = request.GuideId,
            ProjectId = request.ProjectId,
            AllocatedByUserId = userId,
            Remarks = request.Remarks,
        };

        _context.Set<ProjectAllocation>().Add(allocation);
        await _context.SaveChangesAsync();

        var saved = await _context.Set<ProjectAllocation>()
            .Include(a => a.Student)
            .Include(a => a.Guide)
            .Include(a => a.Project)
            .Include(a => a.AllocatedByUser)
            .FirstAsync(a => a.Id == allocation.Id);

        return _mapper.Map<ProjectAllocationResponse>(saved);
    }

    public async Task RevokeAllocationAsync(Guid allocationId, Guid userId)
    {
        var allocation = await _context.Set<ProjectAllocation>()
            .FirstOrDefaultAsync(a => a.Id == allocationId && !a.IsDeleted)
            ?? throw new KeyNotFoundException("Allocation not found");

        allocation.Status = AllocationStatus.Revoked;
        allocation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
