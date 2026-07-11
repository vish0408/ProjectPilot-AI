using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideProfile;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateGuideProfileRequestValidator : AbstractValidator<UpdateGuideProfileRequest>
{
    public UpdateGuideProfileRequestValidator()
    {
        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required")
            .MaximumLength(100).WithMessage("Department must not exceed 100 characters");

        RuleFor(x => x.Institution)
            .NotEmpty().WithMessage("Institution is required")
            .MaximumLength(200).WithMessage("Institution must not exceed 200 characters");

        RuleFor(x => x.Specialization)
            .MaximumLength(200).WithMessage("Specialization must not exceed 200 characters");

        RuleFor(x => x.Designation)
            .MaximumLength(100).WithMessage("Designation must not exceed 100 characters");

        RuleFor(x => x.Bio)
            .MaximumLength(2000).WithMessage("Bio must not exceed 2000 characters");
    }
}
