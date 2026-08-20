using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/research-topics")]
[Authorize(Roles = "HOD,CollegeAdmin,SuperAdmin")]
public class ResearchTopicsController : ControllerBase
{
    private readonly IResearchTopicService _topicService;

    public ResearchTopicsController(IResearchTopicService topicService)
    {
        _topicService = topicService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTopics([FromQuery] Guid? categoryId, [FromQuery] string? search, [FromQuery] Guid? departmentId)
    {
        var userId = User.GetUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        var topics = await _topicService.GetTopicsAsync(userId, role, categoryId, search, departmentId);
        return Ok(topics);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTopic([FromBody] CreateResearchTopicRequest request)
    {
        var userId = User.GetUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        var topic = await _topicService.CreateTopicAsync(userId, role, request);
        return Ok(topic);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTopic(Guid id, [FromBody] UpdateResearchTopicRequest request)
    {
        var userId = User.GetUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        var topic = await _topicService.UpdateTopicAsync(id, userId, role, request);
        return Ok(topic);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTopic(Guid id)
    {
        var userId = User.GetUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        await _topicService.DeleteTopicAsync(id, userId, role);
        return NoContent();
    }
}

