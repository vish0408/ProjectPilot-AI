using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Permission;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class PermissionService : IPermissionService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public PermissionService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PermissionResponse>> GetPermissionsAsync()
    {
        var permissions = await _context.Set<Permission>().AsNoTracking()
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Group)
            .ThenBy(p => p.Name)
            .ToListAsync();

        return _mapper.Map<List<PermissionResponse>>(permissions);
    }

    public async Task<PermissionResponse> GetPermissionAsync(Guid id)
    {
        var permission = await _context.Set<Permission>().AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Permission not found");

        return _mapper.Map<PermissionResponse>(permission);
    }

    public async Task<PermissionResponse> CreatePermissionAsync(CreatePermissionRequest request)
    {
        var permission = new Permission
        {
            Name = request.Name,
            Description = request.Description,
            Group = request.Group,
        };

        _context.Set<Permission>().Add(permission);
        await _context.SaveChangesAsync();

        return _mapper.Map<PermissionResponse>(permission);
    }

    public async Task<PermissionResponse> UpdatePermissionAsync(Guid id, UpdatePermissionRequest request)
    {
        var permission = await _context.Set<Permission>()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Permission not found");

        permission.Name = request.Name;
        permission.Description = request.Description;
        permission.Group = request.Group;
        permission.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<PermissionResponse>(permission);
    }

    public async Task DeletePermissionAsync(Guid id)
    {
        var permission = await _context.Set<Permission>()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Permission not found");

        permission.IsDeleted = true;
        permission.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
