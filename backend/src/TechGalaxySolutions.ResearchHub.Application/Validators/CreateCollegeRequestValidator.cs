using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.College;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateCollegeRequestValidator : AbstractValidator<CreateCollegeRequest>
{
    public CreateCollegeRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20);
    }
}
