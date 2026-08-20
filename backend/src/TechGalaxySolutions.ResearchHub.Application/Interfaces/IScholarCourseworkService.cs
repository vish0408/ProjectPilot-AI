using TechGalaxySolutions.ResearchHub.Application.DTOs.Coursework;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IScholarCourseworkService
{
    Task<List<CourseworkResponse>> GetCourseworkAsync(Guid studentUserId, Guid currentUserId, string role, Guid? collegeId);
    Task<CourseworkResponse> GetCourseworkItemAsync(Guid studentUserId, Guid courseworkId, Guid currentUserId, string role, Guid? collegeId);
    Task<CourseworkResponse> CreateAsync(Guid studentUserId, CreateCourseworkRequest request, Guid currentUserId, string role, Guid? collegeId);
    Task<CourseworkResponse> UpdateAsync(Guid studentUserId, Guid courseworkId, UpdateCourseworkRequest request, Guid currentUserId, string role, Guid? collegeId);
    Task DeleteAsync(Guid studentUserId, Guid courseworkId, Guid currentUserId, string role, Guid? collegeId);
    Task<CourseworkSummaryResponse> GetSummaryAsync(Guid studentUserId, Guid currentUserId, string role, Guid? collegeId);
}
