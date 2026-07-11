using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Milestone;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("projects/{projectId:guid}/milestones")]
[Authorize]
public class MilestonesController : ControllerBase
{
    private readonly IMilestoneService _milestoneService;

    public MilestonesController(IMilestoneService milestoneService)
    {
        _milestoneService = milestoneService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMilestones(Guid projectId)
    {
        var userId = User.GetUserId();
        var milestones = await _milestoneService.GetProjectMilestonesAsync(projectId, userId);
        return Ok(milestones);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateMilestoneRequest request)
    {
        var userId = User.GetUserId();
        var milestone = await _milestoneService.CreateAsync(projectId, userId, request);
        return CreatedAtAction(nameof(GetMilestones), new { projectId }, milestone);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid id, [FromBody] UpdateMilestoneRequest request)
    {
        var userId = User.GetUserId();
        var milestone = await _milestoneService.UpdateAsync(id, userId, request);
        return Ok(milestone);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid id)
    {
        var userId = User.GetUserId();
        await _milestoneService.DeleteAsync(id, userId);
        return NoContent();
    }
}
