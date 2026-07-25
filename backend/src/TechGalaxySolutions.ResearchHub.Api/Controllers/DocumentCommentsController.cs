using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("documents/{documentId:guid}/comments")]
[Authorize]
public class DocumentCommentsController : ControllerBase
{
    private readonly IDocumentCommentService _commentService;

    public DocumentCommentsController(IDocumentCommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetComments(Guid documentId)
    {
        var userId = User.GetUserId();
        var comments = await _commentService.GetCommentsAsync(documentId, userId);
        return Ok(comments);
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment(Guid documentId, [FromBody] CreateDocumentCommentRequest request)
    {
        var userId = User.GetUserId();
        var comment = await _commentService.CreateCommentAsync(documentId, userId, request);
        return CreatedAtAction(nameof(GetComments), new { documentId }, comment);
    }

    [HttpPut("{commentId:guid}")]
    public async Task<IActionResult> UpdateComment(Guid documentId, Guid commentId, [FromBody] string content)
    {
        var userId = User.GetUserId();
        var comment = await _commentService.UpdateCommentAsync(commentId, userId, content);
        return Ok(comment);
    }

    [HttpDelete("{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid documentId, Guid commentId)
    {
        var userId = User.GetUserId();
        await _commentService.DeleteCommentAsync(commentId, userId);
        return NoContent();
    }
}
