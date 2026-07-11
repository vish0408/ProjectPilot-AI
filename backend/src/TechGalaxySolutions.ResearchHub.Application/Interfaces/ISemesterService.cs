using TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ISemesterService
{
    Task<List<SemesterResponse>> GetSemestersAsync();
    Task<SemesterResponse> GetSemesterAsync(Guid id);
    Task<List<SemesterResponse>> GetSemestersByAcademicYearAsync(Guid academicYearId);
    Task<SemesterResponse> CreateAsync(CreateSemesterRequest request);
    Task<SemesterResponse> UpdateAsync(Guid id, UpdateSemesterRequest request);
    Task DeleteAsync(Guid id);
    Task SetCurrentAsync(Guid id);
}
