using TechGalaxySolutions.ResearchHub.Application.DTOs.Milestone;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IMilestoneService
{
    Task<List<MilestoneResponse>> GetProjectMilestonesAsync(Guid projectId, Guid userId);
    Task<MilestoneResponse> CreateAsync(Guid projectId, Guid userId, CreateMilestoneRequest request);
    Task<MilestoneResponse> UpdateAsync(Guid milestoneId, Guid userId, UpdateMilestoneRequest request);
    Task DeleteAsync(Guid milestoneId, Guid userId);
}
