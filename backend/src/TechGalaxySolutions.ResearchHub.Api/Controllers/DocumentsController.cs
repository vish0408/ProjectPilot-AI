using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("projects/{projectId:guid}/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments(Guid projectId)
    {
        var userId = User.GetUserId();
        var documents = await _documentService.GetProjectDocumentsAsync(projectId, userId);
        return Ok(documents);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateDocumentRequest request)
    {
        var userId = User.GetUserId();
        var document = await _documentService.CreateAsync(projectId, userId, request);
        return CreatedAtAction(nameof(GetDocuments), new { projectId }, document);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid id)
    {
        var userId = User.GetUserId();
        await _documentService.DeleteAsync(id, userId);
        return NoContent();
    }
}
