using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodStudent;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/students")]
[Authorize(Roles = "HOD")]
public class HodStudentsController : ControllerBase
{
    private readonly IHodStudentService _studentService;

    public HodStudentsController(IHodStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStudents([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? filterStatus, [FromQuery] PagedRequest request)
    {
        var userId = User.GetUserId();
        var result = await _studentService.GetStudentsAsync(userId, search, sortBy, filterStatus, request);
        return Ok(result);
    }

    [HttpGet("{studentUserId:guid}")]
    public async Task<IActionResult> GetStudentDetail(Guid studentUserId)
    {
        var userId = User.GetUserId();
        var result = await _studentService.GetStudentDetailAsync(userId, studentUserId);
        return Ok(result);
    }

    [HttpPost("{studentUserId:guid}/assign-guide")]
    public async Task<IActionResult> AssignGuide(Guid studentUserId, [FromBody] AssignStudentGuideRequest request)
    {
        var userId = User.GetUserId();
        request.StudentId = studentUserId;
        await _studentService.AssignGuideAsync(userId, request);
        return Ok(new { message = "Guide assigned successfully" });
    }

    [HttpPut("{studentUserId:guid}/status")]
    public async Task<IActionResult> ToggleStatus(Guid studentUserId, [FromQuery] bool isActive)
    {
        var userId = User.GetUserId();
        await _studentService.ToggleStudentStatusAsync(userId, studentUserId, isActive);
        return Ok(new { message = isActive ? "Student activated" : "Student deactivated" });
    }
}
