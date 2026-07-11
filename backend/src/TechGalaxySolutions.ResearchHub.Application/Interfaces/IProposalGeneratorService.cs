using TechGalaxySolutions.ResearchHub.Application.DTOs.Proposal;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IProposalGeneratorService
{
    Task<List<ProposalTemplateResponse>> GetTemplatesAsync();

    Task<ProposalResponse> GenerateAsync(Guid studentId, GenerateProposalRequest request);

    Task<ProposalResponse> ImproveSectionAsync(Guid userId, ImproveProposalRequest request);

    Task<ProposalResponse> RegenerateSectionAsync(Guid userId, RegenerateSectionRequest request);

    Task<ProposalResponse> SaveAsync(Guid studentId, SaveProposalRequest request);

    Task<ProposalResponse> GetByIdAsync(Guid id, Guid userId);

    Task<List<ProposalResponse>> GetByStudentIdAsync(Guid studentId);

    Task<ProposalResponse> UpdateAsync(Guid id, Guid userId, SaveProposalRequest request);

    Task DeleteAsync(Guid id, Guid userId);
}
