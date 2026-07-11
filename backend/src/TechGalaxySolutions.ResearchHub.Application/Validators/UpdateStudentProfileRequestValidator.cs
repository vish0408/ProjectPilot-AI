using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.StudentProfile;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateStudentProfileRequestValidator : AbstractValidator<UpdateStudentProfileRequest>
{
    public UpdateStudentProfileRequestValidator()
    {
        RuleFor(x => x.Enrollment)
            .NotEmpty().WithMessage("Enrollment is required")
            .MaximumLength(50).WithMessage("Enrollment must not exceed 50 characters");

        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required")
            .MaximumLength(100).WithMessage("Department must not exceed 100 characters");

        RuleFor(x => x.Institution)
            .NotEmpty().WithMessage("Institution is required")
            .MaximumLength(200).WithMessage("Institution must not exceed 200 characters");
    }
}
