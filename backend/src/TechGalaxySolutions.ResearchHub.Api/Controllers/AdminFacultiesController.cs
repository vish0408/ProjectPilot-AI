using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/faculties")]
[Authorize(Roles = "Admin")]
public class AdminFacultiesController : ControllerBase
{
    private readonly IFacultyService _facultyService;

    public AdminFacultiesController(IFacultyService facultyService)
    {
        _facultyService = facultyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _facultyService.GetFacultiesAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _facultyService.GetFacultyAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFacultyRequest request)
    {
        var result = await _facultyService.CreateAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFacultyRequest request)
    {
        var result = await _facultyService.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _facultyService.DeleteAsync(id);
        return NoContent();
    }
}
