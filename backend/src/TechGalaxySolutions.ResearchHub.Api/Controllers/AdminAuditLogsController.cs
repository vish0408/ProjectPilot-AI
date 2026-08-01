using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/audit-logs")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminAuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AdminAuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    private Guid? GetCollegeId()
    {
        var claim = User.FindFirst("CollegeId")?.Value;
        return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var cid) ? cid : null;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllAuditLogs()
    {
        var result = await _auditLogService.GetAllAuditLogsAsync(GetCollegeId());
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        var result = await _auditLogService.GetAuditLogsAsync(request, GetCollegeId());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _auditLogService.GetAuditLogAsync(id, GetCollegeId());
        return Ok(result);
    }
}

