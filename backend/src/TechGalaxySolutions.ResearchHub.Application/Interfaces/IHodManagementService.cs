using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodManagementService
{
    Task<PagedResponse<HodResponse>> GetHodsAsync(PagedRequest request, Guid? collegeId = null, Guid? departmentId = null);
    Task<List<HodResponse>> GetAllHodsAsync(Guid? collegeId = null, Guid? departmentId = null);
    Task<HodResponse> GetHodAsync(Guid id);
    Task<HodResponse> CreateHodAsync(CreateHodRequest request, Guid? collegeId = null);
    Task<HodResponse> UpdateHodAsync(Guid id, UpdateHodRequest request, Guid? collegeId = null);
    Task DeleteHodAsync(Guid id);
}
