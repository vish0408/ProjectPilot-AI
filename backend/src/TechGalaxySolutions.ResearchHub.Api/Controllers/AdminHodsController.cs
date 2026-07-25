using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/hods")]
[Authorize(Roles = "SuperAdmin")]
public class AdminHodsController : ControllerBase
{
    private readonly IHodManagementService _hodService;

    public AdminHodsController(IHodManagementService hodService)
    {
        _hodService = hodService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request, [FromQuery] Guid? collegeId, [FromQuery] Guid? departmentId)
    {
        var result = await _hodService.GetHodsAsync(request, collegeId, departmentId);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllHods([FromQuery] Guid? collegeId, [FromQuery] Guid? departmentId)
    {
        var result = await _hodService.GetAllHodsAsync(collegeId, departmentId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _hodService.GetHodAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHodRequest request)
    {
        var result = await _hodService.CreateHodAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHodRequest request)
    {
        var result = await _hodService.UpdateHodAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _hodService.DeleteHodAsync(id);
        return NoContent();
    }
}
