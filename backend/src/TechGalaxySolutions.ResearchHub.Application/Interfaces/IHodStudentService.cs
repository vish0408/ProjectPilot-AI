using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodStudentService
{
    Task<PagedResponse<StudentSummaryResponse>> GetStudentsAsync(Guid userId, string? search, string? sortBy, string? filterStatus, PagedRequest request);
    Task<StudentDetailResponse> GetStudentDetailAsync(Guid userId, Guid studentUserId);
    Task AssignGuideAsync(Guid userId, AssignStudentGuideRequest request);
    Task ToggleStudentStatusAsync(Guid userId, Guid studentUserId, bool isActive);
}
