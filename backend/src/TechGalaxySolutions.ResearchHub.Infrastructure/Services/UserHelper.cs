using System.Text;
using System.Text.RegularExpressions;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public static class UserHelper
{
    public static string GenerateRandomTemporaryPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        var random = Random.Shared;
        var password = new char[12];
        for (int i = 0; i < 12; i++)
            password[i] = chars[random.Next(chars.Length)];
        return new string(password);
    }

    public static string GenerateEmailVerificationToken()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        var length = 32;
        var code = new char[length];
        for (int i = 0; i < length; i++)
            code[i] = chars[random.Next(chars.Length)];
        return new string(code);
    }

    public static DateTime CalculatePasswordExpiry()
    {
        return DateTime.UtcNow.AddHours(72);
    }

    public static DateTime CalculateEmailVerificationExpiry()
    {
        return DateTime.UtcNow.AddHours(24);
    }

    public static bool IsTemporaryPasswordExpired(DateTime? expiresAt)
    {
        return expiresAt.HasValue && expiresAt.Value < DateTime.UtcNow;
    }

    public static string SanitizeEmailForLogging(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return string.Empty;

        var atIndex = email.IndexOf('@');
        if (atIndex < 2)
            return email;

        var localPart = email.Substring(0, atIndex);
        var domain = email.Substring(atIndex);

        if (localPart.Length <= 2)
            return "***" + domain;

        return localPart[0] + "****" + localPart[^1] + domain;
    }
}