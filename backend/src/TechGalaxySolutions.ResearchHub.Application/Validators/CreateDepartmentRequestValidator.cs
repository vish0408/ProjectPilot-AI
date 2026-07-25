using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateDepartmentRequestValidator : AbstractValidator<CreateDepartmentRequest>
{
    public CreateDepartmentRequestValidator()
    {
        RuleFor(x => x.DepartmentName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DepartmentCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.ShortName).MaximumLength(20);
        RuleFor(x => x.CollegeId).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
