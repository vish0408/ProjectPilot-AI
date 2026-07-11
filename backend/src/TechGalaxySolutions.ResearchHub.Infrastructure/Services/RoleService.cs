using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Role;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public RoleService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RoleResponse>> GetRolesAsync()
    {
        var roles = await _context.Set<Role>().AsNoTracking()
            .Include(r => r.Users)
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name)
            .ToListAsync();

        var rolePermissions = await _context.Set<RolePermission>().AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => !rp.IsDeleted)
            .ToListAsync();

        var permissionLookup = rolePermissions
            .GroupBy(rp => rp.RoleId)
            .ToDictionary(g => g.Key, g => g.Select(rp => rp.Permission.Name).ToList());

        var response = _mapper.Map<List<RoleResponse>>(roles);
        foreach (var item in response)
        {
            item.UserCount = roles.First(r => r.Id == item.Id).Users.Count(u => !u.IsDeleted);
            item.PermissionNames = permissionLookup.GetValueOrDefault(item.Id, new List<string>());
        }

        return response;
    }

    public async Task<RoleResponse> GetRoleAsync(Guid id)
    {
        var role = await _context.Set<Role>().AsNoTracking()
            .Include(r => r.Users)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted)
            ?? throw new KeyNotFoundException("Role not found");

        var permissionNames = await _context.Set<RolePermission>().AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == id && !rp.IsDeleted)
            .Select(rp => rp.Permission.Name)
            .ToListAsync();

        var response = _mapper.Map<RoleResponse>(role);
        response.UserCount = role.Users.Count(u => !u.IsDeleted);
        response.PermissionNames = permissionNames;

        return response;
    }

    public async Task<RoleResponse> CreateRoleAsync(CreateRoleRequest request)
    {
        var role = new Role
        {
            Name = request.Name,
            Description = request.Description,
        };

        _context.Set<Role>().Add(role);
        await _context.SaveChangesAsync();

        foreach (var permissionId in request.PermissionIds)
        {
            var rolePermission = new RolePermission
            {
                RoleId = role.Id,
                PermissionId = permissionId,
            };
            _context.Set<RolePermission>().Add(rolePermission);
        }

        await _context.SaveChangesAsync();

        var permissionNames = await _context.Set<RolePermission>().AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == role.Id && !rp.IsDeleted)
            .Select(rp => rp.Permission.Name)
            .ToListAsync();

        var response = _mapper.Map<RoleResponse>(role);
        response.PermissionNames = permissionNames;

        return response;
    }

    public async Task<RoleResponse> UpdateRoleAsync(Guid id, UpdateRoleRequest request)
    {
        var role = await _context.Set<Role>()
            .Include(r => r.Users)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted)
            ?? throw new KeyNotFoundException("Role not found");

        role.Name = request.Name;
        role.Description = request.Description;
        role.IsActive = request.IsActive;
        role.UpdatedAt = DateTime.UtcNow;

        var existingRolePermissions = await _context.Set<RolePermission>()
            .Where(rp => rp.RoleId == id)
            .ToListAsync();

        _context.Set<RolePermission>().RemoveRange(existingRolePermissions);

        foreach (var permissionId in request.PermissionIds)
        {
            var rolePermission = new RolePermission
            {
                RoleId = role.Id,
                PermissionId = permissionId,
            };
            _context.Set<RolePermission>().Add(rolePermission);
        }

        await _context.SaveChangesAsync();

        var permissionNames = await _context.Set<RolePermission>().AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == role.Id && !rp.IsDeleted)
            .Select(rp => rp.Permission.Name)
            .ToListAsync();

        var response = _mapper.Map<RoleResponse>(role);
        response.UserCount = role.Users.Count(u => !u.IsDeleted);
        response.PermissionNames = permissionNames;

        return response;
    }

    public async Task DeleteRoleAsync(Guid id)
    {
        var role = await _context.Set<Role>()
            .Include(r => r.Users)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted)
            ?? throw new KeyNotFoundException("Role not found");

        if (role.Users.Any(u => !u.IsDeleted))
            throw new InvalidOperationException("Cannot delete role with assigned users");

        role.IsDeleted = true;
        role.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
