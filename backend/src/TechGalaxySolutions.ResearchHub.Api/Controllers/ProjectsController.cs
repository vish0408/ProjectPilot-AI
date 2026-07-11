using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Project;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyProjects()
    {
        var userId = User.GetUserId();
        var projects = await _projectService.GetMyProjectsAsync(userId);
        return Ok(projects);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var project = await _projectService.GetByIdAsync(id, userId);
        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var userId = User.GetUserId();
        var project = await _projectService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var userId = User.GetUserId();
        var project = await _projectService.UpdateAsync(id, userId, request);
        return Ok(project);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        await _projectService.DeleteAsync(id, userId);
        return NoContent();
    }

    [HttpPost("{id:guid}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddMemberRequest request)
    {
        var userId = User.GetUserId();
        var member = await _projectService.AddMemberAsync(id, userId, request.UserId, request.Role);
        return Ok(member);
    }

    [HttpDelete("{id:guid}/members/{memberId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid memberId)
    {
        var userId = User.GetUserId();
        await _projectService.RemoveMemberAsync(id, userId, memberId);
        return NoContent();
    }
}

public class AddMemberRequest
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member";
}
