using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/hods")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminHodsController : ControllerBase
{
    private readonly IHodManagementService _hodService;

    public AdminHodsController(IHodManagementService hodService)
    {
        _hodService = hodService;
    }

    private Guid? GetCollegeId()
    {
        var claim = User.FindFirst("CollegeId")?.Value;
        return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var cid) ? cid : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request, [FromQuery] Guid? collegeId, [FromQuery] Guid? departmentId)
    {
        var effectiveCollegeId = GetCollegeId() ?? collegeId;
        var result = await _hodService.GetHodsAsync(request, effectiveCollegeId, departmentId);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllHods([FromQuery] Guid? collegeId, [FromQuery] Guid? departmentId)
    {
        var effectiveCollegeId = GetCollegeId() ?? collegeId;
        var result = await _hodService.GetAllHodsAsync(effectiveCollegeId, departmentId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var hod = await _hodService.GetHodAsync(id);
        if (hod == null)
            return NotFound();

        var collegeId = GetCollegeId();
        if (collegeId.HasValue && hod.CollegeId != collegeId.Value)
            return Forbid();

        return Ok(hod);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHodRequest request)
    {
        var result = await _hodService.CreateHodAsync(request, GetCollegeId());
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHodRequest request)
    {
        var hod = await _hodService.GetHodAsync(id);
        if (hod == null)
            return NotFound();

        var collegeId = GetCollegeId();
        if (collegeId.HasValue && hod.CollegeId != collegeId.Value)
            return Forbid();

        var result = await _hodService.UpdateHodAsync(id, request, collegeId);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var hod = await _hodService.GetHodAsync(id);
        if (hod == null)
            return NotFound();

        var collegeId = GetCollegeId();
        if (collegeId.HasValue && hod.CollegeId != collegeId.Value)
            return Forbid();

        await _hodService.DeleteHodAsync(id);
        return NoContent();
    }
}
