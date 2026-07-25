using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/progress")]
[Authorize(Roles = "HOD")]
public class HodProgressController : ControllerBase
{
    private readonly IHodProgressService _progressService;

    public HodProgressController(IHodProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProgress()
    {
        var userId = User.GetUserId();
        var progress = await _progressService.GetProgressAsync(userId);
        return Ok(progress);
    }
}
