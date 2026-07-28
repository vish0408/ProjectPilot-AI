using TechGalaxySolutions.ResearchHub.Application.DTOs.College;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ICollegeService
{
    Task<PagedResponse<CollegeResponse>> GetCollegesAsync(PagedRequest request);
    Task<List<CollegeResponse>> GetAllCollegesAsync();
    Task<CollegeResponse> GetCollegeAsync(Guid id);
    Task<CollegeResponse> CreateCollegeAsync(CreateCollegeRequest request);
    Task<CollegeResponse> UpdateCollegeAsync(Guid id, UpdateCollegeRequest request);
    Task DeleteCollegeAsync(Guid id);
    Task<List<CollegeAnalyticsResponse>> GetCollegeAnalyticsAsync();
}
