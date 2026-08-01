using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.College;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
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

    private Guid? GetCollegeId()
    {
        var claim = User.FindFirst("CollegeId")?.Value;
        return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var cid) ? cid : null;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllColleges()
    {
        var collegeId = GetCollegeId();
        if (collegeId.HasValue)
        {
            var college = await _collegeService.GetCollegeAsync(collegeId.Value);
            return Ok(new List<CollegeResponse> { college });
        }
        var result = await _collegeService.GetAllCollegesAsync();
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        var collegeId = GetCollegeId();
        if (collegeId.HasValue)
        {
            var college = await _collegeService.GetCollegeAsync(collegeId.Value);
            var items = new List<CollegeResponse> { college };
            return Ok(new PagedResponse<CollegeResponse>
            {
                Items = items,
                PageNumber = 1,
                PageSize = request.PageSize,
                TotalCount = 1
            });
        }
        var result = await _collegeService.GetCollegesAsync(request);
        return Ok(result);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var collegeId = GetCollegeId();
        if (collegeId.HasValue)
        {
            var allAnalytics = await _collegeService.GetCollegeAnalyticsAsync();
            var collegeAnalytics = allAnalytics.FirstOrDefault(a => a.Id == collegeId.Value);
            return Ok(collegeAnalytics != null ? new List<CollegeAnalyticsResponse> { collegeAnalytics } : new List<CollegeAnalyticsResponse>());
        }
        var result = await _collegeService.GetCollegeAnalyticsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var collegeId = GetCollegeId();
        if (collegeId.HasValue && id != collegeId.Value)
            return Forbid();

        var result = await _collegeService.GetCollegeAsync(id);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateCollegeRequest request)
    {
        var result = await _collegeService.CreateCollegeAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCollegeRequest request)
    {
        var result = await _collegeService.UpdateCollegeAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _collegeService.DeleteCollegeAsync(id);
        return NoContent();
    }
}

