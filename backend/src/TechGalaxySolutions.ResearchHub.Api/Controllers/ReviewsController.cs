using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = User.GetUserId();
        var reviews = await _reviewService.GetMyReviewsAsync(userId);
        return Ok(reviews);
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetProjectReviews(Guid projectId)
    {
        var reviews = await _reviewService.GetProjectReviewsAsync(projectId);
        return Ok(reviews);
    }

    [HttpPost("project/{projectId:guid}")]
    public async Task<IActionResult> CreateReview(Guid projectId, [FromBody] CreateReviewRequest request)
    {
        var userId = User.GetUserId();
        var review = await _reviewService.CreateReviewAsync(projectId, userId, request);
        return CreatedAtAction(nameof(GetProjectReviews), new { projectId }, review);
    }
}
