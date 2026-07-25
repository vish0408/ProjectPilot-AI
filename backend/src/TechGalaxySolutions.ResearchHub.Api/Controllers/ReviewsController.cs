using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Review;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("reviews")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyReviews([FromQuery] PagedRequest request)
    {
        var userId = User.GetUserId();
        var result = await _reviewService.GetMyReviewsAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetProjectReviews(Guid projectId, [FromQuery] PagedRequest request)
    {
        var result = await _reviewService.GetProjectReviewsAsync(projectId, request);
        return Ok(result);
    }

    [HttpPost("project/{projectId:guid}")]
    public async Task<IActionResult> CreateReview(Guid projectId, [FromBody] CreateReviewRequest request)
    {
        var userId = User.GetUserId();
        var review = await _reviewService.CreateReviewAsync(projectId, userId, request);
        return CreatedAtAction(nameof(GetProjectReviews), new { projectId }, review);
    }
}
