using TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodStudentService
{
    Task<List<StudentSummaryResponse>> GetStudentsAsync(Guid userId, string? search, string? sortBy, string? filterStatus);
}
