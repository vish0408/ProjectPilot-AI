using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchStage;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IResearchStageService
{
    Task<List<ResearchStageResponse>> GetAllAsync();
    Task<ResearchStageResponse> GetByIdAsync(Guid id);
    Task<ResearchStageResponse> CreateAsync(CreateResearchStageRequest request);
    Task<ResearchStageResponse> UpdateAsync(Guid id, UpdateResearchStageRequest request);
    Task DeleteAsync(Guid id);
    Task EnsureProvisionedAsync();
}
