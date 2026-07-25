using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateSemesterRequestValidator : AbstractValidator<UpdateSemesterRequest>
{
    public UpdateSemesterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Number).InclusiveBetween(1, 10);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
    }
}
