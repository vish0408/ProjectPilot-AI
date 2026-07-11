using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Task;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("projects/{projectId:guid}/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks(Guid projectId)
    {
        var userId = User.GetUserId();
        var tasks = await _taskService.GetProjectTasksAsync(projectId, userId);
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid projectId, Guid id)
    {
        var userId = User.GetUserId();
        var task = await _taskService.GetByIdAsync(id, userId);
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateTaskItemRequest request)
    {
        var userId = User.GetUserId();
        var task = await _taskService.CreateAsync(projectId, userId, request);
        return CreatedAtAction(nameof(GetById), new { projectId, id = task.Id }, task);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid id, [FromBody] UpdateTaskItemRequest request)
    {
        var userId = User.GetUserId();
        var task = await _taskService.UpdateAsync(id, userId, request);
        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid id)
    {
        var userId = User.GetUserId();
        await _taskService.DeleteAsync(id, userId);
        return NoContent();
    }
}
