using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("api/test")]
public class TestEmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<TestEmailController> _logger;

    public TestEmailController(IEmailService emailService, ILogger<TestEmailController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    [HttpGet("email")]
    public async Task<IActionResult> SendTestEmail([FromQuery] string to)
    {
        try
        {
            _logger.LogInformation("Test email requested for {To}", to);

            if (string.IsNullOrWhiteSpace(to))
                return BadRequest("Query parameter 'to' is required. Usage: GET /api/test/email?to=someone@example.com");

            await _emailService.SendAsync(
                to,
                "Test Email from ResearchHub AI",
                "<h1>Test</h1><p>If you received this, SMTP is configured correctly.</p>");

            _logger.LogInformation("Test email sent successfully to {To}", to);
            return Ok(new { message = "Email sent successfully", to });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Test email failed for {To}", to);
            return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Test email failed for {To}", to);
            return StatusCode(500, new { error = ex.GetType().Name, message = ex.Message, stackTrace = ex.StackTrace });
        }
    }
}
