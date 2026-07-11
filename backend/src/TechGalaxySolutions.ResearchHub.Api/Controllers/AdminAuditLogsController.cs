using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/audit-logs")]
[Authorize(Roles = "Admin")]
public class AdminAuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AdminAuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _auditLogService.GetAuditLogsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _auditLogService.GetAuditLogAsync(id);
        return Ok(result);
    }
}
