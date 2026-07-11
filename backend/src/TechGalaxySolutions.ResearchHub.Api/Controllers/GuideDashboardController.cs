using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("dashboard/guide")]
[Authorize]
public class GuideDashboardController : ControllerBase
{
    private readonly IGuideDashboardService _dashboardService;

    public GuideDashboardController(IGuideDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = User.GetUserId();
        var dashboard = await _dashboardService.GetDashboardAsync(userId);
        return Ok(dashboard);
    }
}
