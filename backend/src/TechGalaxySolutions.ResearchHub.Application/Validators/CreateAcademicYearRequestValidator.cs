using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AcademicYear;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateAcademicYearRequestValidator : AbstractValidator<CreateAcademicYearRequest>
{
    public CreateAcademicYearRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty();
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate).WithMessage("End date must be after start date.");
    }
}
