using TechGalaxySolutions.ResearchHub.Application.DTOs.ApprovalHistory;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IApprovalHistoryService
{
    Task<List<ApprovalHistoryResponse>> GetProjectHistoryAsync(Guid userId, Guid projectId);
    Task<List<ApprovalHistoryResponse>> GetChapterHistoryAsync(Guid userId, Guid chapterId);
}
