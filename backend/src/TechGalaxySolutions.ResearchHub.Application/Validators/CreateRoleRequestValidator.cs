using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Role;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateRoleRequestValidator : AbstractValidator<CreateRoleRequest>
{
    public CreateRoleRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
