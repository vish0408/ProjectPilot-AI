using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("student")]
    public async Task<IActionResult> GetStudentDashboard()
    {
        var userId = User.GetUserId();
        var dashboard = await _dashboardService.GetStudentDashboardAsync(userId);
        return Ok(dashboard);
    }
}
