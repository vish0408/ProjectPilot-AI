using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> GetStudents([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? filterStatus)
    {
        var userId = User.GetUserId();
        var students = await _studentService.GetStudentsAsync(userId, search, sortBy, filterStatus);
        return Ok(students);
    }
}
