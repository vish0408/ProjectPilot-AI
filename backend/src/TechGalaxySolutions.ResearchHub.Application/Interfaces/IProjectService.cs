using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Project;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IProjectService
{
    Task<PagedResponse<ProjectResponse>> GetMyProjectsAsync(Guid userId, PagedRequest request);
    Task<ProjectResponse> GetByIdAsync(Guid projectId, Guid userId);
    Task<ProjectResponse> CreateAsync(Guid userId, CreateProjectRequest request);
    Task<ProjectResponse> UpdateAsync(Guid projectId, Guid userId, UpdateProjectRequest request);
    Task DeleteAsync(Guid projectId, Guid userId);
    Task<ProjectMemberResponse> AddMemberAsync(Guid projectId, Guid userId, Guid memberUserId, string role);
    Task RemoveMemberAsync(Guid projectId, Guid userId, Guid memberId);
    Task<double> RecalculateCompletionPercentageAsync(Guid projectId);
    Task<ProjectResponse> SubmitFinalThesisAsync(Guid projectId, Guid userId);
}
