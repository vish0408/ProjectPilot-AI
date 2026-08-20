using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("approval-history")]
[Authorize]
public class ApprovalHistoryController : ControllerBase
{
    private readonly IApprovalHistoryService _approvalHistoryService;

    public ApprovalHistoryController(IApprovalHistoryService approvalHistoryService)
    {
        _approvalHistoryService = approvalHistoryService;
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetProjectHistory(Guid projectId)
    {
        var userId = User.GetUserId();
        var history = await _approvalHistoryService.GetProjectHistoryAsync(userId, projectId);
        return Ok(history);
    }

    [HttpGet("chapter/{chapterId:guid}")]
    public async Task<IActionResult> GetChapterHistory(Guid chapterId)
    {
        var userId = User.GetUserId();
        var history = await _approvalHistoryService.GetChapterHistoryAsync(userId, chapterId);
        return Ok(history);
    }
}
