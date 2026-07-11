using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.RoleId).NotEmpty();
    }
}
