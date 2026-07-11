using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ProjectAllocation;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/allocations")]
[Authorize(Roles = "HOD")]
public class ProjectAllocationsController : ControllerBase
{
    private readonly IProjectAllocationService _allocationService;

    public ProjectAllocationsController(IProjectAllocationService allocationService)
    {
        _allocationService = allocationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllocations()
    {
        var userId = User.GetUserId();
        var allocations = await _allocationService.GetAllocationsAsync(userId);
        return Ok(allocations);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAllocation([FromBody] CreateAllocationRequest request)
    {
        var userId = User.GetUserId();
        var allocation = await _allocationService.CreateAllocationAsync(userId, request);
        return Ok(allocation);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RevokeAllocation(Guid id)
    {
        var userId = User.GetUserId();
        await _allocationService.RevokeAllocationAsync(id, userId);
        return NoContent();
    }
}
