using AutoMapper;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class UserManagementService : IUserManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UserManagementService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<UserResponse>> GetUsersAsync()
    {
        var users = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.FullName)
            .ToListAsync();

        return _mapper.Map<List<UserResponse>>(users);
    }

    public async Task<UserResponse> GetUserAsync(Guid id)
    {
        var user = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted)
            ?? throw new KeyNotFoundException("User not found");

        return _mapper.Map<UserResponse>(user);
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        var emailExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Email == request.Email && !u.IsDeleted);

        if (emailExists)
            throw new InvalidOperationException("Email is already in use");

        var roleExists = await _context.Set<Role>().AsNoTracking()
            .AnyAsync(r => r.Id == request.RoleId && !r.IsDeleted);

        if (!roleExists)
            throw new KeyNotFoundException("Role not found");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
        };

        _context.Set<User>().Add(user);
        await _context.SaveChangesAsync();

        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        return _mapper.Map<UserResponse>(user);
    }

    public async Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _context.Set<User>()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted)
            ?? throw new KeyNotFoundException("User not found");

        var emailExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Email == request.Email && u.Id != id && !u.IsDeleted);

        if (emailExists)
            throw new InvalidOperationException("Email is already in use by another user");

        var roleExists = await _context.Set<Role>().AsNoTracking()
            .AnyAsync(r => r.Id == request.RoleId && !r.IsDeleted);

        if (!roleExists)
            throw new KeyNotFoundException("Role not found");

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.IsActive = request.IsActive;
        user.RoleId = request.RoleId;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<UserResponse>(user);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted)
            ?? throw new KeyNotFoundException("User not found");

        user.IsDeleted = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
