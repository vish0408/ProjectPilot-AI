using TechGalaxySolutions.ResearchHub.Application.DTOs.Role;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IRoleService
{
    Task<List<RoleResponse>> GetRolesAsync();
    Task<RoleResponse> GetRoleAsync(Guid id);
    Task<RoleResponse> CreateRoleAsync(CreateRoleRequest request);
    Task<RoleResponse> UpdateRoleAsync(Guid id, UpdateRoleRequest request);
    Task DeleteRoleAsync(Guid id);
}
