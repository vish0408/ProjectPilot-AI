using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IResearchTopicService
{
    Task<List<ResearchTopicResponse>> GetTopicsAsync(Guid userId, string role, Guid? categoryId, string? search, Guid? departmentId);
    Task<ResearchTopicResponse> CreateTopicAsync(Guid userId, string role, CreateResearchTopicRequest request);
    Task<ResearchTopicResponse> UpdateTopicAsync(Guid id, Guid userId, string role, UpdateResearchTopicRequest request);
    Task DeleteTopicAsync(Guid id, Guid userId, string role);
}
