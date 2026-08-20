using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Coursework;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("students/{studentUserId:guid}/coursework")]
[Authorize(Roles = "SuperAdmin,CollegeAdmin,HOD,Guide,Student")]
public class ScholarCourseworkController : ControllerBase
{
    private readonly IScholarCourseworkService _courseworkService;

    public ScholarCourseworkController(IScholarCourseworkService courseworkService)
    {
        _courseworkService = courseworkService;
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null && Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }

    private string GetCurrentRole()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? string.Empty;
    }

    private Guid? GetCollegeId()
    {
        var claim = User.FindFirst("CollegeId")?.Value;
        return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var cid) ? cid : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetCoursework(Guid studentUserId)
    {
        var result = await _courseworkService.GetCourseworkAsync(studentUserId, GetCurrentUserId(), GetCurrentRole(), GetCollegeId());
        return Ok(result);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(Guid studentUserId)
    {
        var result = await _courseworkService.GetSummaryAsync(studentUserId, GetCurrentUserId(), GetCurrentRole(), GetCollegeId());
        return Ok(result);
    }

    [HttpGet("{courseworkId:guid}")]
    public async Task<IActionResult> GetById(Guid studentUserId, Guid courseworkId)
    {
        var result = await _courseworkService.GetCourseworkItemAsync(studentUserId, courseworkId, GetCurrentUserId(), GetCurrentRole(), GetCollegeId());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid studentUserId, [FromBody] CreateCourseworkRequest request)
    {
        var result = await _courseworkService.CreateAsync(studentUserId, request, GetCurrentUserId(), GetCurrentRole(), GetCollegeId());
        return Created(string.Empty, result);
    }

    [HttpPut("{courseworkId:guid}")]
    public async Task<IActionResult> Update(Guid studentUserId, Guid courseworkId, [FromBody] UpdateCourseworkRequest request)
    {
        var result = await _courseworkService.UpdateAsync(studentUserId, courseworkId, request, GetCurrentUserId(), GetCurrentRole(), GetCollegeId());
        return Ok(result);
    }

    [HttpDelete("{courseworkId:guid}")]
    public async Task<IActionResult> Delete(Guid studentUserId, Guid courseworkId)
    {
        await _courseworkService.DeleteAsync(studentUserId, courseworkId, GetCurrentUserId(), GetCurrentRole(), GetCollegeId());
        return Ok(new { message = "Coursework deleted successfully." });
    }
}
