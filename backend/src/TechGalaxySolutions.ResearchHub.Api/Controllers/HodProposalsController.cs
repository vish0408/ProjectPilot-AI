using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProposal;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/proposals")]
[Authorize(Roles = "HOD")]
public class HodProposalsController : ControllerBase
{
    private readonly IHodProposalService _proposalService;

    public HodProposalsController(IHodProposalService proposalService)
    {
        _proposalService = proposalService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProposals([FromQuery] string? status)
    {
        var userId = User.GetUserId();
        var proposals = await _proposalService.GetProposalsAsync(userId, status);
        return Ok(proposals);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProposalDetail(Guid id)
    {
        var userId = User.GetUserId();
        var proposal = await _proposalService.GetProposalDetailAsync(userId, id);
        return Ok(proposal);
    }

    [HttpPost("{id:guid}/review")]
    public async Task<IActionResult> ReviewProposal(Guid id, [FromBody] ReviewProposalRequest request)
    {
        var userId = User.GetUserId();
        var proposal = await _proposalService.ReviewProposalAsync(userId, id, request);
        return Ok(proposal);
    }

    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddProposalCommentRequest request)
    {
        var userId = User.GetUserId();
        var comment = await _proposalService.AddCommentAsync(userId, id, request);
        return Ok(comment);
    }
}
