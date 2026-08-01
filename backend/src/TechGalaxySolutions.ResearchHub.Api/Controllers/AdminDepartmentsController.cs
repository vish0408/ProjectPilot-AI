using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/departments")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminDepartmentsController : ControllerBase
{
    private readonly IAdminDepartmentService _departmentService;

    public AdminDepartmentsController(IAdminDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    private Guid? GetCollegeId()
    {
        var claim = User.FindFirst("CollegeId")?.Value;
        return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var cid) ? cid : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request, [FromQuery] Guid? collegeId)
    {
        var effectiveCollegeId = GetCollegeId() ?? collegeId;
        var result = await _departmentService.GetDepartmentsAsync(request, effectiveCollegeId);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllDepartments([FromQuery] Guid? collegeId)
    {
        var effectiveCollegeId = GetCollegeId() ?? collegeId;
        var result = await _departmentService.GetAllDepartmentsAsync(effectiveCollegeId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var department = await _departmentService.GetDepartmentAsync(id);
        if (department == null)
            return NotFound();

        var collegeId = GetCollegeId();
        if (collegeId.HasValue && department.CollegeId != collegeId.Value)
            return Forbid();

        return Ok(department);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentRequest request)
    {
        var result = await _departmentService.CreateDepartmentAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentRequest request)
    {
        var department = await _departmentService.GetDepartmentAsync(id);
        if (department == null)
            return NotFound();

        var collegeId = GetCollegeId();
        if (collegeId.HasValue && department.CollegeId != collegeId.Value)
            return Forbid();

        var result = await _departmentService.UpdateDepartmentAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var department = await _departmentService.GetDepartmentAsync(id);
        if (department == null)
            return NotFound();

        var collegeId = GetCollegeId();
        if (collegeId.HasValue && department.CollegeId != collegeId.Value)
            return Forbid();

        await _departmentService.DeleteDepartmentAsync(id);
        return NoContent();
    }
}
