using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchStage;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/research-stages")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminResearchStagesController : ControllerBase
{
    private readonly IResearchStageService _researchStageService;

    public AdminResearchStagesController(IResearchStageService researchStageService)
    {
        _researchStageService = researchStageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _researchStageService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _researchStageService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateResearchStageRequest request)
    {
        var result = await _researchStageService.CreateAsync(request);
        return Created(string.Empty, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResearchStageRequest request)
    {
        var result = await _researchStageService.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _researchStageService.DeleteAsync(id);
        return Ok(new { message = "Research stage deleted successfully." });
    }
}
