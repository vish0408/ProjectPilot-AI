using TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAuthService
{
    Task<TokenResponse> LoginAsync(LoginRequest request);
    Task RegisterAsync(RegisterRequest request);
    Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId);
    Task LogoutAsync(Guid userId, string refreshToken);

    // Activation
    Task ActivateAccountAsync(ActivateAccountRequest request);
    Task<ValidateActivationTokenResult> ValidateActivationTokenAsync(string token);
    Task ResendActivationByTokenAsync(string token);

    // Password
    Task ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<ValidatePasswordResetTokenResult> ValidatePasswordResetTokenAsync(string token);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task ResendPasswordResetByTokenAsync(string token);

    // Admin
    Task ResendInvitationAsync(Guid userId, Guid currentUserId);
    Task SendInvitationAsync(Guid userId, Guid currentUserId);
}
