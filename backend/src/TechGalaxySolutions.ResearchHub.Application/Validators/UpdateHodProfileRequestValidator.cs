using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProfile;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateHodProfileRequestValidator : AbstractValidator<UpdateHodProfileRequest>
{
    public UpdateHodProfileRequestValidator()
    {
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.ContactEmail).EmailAddress().MaximumLength(255);
        RuleFor(x => x.Location).MaximumLength(200);
    }
}
