using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AdminDashboard;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/dashboard")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _dashboardService;
    private readonly ILogger<AdminDashboardController> _logger;

    public AdminDashboardController(IAdminDashboardService dashboardService, ILogger<AdminDashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        try
        {
            var collegeIdClaim = User.FindFirst("CollegeId")?.Value;
            Guid? collegeId = !string.IsNullOrEmpty(collegeIdClaim) && Guid.TryParse(collegeIdClaim, out var cid) ? cid : null;
            var result = await _dashboardService.GetDashboardAsync(collegeId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dashboard load failed");
            return StatusCode(500, new
            {
                title = "Dashboard Error",
                detail = "Failed to load dashboard data. Please try again.",
                status = 500
            });
        }
    }
}
