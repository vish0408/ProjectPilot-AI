using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;

    public AuthService(
        ApplicationDbContext context,
        ITokenService tokenService,
        IMapper mapper)
    {
        _context = context;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is deactivated");
        }

        return await GenerateTokenResponseAsync(user);
    }

    public async Task RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted);

        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email already exists");
        }

        var role = await _context.Roles.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Name == request.Role && !r.IsDeleted);

        if (role == null)
        {
            throw new InvalidOperationException($"Role '{request.Role}' not found");
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = role.Id,
            IsActive = true,
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var storedRefreshToken = await _tokenService.ValidateRefreshTokenAsync(request.RefreshToken);
        if (storedRefreshToken == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        var user = await _context.Users.AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == storedRefreshToken.UserId && !u.IsDeleted);

        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("User not found or deactivated");
        }

        await _tokenService.MarkRefreshTokenAsUsedAsync(storedRefreshToken.Id);

        return await GenerateTokenResponseAsync(user);
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users.AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        return _mapper.Map<CurrentUserResponse>(user);
    }

    public async Task LogoutAsync(Guid userId, string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId);

        if (storedToken != null)
        {
            storedToken.IsRevoked = true;
            await _context.SaveChangesAsync();
        }

        await _tokenService.RevokeUserRefreshTokensAsync(userId);
    }

    private async Task<TokenResponse> GenerateTokenResponseAsync(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var jwtId = Guid.NewGuid().ToString();

        var refreshTokenEntity = await _tokenService.CreateRefreshTokenAsync(user, jwtId);

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenEntity.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
        };
    }
}
