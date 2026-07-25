using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateHodRequestValidator : AbstractValidator<CreateHodRequest>
{
    public CreateHodRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.EmployeeId).MaximumLength(50);
        RuleFor(x => x.Designation).MaximumLength(100);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
        RuleFor(x => x.DepartmentId).NotEmpty();
    }
}
