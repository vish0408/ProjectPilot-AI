using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateHodRequestValidator : AbstractValidator<UpdateHodRequest>
{
    public UpdateHodRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.EmployeeId).MaximumLength(50);
        RuleFor(x => x.Designation).MaximumLength(100);
        RuleFor(x => x.DepartmentId).NotEmpty();
    }
}
