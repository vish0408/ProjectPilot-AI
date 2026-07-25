using System.ComponentModel.DataAnnotations;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

public class ValidateActivationTokenRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;
}
