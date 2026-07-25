using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ThesisReview;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("guide/thesis-reviews")]
[Authorize(Roles = "Guide,HOD,CollegeAdmin,SuperAdmin")]
public class ThesisReviewsController : ControllerBase
{
    private readonly IThesisReviewService _thesisReviewService;

    public ThesisReviewsController(IThesisReviewService thesisReviewService)
    {
        _thesisReviewService = thesisReviewService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPendingReviews()
    {
        var userId = User.GetUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var items = await _thesisReviewService.GetPendingReviewsAsync(userId, role);
        return Ok(items);
    }

    [HttpGet("student/{studentId:guid}")]
    public async Task<IActionResult> GetStudentDocuments(Guid studentId)
    {
        var userId = User.GetUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var items = await _thesisReviewService.GetStudentDocumentsAsync(userId, studentId, role);
        return Ok(items);
    }

    [HttpPost("{documentId:guid}/review")]
    public async Task<IActionResult> ReviewDocument(Guid documentId, [FromBody] ThesisReviewRequest request)
    {
        var userId = User.GetUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var result = await _thesisReviewService.ReviewDocumentAsync(userId, documentId, request, role);
        return Ok(result);
    }

    [HttpGet("project/{projectId:guid}/versions/{documentId:guid}")]
    public async Task<IActionResult> GetDocumentVersions(Guid projectId, Guid documentId)
    {
        var items = await _thesisReviewService.GetDocumentVersionsAsync(projectId, documentId);
        return Ok(items);
    }
}

