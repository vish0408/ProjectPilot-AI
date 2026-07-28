using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IUserManagementService
{
    Task<PagedResponse<UserResponse>> GetUsersAsync(PagedRequest request);
    Task<List<UserResponse>> GetAllUsersAsync();
    Task<UserResponse> GetUserAsync(Guid id);
    Task<UserResponse> CreateUserAsync(CreateUserRequest request);
    Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task DeleteUserAsync(Guid id);
}
