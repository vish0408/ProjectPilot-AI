using TechGalaxySolutions.ResearchHub.Application.DTOs.SystemSetting;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ISystemSettingService
{
    Task<List<SystemSettingResponse>> GetSettingsAsync();
    Task<SystemSettingResponse> GetSettingAsync(Guid id);
    Task<SystemSettingResponse> GetSettingByKeyAsync(string key);
    Task<SystemSettingResponse> UpdateSettingAsync(Guid id, UpdateSystemSettingRequest request);
}
