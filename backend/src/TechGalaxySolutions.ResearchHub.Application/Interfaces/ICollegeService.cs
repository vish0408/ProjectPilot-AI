using TechGalaxySolutions.ResearchHub.Application.DTOs.College;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ICollegeService
{
    Task<List<CollegeResponse>> GetCollegesAsync();
    Task<CollegeResponse> GetCollegeAsync(Guid id);
    Task<CollegeResponse> CreateCollegeAsync(CreateCollegeRequest request);
    Task<CollegeResponse> UpdateCollegeAsync(Guid id, UpdateCollegeRequest request);
    Task DeleteCollegeAsync(Guid id);
}
