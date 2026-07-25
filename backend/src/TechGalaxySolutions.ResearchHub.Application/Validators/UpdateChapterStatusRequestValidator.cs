using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Chapter;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateChapterStatusRequestValidator : AbstractValidator<UpdateChapterStatusRequest>
{
    public UpdateChapterStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => s is "Draft" or "Submitted" or "UnderReview" or "Approved" or "Rejected" or "RevisionRequired")
            .WithMessage("Status must be one of: Draft, Submitted, UnderReview, Approved, Rejected, RevisionRequired");
        RuleFor(x => x.Comment).MaximumLength(2000);
    }
}
