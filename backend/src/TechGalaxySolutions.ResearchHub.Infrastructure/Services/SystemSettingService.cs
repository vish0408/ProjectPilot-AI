using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.SystemSetting;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class SystemSettingService : ISystemSettingService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public SystemSettingService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<SystemSettingResponse>> GetSettingsAsync()
    {
        var settings = await _context.Set<SystemSetting>().AsNoTracking()
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.Group)
            .ThenBy(s => s.Key)
            .ToListAsync();

        return _mapper.Map<List<SystemSettingResponse>>(settings);
    }

    public async Task<SystemSettingResponse> GetSettingAsync(Guid id)
    {
        var setting = await _context.Set<SystemSetting>().AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Setting not found");

        return _mapper.Map<SystemSettingResponse>(setting);
    }

    public async Task<SystemSettingResponse> GetSettingByKeyAsync(string key)
    {
        var setting = await _context.Set<SystemSetting>().AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == key && !s.IsDeleted)
            ?? throw new KeyNotFoundException($"Setting with key '{key}' not found");

        return _mapper.Map<SystemSettingResponse>(setting);
    }

    public async Task<SystemSettingResponse> UpdateSettingAsync(Guid id, UpdateSystemSettingRequest request)
    {
        var setting = await _context.Set<SystemSetting>()
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Setting not found");

        setting.Value = request.Value;
        setting.Description = request.Description;
        setting.IsActive = request.IsActive;
        setting.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<SystemSettingResponse>(setting);
    }
}
