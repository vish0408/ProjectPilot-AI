using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/reports")]
[Authorize(Roles = "HOD")]
public class DepartmentReportsController : ControllerBase
{
    private readonly IDepartmentReportService _reportService;

    public DepartmentReportsController(IDepartmentReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet]
    public async Task<IActionResult> GetReports()
    {
        var userId = User.GetUserId();
        var reports = await _reportService.GetReportsAsync(userId);
        return Ok(reports);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateReport([FromQuery] string reportType, [FromQuery] string title)
    {
        var userId = User.GetUserId();
        var report = await _reportService.GenerateReportAsync(userId, reportType, title);
        return Ok(report);
    }
}
