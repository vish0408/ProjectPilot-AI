using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideProfile;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("guide/profile")]
[Authorize(Roles = "Guide")]
public class GuideProfileController : ControllerBase
{
    private readonly IGuideProfileService _guideProfileService;

    public GuideProfileController(IGuideProfileService guideProfileService)
    {
        _guideProfileService = guideProfileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.GetUserId();
        var profile = await _guideProfileService.GetProfileAsync(userId);
        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateGuideProfileRequest request)
    {
        var userId = User.GetUserId();
        var profile = await _guideProfileService.UpdateProfileAsync(userId, request);
        return Ok(profile);
    }
}
