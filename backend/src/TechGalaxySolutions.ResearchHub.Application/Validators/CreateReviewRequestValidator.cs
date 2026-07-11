using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Review;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .Must(s => s is "Approved" or "Rejected" or "ChangesRequested")
            .WithMessage("Status must be Approved, Rejected, or ChangesRequested");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters");
    }
}
