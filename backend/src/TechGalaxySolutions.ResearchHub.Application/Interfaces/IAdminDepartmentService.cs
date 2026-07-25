using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAdminDepartmentService
{
    Task<PagedResponse<DepartmentResponse>> GetDepartmentsAsync(PagedRequest request, Guid? collegeId = null);
    Task<List<DepartmentResponse>> GetAllDepartmentsAsync(Guid? collegeId = null);
    Task<DepartmentResponse> GetDepartmentAsync(Guid id);
    Task<DepartmentResponse> CreateDepartmentAsync(CreateDepartmentRequest request);
    Task<DepartmentResponse> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request);
    Task DeleteDepartmentAsync(Guid id);
}
