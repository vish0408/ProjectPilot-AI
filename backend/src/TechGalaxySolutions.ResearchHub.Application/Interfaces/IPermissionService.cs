using TechGalaxySolutions.ResearchHub.Application.DTOs.Permission;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IPermissionService
{
    Task<List<PermissionResponse>> GetPermissionsAsync();
    Task<PermissionResponse> GetPermissionAsync(Guid id);
    Task<PermissionResponse> CreatePermissionAsync(CreatePermissionRequest request);
    Task<PermissionResponse> UpdatePermissionAsync(Guid id, UpdatePermissionRequest request);
    Task DeletePermissionAsync(Guid id);
}
