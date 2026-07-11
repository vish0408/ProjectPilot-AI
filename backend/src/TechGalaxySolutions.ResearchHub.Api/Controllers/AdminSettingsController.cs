using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.SystemSetting;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private readonly ISystemSettingService _settingService;

    public AdminSettingsController(ISystemSettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _settingService.GetSettingsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _settingService.GetSettingAsync(id);
        return Ok(result);
    }

    [HttpGet("by-key/{key}")]
    public async Task<IActionResult> GetByKey(string key)
    {
        var result = await _settingService.GetSettingByKeyAsync(key);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSystemSettingRequest request)
    {
        var result = await _settingService.UpdateSettingAsync(id, request);
        return Ok(result);
    }
}
