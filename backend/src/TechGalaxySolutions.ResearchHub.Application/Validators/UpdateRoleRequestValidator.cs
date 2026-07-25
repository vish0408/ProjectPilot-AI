using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Role;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateRoleRequestValidator : AbstractValidator<UpdateRoleRequest>
{
    public UpdateRoleRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
