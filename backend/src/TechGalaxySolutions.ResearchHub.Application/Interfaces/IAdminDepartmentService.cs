using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAdminDepartmentService
{
    Task<List<DepartmentResponse>> GetDepartmentsAsync();
    Task<DepartmentResponse> GetDepartmentAsync(Guid id);
    Task<DepartmentResponse> CreateDepartmentAsync(CreateDepartmentRequest request);
    Task<DepartmentResponse> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request);
    Task DeleteDepartmentAsync(Guid id);
}
