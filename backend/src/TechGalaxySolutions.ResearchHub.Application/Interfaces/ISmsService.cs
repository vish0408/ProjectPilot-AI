namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ISmsService
{
    Task SendWelcomeMessageAsync(string phoneNumber, string fullName, string temporaryPassword);
    Task SendTemporaryPasswordAsync(string phoneNumber, string fullName, string temporaryPassword);
    Task SendPasswordResetAsync(string phoneNumber, string fullName, string resetLink);
}
