using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Document;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateDocumentRequestValidator : AbstractValidator<CreateDocumentRequest>
{
    public CreateDocumentRequestValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required")
            .MaximumLength(500).WithMessage("File name must not exceed 500 characters");

        RuleFor(x => x.FileType)
            .NotEmpty().WithMessage("File type is required")
            .MaximumLength(100).WithMessage("File type must not exceed 100 characters");

        RuleFor(x => x.FileSize)
            .GreaterThanOrEqualTo(0).WithMessage("File size must be non-negative");
    }
}
