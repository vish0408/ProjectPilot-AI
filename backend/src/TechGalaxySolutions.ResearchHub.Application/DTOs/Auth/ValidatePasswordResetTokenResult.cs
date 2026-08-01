namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

public class ValidatePasswordResetTokenResult
{
    public bool Valid { get; set; }
    public bool Expired { get; set; }
    public bool Used { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public Guid? UserId { get; set; }
}
