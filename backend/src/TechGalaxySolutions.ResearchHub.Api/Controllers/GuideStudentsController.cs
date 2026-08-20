using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Api.Extensions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("guide/students")]
[Authorize(Roles = "Guide")]
public class GuideStudentsController : ControllerBase
{
    private readonly IGuideStudentService _guideStudentService;

    public GuideStudentsController(IGuideStudentService guideStudentService)
    {
        _guideStudentService = guideStudentService;
    }

    [HttpGet("{studentUserId:guid}")]
    public async Task<IActionResult> GetAssignedStudentDetail(Guid studentUserId)
    {
        var userId = User.GetUserId();
        var student = await _guideStudentService.GetAssignedStudentDetailAsync(userId, studentUserId);
        return Ok(student);
    }
}
