using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ChapterComment;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class AddChapterCommentRequestValidator : AbstractValidator<AddChapterCommentRequest>
{
    public AddChapterCommentRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content is required")
            .MaximumLength(5000).WithMessage("Comment must not exceed 5000 characters");
    }
}
