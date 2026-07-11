using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProfile;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/profile")]
[Authorize(Roles = "HOD")]
public class HodProfileController : ControllerBase
{
    private readonly IHodProfileService _hodProfileService;

    public HodProfileController(IHodProfileService hodProfileService)
    {
        _hodProfileService = hodProfileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.GetUserId();
        var profile = await _hodProfileService.GetProfileAsync(userId);
        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateHodProfileRequest request)
    {
        var userId = User.GetUserId();
        var profile = await _hodProfileService.UpdateProfileAsync(userId, request);
        return Ok(profile);
    }
}
