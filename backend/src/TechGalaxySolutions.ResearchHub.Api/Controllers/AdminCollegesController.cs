using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.College;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/colleges")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminCollegesController : ControllerBase
{
    private readonly ICollegeService _collegeService;

    public AdminCollegesController(ICollegeService collegeService)
    {
        _collegeService = collegeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _collegeService.GetCollegesAsync();
        return Ok(result);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var result = await _collegeService.GetCollegeAnalyticsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _collegeService.GetCollegeAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCollegeRequest request)
    {
        var result = await _collegeService.CreateCollegeAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCollegeRequest request)
    {
        var result = await _collegeService.UpdateCollegeAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _collegeService.DeleteCollegeAsync(id);
        return NoContent();
    }
}

