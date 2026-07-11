using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/announcements")]
[Authorize(Roles = "HOD")]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementsController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAnnouncements()
    {
        var userId = User.GetUserId();
        var announcements = await _announcementService.GetAnnouncementsAsync(userId);
        return Ok(announcements);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementRequest request)
    {
        var userId = User.GetUserId();
        var announcement = await _announcementService.CreateAnnouncementAsync(userId, request);
        return Ok(announcement);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAnnouncement(Guid id, [FromBody] UpdateAnnouncementRequest request)
    {
        var userId = User.GetUserId();
        var announcement = await _announcementService.UpdateAnnouncementAsync(id, userId, request);
        return Ok(announcement);
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id)
    {
        var userId = User.GetUserId();
        await _announcementService.PublishAnnouncementAsync(id, userId);
        return Ok(new { message = "Announcement published" });
    }

    [HttpPost("{id:guid}/expire")]
    public async Task<IActionResult> Expire(Guid id)
    {
        var userId = User.GetUserId();
        await _announcementService.ExpireAnnouncementAsync(id, userId);
        return Ok(new { message = "Announcement expired" });
    }
}
