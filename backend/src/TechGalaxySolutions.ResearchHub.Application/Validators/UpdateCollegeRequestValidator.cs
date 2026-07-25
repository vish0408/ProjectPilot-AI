using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.College;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateCollegeRequestValidator : AbstractValidator<UpdateCollegeRequest>
{
    public UpdateCollegeRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Address).MaximumLength(500);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.Email).EmailAddress().MaximumLength(255);
        RuleFor(x => x.Website).MaximumLength(255);
    }
}
