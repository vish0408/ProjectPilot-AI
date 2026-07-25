using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
