using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GlobalAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/announcements")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminAnnouncementsController : ControllerBase
{
    private readonly IAdminAnnouncementService _announcementService;

    public AdminAnnouncementsController(IAdminAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _announcementService.GetAnnouncementsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _announcementService.GetAnnouncementAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGlobalAnnouncementRequest request)
    {
        var userId = User.GetUserId();
        var result = await _announcementService.CreateAnnouncementAsync(userId, request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGlobalAnnouncementRequest request)
    {
        var result = await _announcementService.UpdateAnnouncementAsync(id, request);
        return Ok(result);
    }

    [HttpPut("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id)
    {
        await _announcementService.PublishAnnouncementAsync(id);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _announcementService.DeleteAnnouncementAsync(id);
        return NoContent();
    }
}

