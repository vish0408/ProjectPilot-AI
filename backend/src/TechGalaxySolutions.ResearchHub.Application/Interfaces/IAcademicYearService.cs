using TechGalaxySolutions.ResearchHub.Application.DTOs.AcademicYear;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAcademicYearService
{
    Task<List<AcademicYearResponse>> GetAcademicYearsAsync();
    Task<AcademicYearResponse> GetAcademicYearAsync(Guid id);
    Task<AcademicYearResponse> CreateAsync(CreateAcademicYearRequest request);
    Task<AcademicYearResponse> UpdateAsync(Guid id, UpdateAcademicYearRequest request);
    Task DeleteAsync(Guid id);
    Task SetCurrentAsync(Guid id);
}
