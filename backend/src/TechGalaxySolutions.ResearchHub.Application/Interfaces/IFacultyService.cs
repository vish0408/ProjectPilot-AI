using TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IFacultyService
{
    Task<List<FacultyResponse>> GetFacultiesAsync();
    Task<FacultyResponse> GetFacultyAsync(Guid id);
    Task<FacultyResponse> CreateAsync(CreateFacultyRequest request);
    Task<FacultyResponse> UpdateAsync(Guid id, UpdateFacultyRequest request);
    Task DeleteAsync(Guid id);
}
