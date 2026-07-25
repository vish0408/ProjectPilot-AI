using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AcademicYear;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/academic-years")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminAcademicYearsController : ControllerBase
{
    private readonly IAcademicYearService _academicYearService;

    public AdminAcademicYearsController(IAcademicYearService academicYearService)
    {
        _academicYearService = academicYearService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _academicYearService.GetAcademicYearsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _academicYearService.GetAcademicYearAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAcademicYearRequest request)
    {
        var result = await _academicYearService.CreateAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAcademicYearRequest request)
    {
        var result = await _academicYearService.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpPut("{id:guid}/set-current")]
    public async Task<IActionResult> SetCurrent(Guid id)
    {
        await _academicYearService.SetCurrentAsync(id);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _academicYearService.DeleteAsync(id);
        return NoContent();
    }
}

