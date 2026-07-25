using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Infrastructure.Services;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("projects/{projectId:guid}/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IFileStorageService _fileStorage;

    public DocumentsController(IDocumentService documentService, IFileStorageService fileStorage)
    {
        _documentService = documentService;
        _fileStorage = fileStorage;
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

    [HttpPost("upload")]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> Upload(Guid projectId, IFormFile file)
    {
        var userId = User.GetUserId();
        var document = await _documentService.CreateWithFileAsync(projectId, userId, file);
        return CreatedAtAction(nameof(GetDocuments), new { projectId }, document);
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid projectId, Guid id)
    {
        var userId = User.GetUserId();
        try
        {
            var result = await _documentService.DownloadFileAsync(id, userId);
            if (result == null)
                return NotFound("The original file is no longer available.");

            return File(result.Data, result.ContentType, result.FileName);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id:guid}/preview")]
    public async Task<IActionResult> Preview(Guid projectId, Guid id)
    {
        var userId = User.GetUserId();
        try
        {
            var result = await _documentService.DownloadFileAsync(id, userId);
            if (result == null)
                return NotFound("The original file is no longer available.");

            var contentType = _fileStorage.GetContentType(result.FileName);
            return File(result.Data, contentType);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid id)
    {
        var userId = User.GetUserId();
        await _documentService.DeleteAsync(id, userId);
        return NoContent();
    }
}
