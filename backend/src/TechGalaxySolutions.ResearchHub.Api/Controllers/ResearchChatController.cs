using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Api.Extensions;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Chat;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("chat")]
[Authorize(Roles = "Student")]
public class ResearchChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public ResearchChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("session")]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
    {
        var userId = User.GetUserId();
        var result = await _chatService.CreateSessionAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var userId = User.GetUserId();
        var result = await _chatService.SendMessageAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("stream")]
    public async Task StreamMessage([FromBody] SendMessageRequest request)
    {
        var userId = User.GetUserId();

        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";

        try
        {
            await foreach (var chunk in _chatService.StreamMessageAsync(userId, request, HttpContext.RequestAborted))
            {
                var json = JsonSerializer.Serialize(chunk, JsonOptions);
                await Response.WriteAsync($"data: {json}\n\n", HttpContext.RequestAborted);
                await Response.Body.FlushAsync(HttpContext.RequestAborted);
            }
        }
        catch (OperationCanceledException)
        {
            // Client disconnected - normal
        }

        await Response.WriteAsync("data: [DONE]\n\n", HttpContext.RequestAborted);
        await Response.Body.FlushAsync(HttpContext.RequestAborted);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = User.GetUserId();
        var result = await _chatService.GetHistoryAsync(userId);
        return Ok(result);
    }

    [HttpGet("session/{id:guid}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _chatService.GetSessionAsync(id, userId);
        return Ok(result);
    }

    [HttpDelete("session/{id:guid}")]
    public async Task<IActionResult> DeleteSession(Guid id)
    {
        var userId = User.GetUserId();
        await _chatService.DeleteSessionAsync(id, userId);
        return NoContent();
    }
}
