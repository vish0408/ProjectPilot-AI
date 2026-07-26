using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("admin/users")]
[Authorize(Roles = "CollegeAdmin,SuperAdmin")]
public class AdminUsersController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;
    private readonly IAuthService _authService;

    public AdminUsersController(IUserManagementService userManagementService, IAuthService authService)
    {
        _userManagementService = userManagementService;
        _authService = authService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _userManagementService.GetUsersAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _userManagementService.GetUserAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var result = await _userManagementService.CreateUserAsync(request);
        return Created(string.Empty, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var result = await _userManagementService.UpdateUserAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _userManagementService.DeleteUserAsync(id);
            return Ok(new { message = "User deleted successfully." });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "User not found." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Failed to delete user: {ex.InnerException?.Message ?? ex.Message}" });
        }
    }

    [HttpPost("{id:guid}/resend-invitation")]
    public async Task<IActionResult> ResendInvitation(Guid id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var currentUserId))
        {
            return Unauthorized();
        }

        await _authService.ResendInvitationAsync(id, currentUserId);
        return Ok(new { message = "Invitation email resent successfully." });
    }

    [HttpPost("{id:guid}/send-invitation")]
    public async Task<IActionResult> SendInvitation(Guid id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var currentUserId))
        {
            return Unauthorized();
        }

        try
        {
            await _authService.SendInvitationAsync(id, currentUserId);
            return Ok(new { message = "Invitation email sent successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.GetType().Name, message = ex.Message, stackTrace = ex.StackTrace });
        }
    }
}
