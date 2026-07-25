using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/semesters")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminSemestersController : ControllerBase
{
    private readonly ISemesterService _semesterService;

    public AdminSemestersController(ISemesterService semesterService)
    {
        _semesterService = semesterService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _semesterService.GetSemestersAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _semesterService.GetSemesterAsync(id);
        return Ok(result);
    }

    [HttpGet("by-academic-year/{academicYearId:guid}")]
    public async Task<IActionResult> GetByAcademicYear(Guid academicYearId)
    {
        var result = await _semesterService.GetSemestersByAcademicYearAsync(academicYearId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSemesterRequest request)
    {
        var result = await _semesterService.CreateAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSemesterRequest request)
    {
        var result = await _semesterService.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpPut("{id:guid}/set-current")]
    public async Task<IActionResult> SetCurrent(Guid id)
    {
        await _semesterService.SetCurrentAsync(id);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _semesterService.DeleteAsync(id);
        return NoContent();
    }
}

