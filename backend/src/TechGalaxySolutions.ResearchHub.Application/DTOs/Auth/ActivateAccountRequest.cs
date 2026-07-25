using System.ComponentModel.DataAnnotations;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

public class ActivateAccountRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
