using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IResearchTopicService
{
    Task<List<ResearchTopicResponse>> GetTopicsAsync(Guid? categoryId);
    Task<ResearchTopicResponse> CreateTopicAsync(Guid userId, CreateResearchTopicRequest request);
    Task<ResearchTopicResponse> UpdateTopicAsync(Guid id, UpdateResearchTopicRequest request);
}
