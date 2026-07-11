using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Milestone;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateMilestoneRequestValidator : AbstractValidator<CreateMilestoneRequest>
{
    public CreateMilestoneRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

        RuleFor(x => x.TargetDate)
            .NotEmpty().WithMessage("Target date is required");
    }
}
