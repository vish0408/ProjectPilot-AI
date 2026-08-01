using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IUserManagementService
{
    Task<PagedResponse<UserResponse>> GetUsersAsync(PagedRequest request, Guid? collegeId = null);
    Task<List<UserResponse>> GetAllUsersAsync(Guid? collegeId = null);
    Task<UserResponse> GetUserAsync(Guid id, Guid? collegeId = null);
    Task<UserResponse> CreateUserAsync(CreateUserRequest request, Guid? collegeId = null);
    Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request, Guid? collegeId = null);
    Task DeleteUserAsync(Guid id, Guid? collegeId = null);
}
