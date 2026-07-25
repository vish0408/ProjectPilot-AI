using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class NoopEmailService : IEmailService
{
    private readonly ILogger<NoopEmailService> _logger;

    public NoopEmailService(ILogger<NoopEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string to, string subject, string html)
    {
        _logger.LogInformation("[Email] To: {To}, Subject: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    public Task SendWelcomeEmailAsync(string email, string fullName, string temporaryPassword, string activationToken)
    {
        _logger.LogInformation("[Email] Welcome to {FullName} at {Email} (password: {Password}, token: {Token})", fullName, email, temporaryPassword, activationToken);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string email, string fullName, string resetLink)
    {
        _logger.LogInformation("[Email] Password reset for {FullName} at {Email}: {ResetLink}", fullName, email, resetLink);
        return Task.CompletedTask;
    }

    public Task NotifyEmailFailedAsync(Guid userId, string email, string subject, string errorMessage)
    {
        _logger.LogWarning("[Email] Failed to {Email}: {Subject} - {Error}", email, subject, errorMessage);
        return Task.CompletedTask;
    }
}
