using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateDepartmentRequestValidator : AbstractValidator<CreateDepartmentRequest>
{
    public CreateDepartmentRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20);
        RuleFor(x => x.CollegeId).NotEmpty();
    }
}
