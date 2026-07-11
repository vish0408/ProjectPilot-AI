using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Role;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/roles")]
[Authorize(Roles = "Admin")]
public class AdminRolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public AdminRolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _roleService.GetRolesAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _roleService.GetRoleAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request)
    {
        var result = await _roleService.CreateRoleAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var result = await _roleService.UpdateRoleAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _roleService.DeleteRoleAsync(id);
        return NoContent();
    }
}
