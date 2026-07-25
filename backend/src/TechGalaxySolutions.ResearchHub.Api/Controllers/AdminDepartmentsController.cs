using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/departments")]
[Authorize(Roles = "SuperAdmin")]
public class AdminDepartmentsController : ControllerBase
{
    private readonly IAdminDepartmentService _departmentService;

    public AdminDepartmentsController(IAdminDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request, [FromQuery] Guid? collegeId)
    {
        var result = await _departmentService.GetDepartmentsAsync(request, collegeId);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllDepartments([FromQuery] Guid? collegeId)
    {
        var result = await _departmentService.GetAllDepartmentsAsync(collegeId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _departmentService.GetDepartmentAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentRequest request)
    {
        var result = await _departmentService.CreateDepartmentAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentRequest request)
    {
        var result = await _departmentService.UpdateDepartmentAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _departmentService.DeleteDepartmentAsync(id);
        return NoContent();
    }
}
