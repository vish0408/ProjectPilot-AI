namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string html);
    Task SendWelcomeEmailAsync(string email, string fullName, string temporaryPassword, string activationToken);
    Task SendPasswordResetEmailAsync(string email, string fullName, string resetLink);
    Task NotifyEmailFailedAsync(Guid userId, string email, string subject, string errorMessage);
}
