using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class JwtService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public JwtService(IConfiguration configuration, ApplicationDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured")));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.Role.Name),
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer is not configured"),
            audience: _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience is not configured"),
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured")));

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer is not configured"),
            ValidAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience is not configured"),
            IssuerSigningKey = key,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public async Task<RefreshToken> CreateRefreshTokenAsync(User user, string jwtId)
    {
        var refreshToken = new RefreshToken
        {
            Token = GenerateRefreshToken(),
            JwtId = jwtId,
            UserId = user.Id,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            IsUsed = false,
            IsRevoked = false,
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string token)
    {
        return await _context.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(rt =>
                rt.Token == token &&
                !rt.IsUsed &&
                !rt.IsRevoked &&
                rt.ExpiryDate > DateTime.UtcNow);
    }

    public async Task MarkRefreshTokenAsUsedAsync(Guid refreshTokenId)
    {
        var refreshToken = await _context.RefreshTokens.FindAsync(refreshTokenId);
        if (refreshToken != null)
        {
            refreshToken.IsUsed = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task RevokeUserRefreshTokensAsync(Guid userId)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
        }

        await _context.SaveChangesAsync();
    }
}
