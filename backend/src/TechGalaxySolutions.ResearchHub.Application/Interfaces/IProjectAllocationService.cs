using TechGalaxySolutions.ResearchHub.Application.DTOs.ProjectAllocation;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IProjectAllocationService
{
    Task<List<ProjectAllocationResponse>> GetAllocationsAsync(Guid userId);
    Task<ProjectAllocationResponse> CreateAllocationAsync(Guid userId, CreateAllocationRequest request);
    Task RevokeAllocationAsync(Guid allocationId, Guid userId);
}
