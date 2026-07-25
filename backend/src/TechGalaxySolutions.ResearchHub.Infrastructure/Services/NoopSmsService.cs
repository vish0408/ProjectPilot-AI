using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class NoopSmsService : ISmsService
{
    private readonly ILogger<NoopSmsService> _logger;

    public NoopSmsService(ILogger<NoopSmsService> logger)
    {
        _logger = logger;
    }

    public Task SendWelcomeMessageAsync(string phoneNumber, string fullName, string temporaryPassword)
    {
        _logger.LogInformation("[SMS] Welcome message to {FullName} at {PhoneNumber} (password: {Password})", fullName, phoneNumber, temporaryPassword);
        return Task.CompletedTask;
    }

    public Task SendTemporaryPasswordAsync(string phoneNumber, string fullName, string temporaryPassword)
    {
        _logger.LogInformation("[SMS] Temporary password for {FullName} at {PhoneNumber}", fullName, phoneNumber);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string phoneNumber, string fullName, string resetLink)
    {
        _logger.LogInformation("[SMS] Password reset for {FullName} at {PhoneNumber}: {ResetLink}", fullName, phoneNumber, resetLink);
        return Task.CompletedTask;
    }
}
