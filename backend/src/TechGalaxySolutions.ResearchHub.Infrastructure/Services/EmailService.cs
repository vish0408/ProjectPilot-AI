using System.Reflection;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using TechGalaxySolutions.ResearchHub.Application.Configuration;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtp;
    private readonly FrontendSettings _frontend;
    private readonly ILogger<EmailService> _logger;
    private readonly ApplicationDbContext _context;
    private readonly string _templateDir;

    public EmailService(IOptions<SmtpSettings> smtp, IOptions<FrontendSettings> frontend, ILogger<EmailService> logger, ApplicationDbContext context)
    {
        _smtp = smtp.Value;
        _frontend = frontend.Value;
        _logger = logger;
        _context = context;
        _templateDir = ResolveTemplateDirectory();
    }

    private static string ResolveTemplateDirectory()
    {
        var baseDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)
                      ?? AppContext.BaseDirectory;
        var templateDir = Path.Combine(baseDir, "Templates");
        if (Directory.Exists(templateDir))
            return templateDir;
        return Path.Combine(AppContext.BaseDirectory, "Templates");
    }

    private async Task<string> LoadTemplateAsync(string templateName)
    {
        var path = Path.Combine(_templateDir, templateName);
        if (!File.Exists(path))
            throw new FileNotFoundException($"Email template not found at expected path: {path}");
        var content = await File.ReadAllTextAsync(path);
        _logger.LogDebug("Loaded template {TemplateName} from {Path}", templateName, path);
        return content;
    }

    public async Task SendAsync(string to, string subject, string html)
    {
        var log = new EmailLog
        {
            ToEmail = to,
            Subject = subject,
            Status = "Pending",
            Retries = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<EmailLog>().Add(log);

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_smtp.FromName, _smtp.FromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = html };
            message.Body = builder.ToMessageBody();

            _logger.LogInformation("Connecting to SMTP server {Host}:{Port}...", _smtp.Host, _smtp.Port);

            using var client = new SmtpClient();
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            var secureOption = _smtp.UseSsl ? SecureSocketOptions.StartTlsWhenAvailable : SecureSocketOptions.Auto;
            await client.ConnectAsync(_smtp.Host, _smtp.Port, secureOption);
            _logger.LogInformation("Connected to {Host}:{Port}", _smtp.Host, _smtp.Port);

            if (!string.IsNullOrEmpty(_smtp.Username))
            {
                _logger.LogInformation("Authenticating as {Username}...", _smtp.Username);
                await client.AuthenticateAsync(_smtp.Username, _smtp.Password);
                _logger.LogInformation("Authenticated successfully");
            }

            _logger.LogInformation("Sending email to {To}: {Subject}...", to, subject);
            await client.SendAsync(message);
            _logger.LogInformation("Email sent successfully");

            _logger.LogInformation("Disconnecting from SMTP server...");
            await client.DisconnectAsync(true);
            _logger.LogInformation("Disconnected from SMTP server");

            log.Status = "Sent";
            log.SentAt = DateTime.UtcNow;
            _logger.LogInformation("Email delivered to {Email}: {Subject}", to, subject);
        }
        catch (SmtpCommandException ex)
        {
            log.Status = "Failed";
            log.ErrorMessage = $"SMTP command error [{ex.StatusCode}]: {ex.Message}";
            log.Retries = 1;
            _logger.LogError(ex, "SMTP command error while sending to {Email}: {Subject}", to, subject);
            throw new InvalidOperationException($"SMTP command error: {ex.Message}", ex);
        }
        catch (AuthenticationException ex)
        {
            log.Status = "Failed";
            log.ErrorMessage = $"SMTP authentication failed: {ex.Message}";
            log.Retries = 1;
            _logger.LogError(ex, "SMTP authentication failed for {Username}", _smtp.Username);
            throw new InvalidOperationException($"SMTP authentication failed. Check Smtp:Username and Smtp:Password.", ex);
        }
        catch (SmtpProtocolException ex)
        {
            log.Status = "Failed";
            log.ErrorMessage = $"SMTP protocol error: {ex.Message}";
            log.Retries = 1;
            _logger.LogError(ex, "SMTP protocol error while sending to {Email}: {Subject}", to, subject);
            throw new InvalidOperationException($"SMTP protocol error: {ex.Message}", ex);
        }
        catch (OperationCanceledException)
        {
            log.Status = "Failed";
            log.ErrorMessage = "SMTP connection timed out";
            log.Retries = 1;
            _logger.LogError("SMTP connection timed out for {Host}:{Port}", _smtp.Host, _smtp.Port);
            throw new InvalidOperationException($"SMTP connection timed out connecting to {_smtp.Host}:{_smtp.Port}. Check the host and port.");
        }
        catch (Exception ex)
        {
            log.Status = "Failed";
            log.ErrorMessage = ex.Message;
            log.Retries = 1;
            _logger.LogError(ex, "Failed to send email to {Email}: {Subject}", to, subject);
            throw new InvalidOperationException($"Email send failed: {ex.Message}", ex);
        }
        finally
        {
            await _context.SaveChangesAsync();
        }
    }

    public async Task SendWelcomeEmailAsync(string email, string fullName, string temporaryPassword, string activationToken)
    {
        var baseUrl = _frontend.BaseUrl.TrimEnd('/');
        var activationUrl = $"{baseUrl}/activate?token={activationToken}";
        var template = await LoadTemplateAsync("WelcomeEmail.html");
        var html = template
            .Replace("{{UserName}}", fullName)
            .Replace("{{Email}}", email)
            .Replace("{{TemporaryPassword}}", temporaryPassword)
            .Replace("{{ActivationLink}}", activationUrl);
        await SendAsync(email, "Welcome to ResearchHub AI – Activate Your Account", html);
    }

    public async Task SendPasswordResetEmailAsync(string email, string fullName, string resetLink)
    {
        var html = BuildPasswordResetHtml(fullName, resetLink);
        await SendAsync(email, "Reset Your ResearchHub AI Password", html);
    }

    public async Task NotifyEmailFailedAsync(Guid userId, string email, string subject, string errorMessage)
    {
        _logger.LogWarning("Email to {Email} failed after retries. Subject: {Subject}, Error: {Error}", email, subject, errorMessage);
        var log = new EmailLog
        {
            UserId = userId,
            ToEmail = email,
            Subject = subject,
            Status = "Failed",
            ErrorMessage = errorMessage,
            Retries = 0,
            SentAt = null
        };
        _context.Set<EmailLog>().Add(log);
        await _context.SaveChangesAsync();
    }

    private static string BuildPasswordResetHtml(string fullName, string resetLink)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head><meta charset=""utf-8""/><meta name=""viewport"" content=""width=device-width,initial-scale=1.0""/>
<style>
body {{ margin:0; padding:0; background-color:#f4f6f9; font-family:'Segoe UI',Arial,sans-serif; }}
.container {{ max-width:600px; margin:0 auto; padding:20px; }}
.header {{ background:linear-gradient(135deg,#2563eb,#4f46e5); border-radius:16px; padding:32px; text-align:center; }}
.header h1 {{ color:#ffffff; font-size:24px; margin:0; }}
.header p {{ color:rgba(255,255,255,0.85); font-size:14px; margin:8px 0 0; }}
.body {{ background:#ffffff; border-radius:16px; padding:32px; margin-top:-8px; }}
.btn {{ display:block; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:12px; padding:14px 24px; font-size:16px; font-weight:600; text-align:center; margin:20px 0; }}
.footer {{ text-align:center; padding:24px 16px; }}
.footer p {{ color:#94a3b8; font-size:12px; margin:0; }}
</style></head>
<body>
<div class=""container"">
<div class=""header"">
<h1>Reset Your Password</h1>
<p>ResearchHub AI</p>
</div>
<div class=""body"">
<p style=""color:#1e293b;font-size:16px;margin:0 0 16px;"">Dear <strong>{fullName}</strong>,</p>
<p style=""color:#475569;font-size:14px;margin:0 0 20px;"">Click the button below to reset your password. This link expires in 30 minutes.</p>
<a href=""{resetLink}"" class=""btn"">Reset Password</a>
<p style=""color:#64748b;font-size:13px;margin:16px 0 0;"">If you did not request a password reset, please ignore this email.</p>
</div>
<div class=""footer"">
<p>ResearchHub AI &copy; 2026</p>
</div>
</div>
</body>
</html>";
    }
}
