using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AcademicYear;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateAcademicYearRequestValidator : AbstractValidator<UpdateAcademicYearRequest>
{
    public UpdateAcademicYearRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty();
    }
}
