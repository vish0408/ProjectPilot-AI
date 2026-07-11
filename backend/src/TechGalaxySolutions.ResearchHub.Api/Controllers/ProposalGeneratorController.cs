using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Api.Extensions;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Proposal;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("proposal")]
[Authorize(Roles = "Student")]
public class ProposalGeneratorController : ControllerBase
{
    private readonly IProposalGeneratorService _proposalService;

    public ProposalGeneratorController(IProposalGeneratorService proposalService)
    {
        _proposalService = proposalService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateProposalRequest request)
    {
        var userId = User.GetUserId();
        var result = await _proposalService.GenerateAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("improve")]
    public async Task<IActionResult> Improve([FromBody] ImproveProposalRequest request)
    {
        var userId = User.GetUserId();
        var result = await _proposalService.ImproveSectionAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("regenerate-section")]
    public async Task<IActionResult> RegenerateSection([FromBody] RegenerateSectionRequest request)
    {
        var userId = User.GetUserId();
        var result = await _proposalService.RegenerateSectionAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        var result = await _proposalService.GetTemplatesAsync();
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveProposalRequest request)
    {
        var userId = User.GetUserId();
        var result = await _proposalService.SaveAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _proposalService.GetByIdAsync(id, userId);
        return Ok(result);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyProposals()
    {
        var userId = User.GetUserId();
        var result = await _proposalService.GetByStudentIdAsync(userId);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveProposalRequest request)
    {
        var userId = User.GetUserId();
        var result = await _proposalService.UpdateAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        await _proposalService.DeleteAsync(id, userId);
        return NoContent();
    }
}
