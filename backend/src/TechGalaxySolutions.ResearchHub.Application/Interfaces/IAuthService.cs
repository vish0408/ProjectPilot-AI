using TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAuthService
{
    Task<TokenResponse> LoginAsync(LoginRequest request);

    Task RegisterAsync(RegisterRequest request);

    Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request);

    Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId);

    Task LogoutAsync(Guid userId, string refreshToken);
}
