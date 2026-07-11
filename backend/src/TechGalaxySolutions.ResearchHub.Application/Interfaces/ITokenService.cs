using System.Security.Claims;
using TechGalaxySolutions.ResearchHub.Domain.Entities;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);

    string GenerateRefreshToken();

    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);

    Task<RefreshToken> CreateRefreshTokenAsync(User user, string jwtId);

    Task<RefreshToken?> ValidateRefreshTokenAsync(string token);

    Task MarkRefreshTokenAsUsedAsync(Guid refreshTokenId);

    Task RevokeUserRefreshTokensAsync(Guid userId);
}
