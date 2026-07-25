namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

public class ValidatePasswordResetTokenResult
{
    public bool Valid { get; set; }
    public bool Expired { get; set; }
    public string? FullName { get; set; }
}
