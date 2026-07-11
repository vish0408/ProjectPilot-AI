using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateSemesterRequestValidator : AbstractValidator<CreateSemesterRequest>
{
    public CreateSemesterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Number).GreaterThan(0);
        RuleFor(x => x.AcademicYearId).NotEmpty();
    }
}
