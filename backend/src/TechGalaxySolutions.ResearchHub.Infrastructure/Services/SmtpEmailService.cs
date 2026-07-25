using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TechGalaxySolutions.ResearchHub.Application.Configuration;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly FrontendSettings _frontend;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, IOptions<FrontendSettings> frontend, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _frontend = frontend.Value;
        _logger = logger;
    }

    public Task SendAsync(string to, string subject, string html)
    {
        return SendEmailAsync(to, subject, html);
    }

    public Task SendWelcomeEmailAsync(string email, string fullName, string temporaryPassword, string activationToken)
    {
        var subject = "Welcome to ResearchHub AI";
        var body = BuildWelcomeHtml(fullName, email, temporaryPassword, activationToken);
        return SendEmailAsync(email, subject, body);
    }

    public Task SendPasswordResetEmailAsync(string email, string fullName, string resetLink)
    {
        var subject = "Reset Your ResearchHub AI Password";
        var body = BuildResetPasswordHtml(fullName, resetLink);
        return SendEmailAsync(email, subject, body);
    }

    public async Task NotifyEmailFailedAsync(Guid userId, string email, string subject, string errorMessage)
    {
        _logger.LogWarning("Email to {Email} failed. Subject: {Subject}, Error: {Error}", email, subject, errorMessage);
        await Task.CompletedTask;
    }

    private async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        try
        {
            var smtpConfig = _configuration.GetSection("Smtp");
            var host = smtpConfig["Host"];
            var portStr = smtpConfig["Port"];
            var username = smtpConfig["Username"];
            var password = smtpConfig["Password"];
            var fromEmail = smtpConfig["FromEmail"];
            var fromName = smtpConfig["FromName"] ?? "ResearchHub AI";
            var useSslStr = smtpConfig["UseSsl"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(portStr))
            {
                _logger.LogWarning("SMTP not configured. Email to {Email} would have been sent. Subject: {Subject}", to, subject);
                return;
            }

            var port = int.Parse(portStr);
            var useSsl = string.IsNullOrEmpty(useSslStr) || bool.Parse(useSslStr);

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = useSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
            };

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                client.Credentials = new NetworkCredential(username, password);
            }

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail ?? username ?? "noreply@researchhub.ai", fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };
            message.To.Add(to);

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {Email}: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}: {Subject}", to, subject);
            throw;
        }
    }

    private string BuildWelcomeHtml(string fullName, string email, string temporaryPassword, string activationToken)
    {
        var baseUrl = _frontend.BaseUrl.TrimEnd('/');
        var activationUrl = $"{baseUrl}/activate?token={activationToken}";
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head><meta charset=""utf-8""/></head>
<body style=""font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;padding:20px;"">
<div style=""max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;"">
<h1 style=""color:#2563eb;"">Welcome to ResearchHub AI</h1>
<p>Dear {fullName},</p>
<p>Your account has been created. Activate it here:</p>
<p><a href=""{activationUrl}"" style=""display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;"">Activate Account</a></p>
<p>Email: {email}<br/>Temporary Password: <strong>{temporaryPassword}</strong></p>
<p>This link expires in 24 hours.</p>
<p>&copy; 2026 ResearchHub AI</p>
</div>
</body>
</html>";
    }

    private static string BuildResetPasswordHtml(string fullName, string resetLink)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head><meta charset=""utf-8""/></head>
<body style=""font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;padding:20px;"">
<div style=""max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;"">
<h1 style=""color:#2563eb;"">Reset Your Password</h1>
<p>Dear {fullName},</p>
<p>Click below to reset your password:</p>
<p><a href=""{resetLink}"" style=""display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;"">Reset Password</a></p>
<p>This link expires in 30 minutes.</p>
</div>
</body>
</html>";
    }
}
