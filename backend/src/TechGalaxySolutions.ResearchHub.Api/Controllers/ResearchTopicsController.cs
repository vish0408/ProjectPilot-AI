using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/research-topics")]
[Authorize(Roles = "HOD")]
public class ResearchTopicsController : ControllerBase
{
    private readonly IResearchTopicService _topicService;

    public ResearchTopicsController(IResearchTopicService topicService)
    {
        _topicService = topicService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTopics([FromQuery] Guid? categoryId)
    {
        var topics = await _topicService.GetTopicsAsync(categoryId);
        return Ok(topics);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTopic([FromBody] CreateResearchTopicRequest request)
    {
        var userId = User.GetUserId();
        var topic = await _topicService.CreateTopicAsync(userId, request);
        return Ok(topic);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTopic(Guid id, [FromBody] UpdateResearchTopicRequest request)
    {
        var topic = await _topicService.UpdateTopicAsync(id, request);
        return Ok(topic);
    }
}
