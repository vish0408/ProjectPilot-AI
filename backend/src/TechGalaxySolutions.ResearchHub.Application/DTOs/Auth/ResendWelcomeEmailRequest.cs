using System.ComponentModel.DataAnnotations;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

public class ResendWelcomeEmailRequest
{
    [Required]
    public Guid UserId { get; set; }
}
