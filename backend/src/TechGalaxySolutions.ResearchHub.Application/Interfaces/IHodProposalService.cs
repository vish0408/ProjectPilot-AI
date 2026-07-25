using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProposal;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodProposalService
{
    Task<List<HodProposalResponse>> GetProposalsAsync(Guid userId, string? status);
    Task<HodProposalResponse> GetProposalDetailAsync(Guid userId, Guid proposalId);
    Task<HodProposalResponse> ReviewProposalAsync(Guid userId, Guid proposalId, ReviewProposalRequest request);
    Task<ProposalCommentItem> AddCommentAsync(Guid userId, Guid proposalId, AddProposalCommentRequest request);
}
