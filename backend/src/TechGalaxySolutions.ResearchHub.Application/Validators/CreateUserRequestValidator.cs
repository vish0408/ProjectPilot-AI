using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.RoleId).NotEmpty();
        RuleFor(x => x.CollegeId).NotEmpty().When(x => x.CollegeId.HasValue);
        RuleFor(x => x.DepartmentId).NotEmpty().When(x => x.DepartmentId.HasValue);
    }
}
