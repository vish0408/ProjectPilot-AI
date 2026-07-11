using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Project;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");
    }
}

public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    public UpdateProjectRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

        RuleFor(x => x.Status)
            .Must(s => s is "NotStarted" or "InProgress" or "Completed" or "OnHold")
            .WithMessage("Status must be NotStarted, InProgress, Completed, or OnHold");

        RuleFor(x => x.CompletionPercentage)
            .InclusiveBetween(0, 100).WithMessage("Completion percentage must be between 0 and 100");
    }
}
