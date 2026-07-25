using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/guides")]
[Authorize(Roles = "HOD")]
public class HodGuidesController : ControllerBase
{
    private readonly IHodGuideService _guideService;

    public HodGuidesController(IHodGuideService guideService)
    {
        _guideService = guideService;
    }

    [HttpGet]
    public async Task<IActionResult> GetGuides()
    {
        var userId = User.GetUserId();
        var guides = await _guideService.GetGuidesAsync(userId);
        return Ok(guides);
    }

    [HttpGet("{guideUserId:guid}")]
    public async Task<IActionResult> GetGuideDetail(Guid guideUserId)
    {
        var userId = User.GetUserId();
        var guide = await _guideService.GetGuideDetailAsync(userId, guideUserId);
        return Ok(guide);
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignGuide([FromBody] AssignGuideRequest request)
    {
        var userId = User.GetUserId();
        await _guideService.AssignGuideAsync(userId, request);
        return Ok(new { message = "Guide assigned successfully" });
    }
}
